from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import openai
import numpy as np
from datetime import datetime, timedelta
from .config import get_settings
from .routes import asset_analysis
import time
from sentry_sdk.integrations.fastapi import FastApiIntegration
import sentry_sdk
from .utils.logger import setup_logger, log_request, log_error
from .middleware.security import setup_security_middleware
from .middleware.auth import create_access_token, get_current_user

# Load environment variables
load_dotenv()

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Sentry
settings = get_settings()
sentry_sdk.init(
    dsn=settings.sentry_dsn,
    environment=settings.environment,
    integrations=[
        FastApiIntegration(
            transaction_style="url",
            middleware_spans=True,
            send_default_pii=True,
        ),
    ],
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

# Initialize logger
logger = setup_logger('api')

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="AIQuira API",
        version=settings.api_version,
        description="""
        AIQuira API provides AI-powered M&A analysis and valuation services.
        
        ## Features
        * Asset valuation using AI
        * Document analysis
        * Risk assessment
        * Market analysis
        
        ## Authentication
        All endpoints except `/api/auth/*` require JWT authentication.
        Include the token in the Authorization header: `Bearer <token>`
        
        ## Rate Limiting
        API requests are limited to 60 requests per minute per IP.
        """,
        routes=app.routes,
    )

    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Add global security requirement
    openapi_schema["security"] = [{"Bearer": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Initialize FastAPI app
app = FastAPI(
    title="AIQuira API",
    description="AI-powered M&A platform API",
    version=settings.api_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.openapi = custom_openapi

# Setup security middleware
setup_security_middleware(app)

# Include routers
app.include_router(asset_analysis.router, prefix="/api/assets", tags=["assets"])

# Auth Models
class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: constr(min_length=8) = Field(..., description="User's password")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: constr(min_length=8) = Field(..., description="User's password")
    name: constr(min_length=2) = Field(..., description="User's full name")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "name": "John Doe"
            }
        }

class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type (always 'bearer')")

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "token_type": "bearer"
            }
        }

# Auth endpoints
@app.post(
    "/api/auth/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account and return an access token."
)
async def register(user: UserRegister):
    """
    Register a new user and return an access token.
    
    Args:
        user: User registration data
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: If registration fails
    """
    # TODO: Implement user registration with database
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post(
    "/api/auth/login",
    response_model=Token,
    summary="Login user",
    description="Authenticate user and return an access token."
)
async def login(user: UserLogin):
    """
    Authenticate user and return an access token.
    
    Args:
        user: User login credentials
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: If authentication fails
    """
    # TODO: Implement user authentication with database
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoints
@app.get(
    "/api/me",
    summary="Get current user",
    description="Retrieve information about the currently authenticated user."
)
async def read_users_me(current_user: Dict = Depends(get_current_user)):
    """
    Get information about the current user.
    
    Args:
        current_user: Current user data from token
        
    Returns:
        Dict: User information
        
    Raises:
        HTTPException: If user is not authenticated
    """
    return current_user

# Models
class ValuationRequest(BaseModel):
    asset_type: str
    asset_data: Dict
    market_data: Optional[Dict] = None

class ValuationResponse(BaseModel):
    valuation_amount: float
    confidence_score: float
    factors: Dict
    timestamp: datetime

class DocumentAnalysisRequest(BaseModel):
    document_type: str
    content: str

class DocumentAnalysisResponse(BaseModel):
    analysis: Dict
    risk_factors: List[Dict]
    recommendations: List[str]
    timestamp: datetime

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        log_request(request, response, duration)
        return response
    except Exception as e:
        duration = time.time() - start_time
        log_error(e, {
            'request_method': request.method,
            'request_url': str(request.url),
            'duration_ms': round(duration * 1000, 2),
        })
        raise

@app.get("/")
async def root():
    return {
        "message": "Welcome to AIQuira API",
        "version": settings.api_version,
        "environment": settings.environment,
    }

@app.post("/api/valuations", response_model=ValuationResponse)
async def generate_valuation(request: ValuationRequest):
    try:
        # Prepare prompt for GPT model
        prompt = f"""
        Analyze the following asset for valuation:
        Type: {request.asset_type}
        Data: {request.asset_data}
        Market Data: {request.market_data if request.market_data else 'Not provided'}
        
        Provide a detailed valuation analysis including:
        1. Estimated value
        2. Confidence score
        3. Key factors influencing the valuation
        """

        # Get response from GPT
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert M&A valuation analyst."},
                {"role": "user", "content": prompt}
            ]
        )

        # Process the response
        # Note: This is a simplified example. In production, you would implement
        # more sophisticated parsing and validation of the GPT response.
        analysis = response.choices[0].message.content

        # Simulate valuation calculation
        # In production, implement proper valuation models
        base_value = float(np.mean([v for v in request.asset_data.values() if isinstance(v, (int, float))]))
        confidence = 0.85  # Implement proper confidence calculation

        return ValuationResponse(
            valuation_amount=base_value,
            confidence_score=confidence,
            factors={
                "market_conditions": 0.8,
                "asset_quality": 0.9,
                "growth_potential": 0.7,
                "risk_factors": 0.6,
                "analysis": analysis
            },
            timestamp=datetime.now()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(request: DocumentAnalysisRequest):
    try:
        # Prepare prompt for GPT model
        prompt = f"""
        Analyze the following {request.document_type} document:
        {request.content}
        
        Provide:
        1. Key findings and analysis
        2. Risk factors
        3. Recommendations
        """

        # Get response from GPT
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert in document analysis for M&A transactions."},
                {"role": "user", "content": prompt}
            ]
        )

        # Process the response
        analysis = response.choices[0].message.content

        return DocumentAnalysisResponse(
            analysis={
                "summary": "Document analysis summary",
                "key_points": ["Point 1", "Point 2", "Point 3"],
                "detailed_analysis": analysis
            },
            risk_factors=[
                {"category": "Legal", "severity": "Medium", "description": "Legal risk description"},
                {"category": "Financial", "severity": "Low", "description": "Financial risk description"}
            ],
            recommendations=[
                "Recommendation 1",
                "Recommendation 2",
                "Recommendation 3"
            ],
            timestamp=datetime.now()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 