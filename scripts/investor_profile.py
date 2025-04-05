from typing import List, Dict, Optional, Set
from dataclasses import dataclass
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
from pathlib import Path

@dataclass
class InvestmentHistory:
    company_name: str
    sector: str
    amount: float
    date: datetime
    exit_date: Optional[datetime] = None
    exit_amount: Optional[float] = None

@dataclass
class Badge:
    name: str
    description: str
    icon: str
    category: str
    level: int  # 1-5 for different levels of achievement
    requirements: Dict[str, any]

@dataclass
class InvestorProfile:
    id: str
    name: str
    sectors_of_interest: List[str]
    investment_range: Dict[str, float]  # min and max investment amounts
    preferred_locations: List[str]
    investment_history: List[InvestmentHistory]
    badges: List[Badge]
    expertise_areas: List[str]
    risk_profile: str  # conservative, moderate, aggressive
    preferred_deal_types: List[str]
    private_alerts: bool = True

class InvestorProfileManager:
    def __init__(self):
        """Initialize the Investor Profile Manager."""
        self.badges_catalog = self._initialize_badges()
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.sector_vectors = {}
        self._initialize_sector_vectors()

    def _initialize_badges(self) -> Dict[str, Badge]:
        """Initialize the catalog of available badges."""
        badges = {
            "tech_pioneer": Badge(
                name="Tech Pioneer",
                description="Successfully invested in multiple technology companies",
                icon="🚀",
                category="sector_expertise",
                level=1,
                requirements={"tech_investments": 2}
            ),
            "tech_veteran": Badge(
                name="Tech Veteran",
                description="Proven track record in technology investments",
                icon="💻",
                category="sector_expertise",
                level=3,
                requirements={"tech_investments": 5}
            ),
            "tech_mogul": Badge(
                name="Tech Mogul",
                description="Elite technology investor",
                icon="⭐",
                category="sector_expertise",
                level=5,
                requirements={"tech_investments": 10}
            ),
            "quick_exit": Badge(
                name="Quick Exit Artist",
                description="Achieved successful exits within 3 years",
                icon="🏃",
                category="performance",
                level=2,
                requirements={"quick_exits": 2}
            ),
            "high_returns": Badge(
                name="High Returns Champion",
                description="Achieved over 3x returns on multiple investments",
                icon="📈",
                category="performance",
                level=4,
                requirements={"high_return_exits": 3}
            ),
            "sector_specialist": Badge(
                name="Sector Specialist",
                description="Deep expertise in specific sectors",
                icon="🎯",
                category="expertise",
                level=3,
                requirements={"same_sector_investments": 4}
            ),
            "global_investor": Badge(
                name="Global Investor",
                description="Investments across multiple countries",
                icon="🌍",
                category="geography",
                level=2,
                requirements={"countries": 3}
            ),
            "verified_buyer": Badge(
                name="Verified Buyer",
                description="Completed multiple acquisitions",
                icon="✅",
                category="verification",
                level=1,
                requirements={"total_investments": 3}
            ),
            "value_investor": Badge(
                name="Value Investor",
                description="Specializes in undervalued companies with strong fundamentals",
                icon="💎",
                category="strategy",
                level=3,
                requirements={"value_investments": 3}
            ),
            "growth_hunter": Badge(
                name="Growth Hunter",
                description="Focus on high-growth potential companies",
                icon="🚀",
                category="strategy",
                level=3,
                requirements={"growth_investments": 3}
            ),
            "green_investor": Badge(
                name="Green Investor",
                description="Invested in sustainable and environmental projects",
                icon="🌱",
                category="impact",
                level=2,
                requirements={"green_investments": 2}
            ),
            "social_impact": Badge(
                name="Social Impact Pioneer",
                description="Investments contributing to social causes",
                icon="🤝",
                category="impact",
                level=2,
                requirements={"social_investments": 2}
            ),
            "fintech_expert": Badge(
                name="FinTech Expert",
                description="Specialized in financial technology investments",
                icon="💳",
                category="sector_expertise",
                level=3,
                requirements={"fintech_investments": 4}
            ),
            "ai_visionary": Badge(
                name="AI Visionary",
                description="Track record in AI and ML companies",
                icon="🤖",
                category="sector_expertise",
                level=3,
                requirements={"ai_investments": 3}
            ),
            "unicorn_hunter": Badge(
                name="Unicorn Hunter",
                description="Invested in companies that reached $1B+ valuation",
                icon="🦄",
                category="performance",
                level=5,
                requirements={"unicorn_investments": 1}
            ),
            "early_believer": Badge(
                name="Early Believer",
                description="Successful early-stage investments",
                icon="🌟",
                category="performance",
                level=3,
                requirements={"early_stage_exits": 2}
            ),
            "deal_maker": Badge(
                name="Master Deal Maker",
                description="High number of successful deal closures",
                icon="🤝",
                category="network",
                level=4,
                requirements={"successful_deals": 10}
            ),
            "co_investor": Badge(
                name="Co-Investment Pro",
                description="Strong track record of successful co-investments",
                icon="👥",
                category="network",
                level=3,
                requirements={"co_investments": 5}
            ),
        }
        
        # Merge with existing badges
        badges.update(self.badges_catalog)
        return badges

    def _initialize_sector_vectors(self):
        """Initialize sector vectors for matching."""
        sectors = {
            "technology": """software hardware IT cybersecurity cloud computing 
                           artificial intelligence machine learning data analytics""",
            "e-commerce": """online retail digital marketplace e-commerce platform 
                           online shopping digital sales b2c b2b""",
            "tourism": """travel hospitality hotels tourism booking accommodation 
                        vacation leisure entertainment""",
            "healthcare": """medical health healthcare biotech pharma medicine 
                           wellness digital health telemedicine""",
            "fintech": """financial technology banking payments cryptocurrency 
                         blockchain digital payments mobile payments""",
            "real_estate": """property real estate construction development 
                            commercial residential proptech""",
            "manufacturing": """industrial manufacturing production automation 
                              industry 4.0 smart factory""",
            "education": """edtech education learning training courses 
                          online learning e-learning""",
        }
        
        # Create TF-IDF vectors for each sector
        texts = list(sectors.values())
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        for sector, vector in zip(sectors.keys(), tfidf_matrix):
            self.sector_vectors[sector] = vector.toarray()[0]

    def calculate_sector_similarity(self, sector1: str, sector2: str) -> float:
        """Calculate similarity between two sectors."""
        if sector1 not in self.sector_vectors or sector2 not in self.sector_vectors:
            return 0.0
        
        vec1 = self.sector_vectors[sector1].reshape(1, -1)
        vec2 = self.sector_vectors[sector2].reshape(1, -1)
        return cosine_similarity(vec1, vec2)[0][0]

    def update_badges(self, profile: InvestorProfile) -> List[Badge]:
        """Update badges based on investor's history and achievements."""
        new_badges = []
        sector_counts = {}
        quick_exits = 0
        high_return_exits = 0
        countries = set()

        for investment in profile.investment_history:
            # Count investments by sector
            sector_counts[investment.sector] = sector_counts.get(investment.sector, 0) + 1
            
            # Check for quick exits
            if investment.exit_date:
                duration = (investment.exit_date - investment.date).days / 365
                if duration <= 3:
                    quick_exits += 1
                
                # Check for high returns
                if investment.exit_amount and investment.amount:
                    if investment.exit_amount / investment.amount >= 3:
                        high_return_exits += 1

        # Check badge requirements
        tech_investments = sector_counts.get("technology", 0)
        max_sector_investments = max(sector_counts.values()) if sector_counts else 0
        total_investments = len(profile.investment_history)

        # Award badges based on achievements
        if tech_investments >= 2:
            new_badges.append(self.badges_catalog["tech_pioneer"])
        if tech_investments >= 5:
            new_badges.append(self.badges_catalog["tech_veteran"])
        if tech_investments >= 10:
            new_badges.append(self.badges_catalog["tech_mogul"])
        if quick_exits >= 2:
            new_badges.append(self.badges_catalog["quick_exit"])
        if high_return_exits >= 3:
            new_badges.append(self.badges_catalog["high_returns"])
        if max_sector_investments >= 4:
            new_badges.append(self.badges_catalog["sector_specialist"])
        if len(countries) >= 3:
            new_badges.append(self.badges_catalog["global_investor"])
        if total_investments >= 3:
            new_badges.append(self.badges_catalog["verified_buyer"])

        return new_badges

    def match_opportunity(self, opportunity: Dict, investors: List[InvestorProfile]) -> List[tuple]:
        """Enhanced matching algorithm with additional criteria."""
        matches = []
        
        for investor in investors:
            score = 0.0
            reasons = []
            
            # Sector match (40% weight)
            sector_match = max(
                self.calculate_sector_similarity(opportunity["sector"], interest)
                for interest in investor.sectors_of_interest
            )
            score += sector_match * 0.4
            if sector_match > 0.5:
                reasons.append(f"Sector alignment: {sector_match:.1%}")
            
            # Investment range (20% weight)
            if (opportunity["investment_amount"] >= investor.investment_range["min"] and
                opportunity["investment_amount"] <= investor.investment_range["max"]):
                score += 0.2
                reasons.append("Investment amount within preferred range")
            
            # Location preference (10% weight)
            if opportunity["location"] in investor.preferred_locations:
                score += 0.1
                reasons.append("Preferred location match")
            
            # Deal type (10% weight)
            if opportunity["deal_type"] in investor.preferred_deal_types:
                score += 0.1
                reasons.append("Preferred deal type match")
            
            # New: Past success in sector (10% weight)
            sector_success = self._calculate_sector_success(investor, opportunity["sector"])
            score += sector_success * 0.1
            if sector_success > 0:
                reasons.append(f"Previous success in sector: {sector_success:.1%}")
            
            # New: Risk profile alignment (5% weight)
            risk_score = self._calculate_risk_alignment(investor, opportunity)
            score += risk_score * 0.05
            if risk_score > 0.5:
                reasons.append("Risk profile alignment")
            
            # New: Co-investment potential (5% weight)
            if opportunity.get("co_investment_opportunity", False):
                co_investment_score = self._calculate_co_investment_fit(investor)
                score += co_investment_score * 0.05
                if co_investment_score > 0.5:
                    reasons.append("Strong co-investment fit")
            
            if score > 0.6:  # Only include strong matches
                matches.append((investor, score, reasons))
        
        return sorted(matches, key=lambda x: x[1], reverse=True)

    def _calculate_sector_success(self, investor: InvestorProfile, sector: str) -> float:
        """Calculate investor's success rate in a specific sector."""
        sector_investments = [
            inv for inv in investor.investment_history
            if inv.sector == sector and inv.exit_amount
        ]
        
        if not sector_investments:
            return 0.0
        
        successful_exits = sum(
            1 for inv in sector_investments
            if inv.exit_amount and inv.exit_amount > inv.amount * 2
        )
        
        return successful_exits / len(sector_investments)

    def _calculate_risk_alignment(self, investor: InvestorProfile, opportunity: Dict) -> float:
        """Calculate alignment between investor's risk profile and opportunity risk."""
        risk_scores = {
            "conservative": 0.3,
            "moderate": 0.6,
            "aggressive": 0.9
        }
        
        opportunity_risk = opportunity.get("risk_level", "moderate")
        investor_risk = risk_scores.get(investor.risk_profile, 0.6)
        opportunity_risk_score = risk_scores.get(opportunity_risk, 0.6)
        
        return 1.0 - abs(investor_risk - opportunity_risk_score)

    def _calculate_co_investment_fit(self, investor: InvestorProfile) -> float:
        """Calculate investor's suitability for co-investment opportunities."""
        co_investments = sum(
            1 for inv in investor.investment_history
            if inv.exit_amount and "co_investment" in inv.company_name.lower()
        )
        
        if co_investments >= 5:
            return 1.0
        elif co_investments >= 3:
            return 0.8
        elif co_investments >= 1:
            return 0.5
        return 0.2

    def generate_private_alert(self, opportunity: Dict, investor: InvestorProfile) -> Dict:
        """Generate personalized alert for an investor."""
        return {
            "investor_id": investor.id,
            "opportunity_id": opportunity["id"],
            "title": f"New {opportunity['sector']} Investment Opportunity",
            "description": f"""Exclusive opportunity matching your investment profile:
                             {opportunity['name']} ({opportunity['sector']})
                             Investment range: €{opportunity['investment_amount']:,.2f}
                             Location: {opportunity['location']}
                             Deal type: {opportunity['deal_type']}""",
            "match_score": opportunity.get("match_score", 0),
            "timestamp": datetime.now().isoformat(),
            "expires_at": datetime.now().isoformat(),  # Set appropriate expiration
            "priority": "high" if opportunity.get("match_score", 0) > 0.8 else "medium"
        }

    def save_profile(self, profile: InvestorProfile, base_path: str = "data/investors"):
        """Save investor profile to JSON file."""
        path = Path(base_path)
        path.mkdir(parents=True, exist_ok=True)
        
        profile_data = {
            "id": profile.id,
            "name": profile.name,
            "sectors_of_interest": profile.sectors_of_interest,
            "investment_range": profile.investment_range,
            "preferred_locations": profile.preferred_locations,
            "investment_history": [
                {
                    "company_name": inv.company_name,
                    "sector": inv.sector,
                    "amount": inv.amount,
                    "date": inv.date.isoformat(),
                    "exit_date": inv.exit_date.isoformat() if inv.exit_date else None,
                    "exit_amount": inv.exit_amount
                }
                for inv in profile.investment_history
            ],
            "badges": [
                {
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "category": badge.category,
                    "level": badge.level
                }
                for badge in profile.badges
            ],
            "expertise_areas": profile.expertise_areas,
            "risk_profile": profile.risk_profile,
            "preferred_deal_types": profile.preferred_deal_types,
            "private_alerts": profile.private_alerts
        }
        
        with open(path / f"{profile.id}.json", "w") as f:
            json.dump(profile_data, f, indent=2)

    def load_profile(self, investor_id: str, base_path: str = "data/investors") -> InvestorProfile:
        """Load investor profile from JSON file."""
        path = Path(base_path) / f"{investor_id}.json"
        
        with open(path, "r") as f:
            data = json.load(f)
        
        investment_history = [
            InvestmentHistory(
                company_name=inv["company_name"],
                sector=inv["sector"],
                amount=inv["amount"],
                date=datetime.fromisoformat(inv["date"]),
                exit_date=datetime.fromisoformat(inv["exit_date"]) if inv["exit_date"] else None,
                exit_amount=inv["exit_amount"]
            )
            for inv in data["investment_history"]
        ]
        
        badges = [
            Badge(
                name=badge["name"],
                description=badge["description"],
                icon=badge["icon"],
                category=badge["category"],
                level=badge["level"],
                requirements={}  # Requirements are not stored in profile
            )
            for badge in data["badges"]
        ]
        
        return InvestorProfile(
            id=data["id"],
            name=data["name"],
            sectors_of_interest=data["sectors_of_interest"],
            investment_range=data["investment_range"],
            preferred_locations=data["preferred_locations"],
            investment_history=investment_history,
            badges=badges,
            expertise_areas=data["expertise_areas"],
            risk_profile=data["risk_profile"],
            preferred_deal_types=data["preferred_deal_types"],
            private_alerts=data["private_alerts"]
        ) 