from fastapi import FastAPI, HTTPException, Depends, Security, BackgroundTasks, Request, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import jwt
from jwt import PyJWTError
import json
from pathlib import Path
import bcrypt
import secrets
import pyotp
import qrcode
import base64
from io import BytesIO
import os

from .investor_profile import InvestorProfile, InvestorProfileManager, Badge, InvestmentHistory
from .alert_manager import AlertManager, Alert
from .market_intelligence import MarketIntelligence
from .content_manager import ContentManager, ContentItem, Comment, ContentTag, ContentAuthor

app = FastAPI(
    title="Investment Platform API",
    description="API for managing investor profiles, opportunities, and alerts",
    version="1.0.0"
)

# Security
SECRET_KEY = "your-secret-key"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models for request/response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class InvestorProfileCreate(BaseModel):
    name: str
    sectors_of_interest: List[str]
    investment_range: Dict[str, float]
    preferred_locations: List[str]
    expertise_areas: List[str]
    risk_profile: str
    preferred_deal_types: List[str]

class OpportunityCreate(BaseModel):
    name: str
    sector: str
    investment_amount: float
    location: str
    deal_type: str
    description: str
    risk_level: str = "moderate"
    urgent: bool = False
    competitive_situation: bool = False
    additional_data: Optional[Dict] = None

class AlertPreferences(BaseModel):
    min_match_score: float = Field(0.6, ge=0.0, le=1.0)
    enable_followup: bool = True
    notification_channels: List[str] = ["email"]
    alert_frequency: str = "realtime"

# Initialize managers
profile_manager = InvestorProfileManager()
alert_manager = AlertManager(email_config={
    "smtp_server": "smtp.example.com",
    "smtp_port": 587,
    "username": "alerts@example.com",
    "password": "your-password",
    "sender": "Investment Platform <alerts@example.com>"
})

# Initialize market intelligence
market_intelligence = MarketIntelligence(config={
    "TWITTER_BEARER_TOKEN": os.getenv("TWITTER_BEARER_TOKEN"),
    "TWITTER_API_KEY": os.getenv("TWITTER_API_KEY"),
    "TWITTER_API_SECRET": os.getenv("TWITTER_API_SECRET"),
    "TWITTER_ACCESS_TOKEN": os.getenv("TWITTER_ACCESS_TOKEN"),
    "TWITTER_ACCESS_SECRET": os.getenv("TWITTER_ACCESS_SECRET"),
    "LINKEDIN_ACCESS_TOKEN": os.getenv("LINKEDIN_ACCESS_TOKEN")
})

# Initialize content manager
content_manager = ContentManager(market_intelligence)

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_investor(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        investor_id: str = payload.get("sub")
        if investor_id is None:
            raise credentials_exception
        return investor_id
    except PyJWTError:
        raise credentials_exception

# API Routes
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # In production, validate credentials against database
    investor_id = "test_investor"  # Replace with actual validation
    access_token = create_access_token({"sub": investor_id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/investors/profile")
async def create_investor_profile(
    profile: InvestorProfileCreate,
    current_investor: str = Depends(get_current_investor)
):
    """Create a new investor profile."""
    investor_profile = InvestorProfile(
        id=current_investor,
        name=profile.name,
        sectors_of_interest=profile.sectors_of_interest,
        investment_range=profile.investment_range,
        preferred_locations=profile.preferred_locations,
        investment_history=[],
        badges=[],
        expertise_areas=profile.expertise_areas,
        risk_profile=profile.risk_profile,
        preferred_deal_types=profile.preferred_deal_types
    )
    
    profile_manager.save_profile(investor_profile)
    return {"status": "success", "profile_id": current_investor}

@app.get("/investors/profile")
async def get_investor_profile(current_investor: str = Depends(get_current_investor)):
    """Get current investor's profile."""
    try:
        profile = profile_manager.load_profile(current_investor)
        return profile
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

@app.put("/investors/profile/badges")
async def update_investor_badges(
    current_investor: str = Depends(get_current_investor)
):
    """Update investor's badges based on their history."""
    try:
        profile = profile_manager.load_profile(current_investor)
        new_badges = profile_manager.update_badges(profile)
        profile.badges = new_badges
        profile_manager.save_profile(profile)
        return {"status": "success", "badges": new_badges}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

@app.post("/opportunities")
async def create_opportunity(
    opportunity: OpportunityCreate,
    current_investor: str = Depends(get_current_investor)
):
    """Create a new investment opportunity and match with investors."""
    opp_dict = opportunity.dict()
    opp_dict["id"] = f"opp_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Find matching investors
    all_profiles = []  # In production, load from database
    matches = profile_manager.match_opportunity(opp_dict, all_profiles)
    
    # Create alerts for matching investors
    alerts = []
    for investor, score, reasons in matches:
        if score >= 0.6:  # Minimum match threshold
            alert = alert_manager.create_alert(
                investor=investor,
                opportunity=opp_dict,
                match_score=score,
                additional_data=opportunity.additional_data
            )
            if alert:
                alerts.append(alert.id)
    
    return {
        "status": "success",
        "opportunity_id": opp_dict["id"],
        "matches": len(matches),
        "alerts_created": len(alerts)
    }

@app.get("/alerts")
async def get_investor_alerts(
    include_expired: bool = False,
    current_investor: str = Depends(get_current_investor)
):
    """Get all alerts for the current investor."""
    alerts = alert_manager.get_investor_alerts(current_investor, include_expired)
    return {"alerts": alerts}

@app.get("/alerts/statistics")
async def get_alert_statistics(
    current_investor: str = Depends(get_current_investor)
):
    """Get alert statistics for the current investor."""
    stats = alert_manager.get_alert_statistics(current_investor)
    return stats

@app.put("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    current_investor: str = Depends(get_current_investor)
):
    """Mark an alert as read."""
    alert = alert_manager.alerts.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.investor_id != current_investor:
        raise HTTPException(status_code=403, detail="Not authorized to modify this alert")
    
    alert_manager.mark_alert_read(alert_id)
    return {"status": "success"}

@app.put("/investors/alert-preferences")
async def update_alert_preferences(
    preferences: AlertPreferences,
    current_investor: str = Depends(get_current_investor)
):
    """Update alert preferences for the current investor."""
    alert_manager.save_alert_preferences(current_investor, preferences.dict())
    return {"status": "success"}

@app.get("/investors/matches")
async def get_investor_matches(
    sector: Optional[str] = None,
    min_score: float = 0.6,
    current_investor: str = Depends(get_current_investor)
):
    """Get matching opportunities for the current investor."""
    try:
        profile = profile_manager.load_profile(current_investor)
        # In production, load opportunities from database
        opportunities = []  # Replace with actual opportunities
        
        if sector:
            opportunities = [opp for opp in opportunities if opp["sector"] == sector]
        
        matches = []
        for opp in opportunities:
            match_result = profile_manager.match_opportunity(opp, [profile])
            if match_result and match_result[0][1] >= min_score:
                matches.append({
                    "opportunity": opp,
                    "score": match_result[0][1],
                    "reasons": match_result[0][2]
                })
        
        return {"matches": matches}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

# Enhanced Security Configuration
class SecurityConfig:
    SECRET_KEY = "your-secret-key"  # In production, use environment variable
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    PASSWORD_SALT = b"your-salt"  # In production, use environment variable
    MFA_ISSUER = "Investment Platform"

# Enhanced Pydantic Models
class UserAuth(BaseModel):
    email: str
    password: str
    mfa_code: Optional[str] = None

class RefreshToken(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class InvestmentHistoryCreate(BaseModel):
    company_name: str
    sector: str
    amount: float
    date: datetime
    exit_date: Optional[datetime] = None
    exit_amount: Optional[float] = None
    details: Optional[Dict] = None

class OpportunityFilter(BaseModel):
    sectors: Optional[List[str]] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    locations: Optional[List[str]] = None
    deal_types: Optional[List[str]] = None
    risk_levels: Optional[List[str]] = None

# Enhanced Security Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), SecurityConfig.PASSWORD_SALT).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_tokens(investor_id: str, scopes: List[str] = None):
    access_token_expires = datetime.utcnow() + timedelta(minutes=SecurityConfig.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = datetime.utcnow() + timedelta(days=SecurityConfig.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token({
        "sub": investor_id,
        "scopes": scopes or [],
        "exp": access_token_expires
    })
    
    refresh_token = secrets.token_urlsafe(32)
    # Store refresh token in database with expiration
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# New API Routes
@app.post("/auth/register")
async def register(
    auth: UserAuth,
    background_tasks: BackgroundTasks
):
    """Register a new investor with MFA setup."""
    # Check if email already exists
    # In production, check against database
    
    # Generate MFA secret
    mfa_secret = pyotp.random_base32()
    totp = pyotp.TOTP(mfa_secret)
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    provisioning_uri = totp.provisioning_uri(
        auth.email,
        issuer_name=SecurityConfig.MFA_ISSUER
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code = base64.b64encode(buffered.getvalue()).decode()
    
    # Store user data securely
    hashed_password = hash_password(auth.password)
    investor_id = f"inv_{secrets.token_hex(8)}"
    
    # In production, save to database:
    # - investor_id
    # - email
    # - hashed_password
    # - mfa_secret
    
    return {
        "status": "success",
        "investor_id": investor_id,
        "mfa_qr": qr_code,
        "mfa_secret": mfa_secret  # In production, show only once during setup
    }

@app.post("/auth/login")
async def login(auth: UserAuth):
    """Enhanced login with MFA verification."""
    # In production, get from database
    stored_password = "..."  # hashed password
    mfa_secret = "..."  # stored MFA secret
    
    if not verify_password(auth.password, stored_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    
    # Verify MFA code
    if not auth.mfa_code:
        raise HTTPException(
            status_code=400,
            detail="MFA code required"
        )
    
    totp = pyotp.TOTP(mfa_secret)
    if not totp.verify(auth.mfa_code):
        raise HTTPException(
            status_code=401,
            detail="Invalid MFA code"
        )
    
    return create_tokens(investor_id="test_investor")

@app.post("/auth/refresh")
async def refresh_token(token: RefreshToken):
    """Refresh access token using refresh token."""
    # In production, validate refresh token against database
    # Check if token is valid and not expired
    
    return create_tokens(investor_id="test_investor")

@app.put("/investors/password")
async def change_password(
    password_change: PasswordChange,
    current_investor: str = Depends(get_current_investor)
):
    """Change investor's password."""
    # In production, get from database
    stored_password = "..."  # hashed password
    
    if not verify_password(password_change.old_password, stored_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid current password"
        )
    
    new_hashed_password = hash_password(password_change.new_password)
    # In production, update password in database
    
    return {"status": "success"}

@app.post("/investors/investment-history")
async def add_investment_history(
    investment: InvestmentHistoryCreate,
    current_investor: str = Depends(get_current_investor)
):
    """Add new investment to investor's history."""
    try:
        profile = profile_manager.load_profile(current_investor)
        
        new_investment = InvestmentHistory(
            company_name=investment.company_name,
            sector=investment.sector,
            amount=investment.amount,
            date=investment.date,
            exit_date=investment.exit_date,
            exit_amount=investment.exit_amount
        )
        
        profile.investment_history.append(new_investment)
        profile_manager.save_profile(profile)
        
        # Update badges after new investment
        new_badges = profile_manager.update_badges(profile)
        
        return {
            "status": "success",
            "new_badges": new_badges
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

@app.get("/opportunities/search")
async def search_opportunities(
    filters: OpportunityFilter,
    current_investor: str = Depends(get_current_investor)
):
    """Search opportunities with advanced filters."""
    # In production, get from database
    opportunities = []  # Replace with actual opportunities
    
    filtered_opps = opportunities
    
    if filters.sectors:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["sector"] in filters.sectors
        ]
    
    if filters.min_amount is not None:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["investment_amount"] >= filters.min_amount
        ]
    
    if filters.max_amount is not None:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["investment_amount"] <= filters.max_amount
        ]
    
    if filters.locations:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["location"] in filters.locations
        ]
    
    if filters.deal_types:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["deal_type"] in filters.deal_types
        ]
    
    if filters.risk_levels:
        filtered_opps = [
            opp for opp in filtered_opps
            if opp["risk_level"] in filters.risk_levels
        ]
    
    return {"opportunities": filtered_opps}

@app.get("/investors/recommendations")
async def get_recommendations(
    current_investor: str = Depends(get_current_investor)
):
    """Get personalized investment recommendations."""
    try:
        profile = profile_manager.load_profile(current_investor)
        # In production, get from database
        opportunities = []  # Replace with actual opportunities
        
        # Get matches with enhanced algorithm
        matches = profile_manager.match_opportunity(
            {"type": "recommendation_request"},
            [profile]
        )
        
        recommendations = []
        for opp, score, reasons in matches:
            if score >= 0.7:  # Higher threshold for recommendations
                recommendations.append({
                    "opportunity": opp,
                    "score": score,
                    "reasons": reasons
                })
        
        return {
            "recommendations": recommendations,
            "total": len(recommendations)
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

@app.get("/investors/network")
async def get_investor_network(
    current_investor: str = Depends(get_current_investor)
):
    """Get investor's network and co-investment opportunities."""
    try:
        profile = profile_manager.load_profile(current_investor)
        
        # In production, get from database
        network = []  # Replace with actual network data
        co_investment_opportunities = []  # Replace with actual opportunities
        
        return {
            "network_size": len(network),
            "co_investment_opportunities": co_investment_opportunities,
            "network_strength": calculate_network_strength(profile)
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

# Market Intelligence Routes
@app.get("/market-intelligence/report")
async def get_market_report(
    sectors: Optional[List[str]] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_investor: str = Depends(get_current_investor)
):
    """Generate a comprehensive market intelligence report."""
    try:
        report = await market_intelligence.generate_market_report(
            sectors=sectors,
            start_date=start_date,
            end_date=end_date
        )
        return report
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating market report: {str(e)}"
        )

@app.get("/market-intelligence/trends")
async def get_market_trends(
    sectors: Optional[List[str]] = Query(None),
    current_investor: str = Depends(get_current_investor)
):
    """Get current market trends and sentiment analysis."""
    try:
        news_data = await market_intelligence.collect_news_data(sectors=sectors)
        social_data = await market_intelligence.collect_social_data(sectors=sectors)
        platform_metrics = market_intelligence.analyze_platform_metrics(sectors=sectors)
        
        sector_metrics = {}
        for sector in (sectors or market_intelligence.get_all_sectors()):
            metrics = market_intelligence.calculate_sector_metrics(
                sector,
                news_data,
                social_data,
                platform_metrics
            )
            sector_metrics[sector] = metrics
        
        trends = market_intelligence.analyze_trends(sector_metrics)
        return {
            "trends": trends,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing market trends: {str(e)}"
        )

@app.get("/market-intelligence/sentiment/{sector}")
async def get_sector_sentiment(
    sector: str,
    days: Optional[int] = Query(30, ge=1, le=365),
    current_investor: str = Depends(get_current_investor)
):
    """Get sentiment analysis for a specific sector."""
    try:
        start_date = datetime.now() - timedelta(days=days)
        news_data = await market_intelligence.collect_news_data(
            sectors=[sector],
            start_date=start_date
        )
        social_data = await market_intelligence.collect_social_data(
            sectors=[sector],
            start_date=start_date
        )
        
        # Calculate sentiment metrics
        sentiment_scores = []
        for article in news_data:
            sentiment_scores.append({
                "date": article["publish_date"],
                "score": article["sentiment_score"],
                "source": "news",
                "title": article["title"]
            })
        
        for tweet in social_data["twitter"]:
            sentiment_scores.append({
                "date": tweet["created_at"],
                "score": tweet["sentiment_score"],
                "source": "twitter",
                "text": tweet["text"]
            })
        
        # Sort by date
        sentiment_scores.sort(key=lambda x: x["date"])
        
        return {
            "sector": sector,
            "period": {
                "start": start_date.isoformat(),
                "end": datetime.now().isoformat()
            },
            "sentiment_trend": sentiment_scores,
            "average_sentiment": sum(s["score"] for s in sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing sector sentiment: {str(e)}"
        )

@app.get("/market-intelligence/recommendations")
async def get_market_recommendations(
    sectors: Optional[List[str]] = Query(None),
    current_investor: str = Depends(get_current_investor)
):
    """Get personalized market recommendations."""
    try:
        # Get investor profile for personalization
        profile = profile_manager.load_profile(current_investor)
        
        # Generate market report
        report = await market_intelligence.generate_market_report(sectors=sectors)
        
        # Get recommendations
        recommendations = market_intelligence.generate_recommendations(
            report["sector_analysis"]
        )
        
        # Filter and sort recommendations based on investor preferences
        filtered_recommendations = []
        for rec in recommendations:
            if rec["sector"] in profile.sectors_of_interest:
                # Add relevance score based on investor preferences
                rec["relevance_score"] = 1.0
                if rec["sector"] in profile.expertise_areas:
                    rec["relevance_score"] += 0.2
                filtered_recommendations.append(rec)
        
        # Sort by relevance
        filtered_recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return {
            "recommendations": filtered_recommendations,
            "based_on_profile": True,
            "last_updated": datetime.now().isoformat()
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # In production, implement proper rate limiting
    # Example: Use Redis to track request counts
    response = await call_next(request)
    return response

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )

@app.post("/api/content", response_model=ContentItem)
async def create_content(
    title: str,
    content: str,
    author_id: str,
    content_type: str,
    tags: List[str],
    summary: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Create new content (article, blog post, or forum post)."""
    return content_manager.create_content(
        title=title,
        content=content,
        author_id=author_id,
        content_type=content_type,
        tags=tags,
        summary=summary
    )

@app.get("/api/content/{content_id}", response_model=ContentItem)
async def get_content(content_id: str):
    """Get content by ID."""
    # In production, implement database lookup
    pass

@app.post("/api/content/{content_id}/comment", response_model=Comment)
async def add_comment(
    content_id: str,
    text: str,
    parent_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Add a comment to content."""
    return content_manager.add_comment(
        content_id=content_id,
        author_id=current_user.id,
        text=text,
        parent_id=parent_id
    )

@app.post("/api/tags", response_model=ContentTag)
async def create_tag(
    name: str,
    category: str,
    current_user: User = Depends(get_current_user)
):
    """Create a new content tag."""
    return content_manager.create_tag(name=name, category=category)

@app.post("/api/authors", response_model=ContentAuthor)
async def create_author(
    name: str,
    title: str,
    bio: str,
    expertise_areas: List[str],
    company: Optional[str] = None,
    avatar_url: Optional[str] = None,
    social_links: Optional[Dict[str, str]] = None,
    current_user: User = Depends(get_current_user)
):
    """Create a new content author."""
    return content_manager.create_author(
        name=name,
        title=title,
        bio=bio,
        expertise_areas=expertise_areas,
        company=company,
        avatar_url=avatar_url,
        social_links=social_links
    )

@app.get("/api/content/trending", response_model=List[Dict])
async def get_trending_topics():
    """Get trending topics."""
    return content_manager.get_trending_topics()

@app.get("/api/content/{content_id}/related", response_model=List[ContentItem])
async def get_related_content(content_id: str):
    """Get related content suggestions."""
    content_item = await get_content(content_id)
    return content_manager.generate_related_content(content_item)

@app.get("/api/content/{content_id}/performance", response_model=Dict)
async def get_content_performance(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get content performance metrics."""
    content_item = await get_content(content_id)
    return content_manager.analyze_content_performance(content_item)

@app.post("/api/content/from-report", response_model=ContentItem)
async def create_article_from_report(
    report: Dict,
    current_user: User = Depends(get_current_user)
):
    """Create an article from a market intelligence report."""
    return await content_manager.create_article_from_report(report) 