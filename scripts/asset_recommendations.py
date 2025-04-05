import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
import os
from dataclasses import dataclass
from enum import Enum

class AssetType(Enum):
    B2B_SAAS = "B2B SaaS"
    B2C_SAAS = "B2C SaaS"
    ECOMMERCE = "E-commerce"
    CONTENT = "Content"
    MARKETPLACE = "Marketplace"
    BLOG = "Blog"
    FORUM = "Forum"
    NEWS = "News"
    PORTFOLIO = "Portfolio"
    EDUCATION = "Education"
    HEALTH = "Health"
    FINANCE = "Finance"
    REAL_ESTATE = "Real Estate"
    GAMING = "Gaming"
    SOCIAL = "Social"
    TRAVEL = "Travel"
    FOOD = "Food"
    TECHNOLOGY = "Technology"
    ENTERTAINMENT = "Entertainment"

@dataclass
class Asset:
    id: str
    name: str
    type: AssetType
    price: float
    monthly_revenue: float
    monthly_visitors: int
    domain_authority: int
    backlinks: int
    age: int
    description: str
    features: List[str]
    market_value: float
    listing_date: datetime
    # New metrics
    growth_rate: float  # Monthly revenue growth rate
    profit_margin: float  # Profit margin percentage
    customer_lifetime_value: float  # Average customer lifetime value
    churn_rate: float  # Monthly churn rate
    traffic_sources: Dict[str, float]  # Traffic source distribution
    technology_stack: List[str]  # Technologies used
    team_size: int  # Current team size
    customer_count: int  # Number of active customers
    average_order_value: float  # Average order value
    conversion_rate: float  # Conversion rate
    social_media_followers: Dict[str, int]  # Social media presence
    email_list_size: int  # Email list size
    recurring_revenue: float  # Monthly recurring revenue
    annual_recurring_revenue: float  # Annual recurring revenue
    net_promoter_score: float  # Customer satisfaction score
    technical_debt: float  # Technical debt score (0-100)
    market_share: float  # Market share percentage
    competitive_position: str  # Market position (leader, challenger, etc.)
    regulatory_compliance: List[str]  # Compliance certifications
    intellectual_property: List[str]  # IP assets
    geographic_reach: List[str]  # Operating regions
    seasonal_variation: float  # Revenue seasonality factor
    customer_acquisition_cost: float  # Cost to acquire a customer
    return_on_investment: float  # ROI percentage
    cash_flow: float  # Monthly cash flow
    burn_rate: float  # Monthly burn rate
    runway_months: int  # Months of runway
    valuation_multiple: float  # Industry standard multiple
    last_funding_round: Optional[Dict]  # Last funding round details
    exit_strategy: List[str]  # Potential exit strategies
    risk_factors: List[str]  # Business risk factors
    growth_potential: float  # Growth potential score (0-100)
    market_trend: str  # Market trend (growing, stable, declining)
    competitive_advantage: List[str]  # Competitive advantages
    scalability_score: float  # Scalability score (0-100)
    automation_level: float  # Automation level (0-100)
    customer_support_score: float  # Customer support quality (0-100)
    brand_strength: float  # Brand strength score (0-100)
    market_maturity: str  # Market maturity stage
    product_roadmap: List[str]  # Future product plans
    partnership_opportunities: List[str]  # Potential partnerships
    expansion_opportunities: List[str]  # Market expansion opportunities
    technology_risk: float  # Technology risk score (0-100)
    market_risk: float  # Market risk score (0-100)
    operational_risk: float  # Operational risk score (0-100)
    financial_risk: float  # Financial risk score (0-100)
    overall_risk_score: float  # Overall risk score (0-100)
    opportunity_score: float  # Opportunity score (0-100)
    investment_readiness: float  # Investment readiness score (0-100)
    due_diligence_status: str  # Due diligence status
    legal_status: str  # Legal status
    tax_status: str  # Tax status
    audit_status: str  # Audit status
    documentation_status: str  # Documentation status
    transfer_process: str  # Asset transfer process
    transition_plan: str  # Transition plan
    support_period: int  # Support period in months
    training_requirements: List[str]  # Training requirements
    integration_requirements: List[str]  # Integration requirements
    custom_development_needed: bool  # Custom development needed
    third_party_dependencies: List[str]  # Third-party dependencies
    data_migration_needed: bool  # Data migration needed
    hosting_requirements: List[str]  # Hosting requirements
    security_requirements: List[str]  # Security requirements
    compliance_requirements: List[str]  # Compliance requirements
    performance_metrics: Dict[str, float]  # Performance metrics
    uptime_percentage: float  # System uptime percentage
    response_time: float  # Average response time
    error_rate: float  # Error rate
    user_satisfaction: float  # User satisfaction score
    team_expertise: Dict[str, float]  # Team expertise scores
    code_quality: float  # Code quality score
    test_coverage: float  # Test coverage percentage
    documentation_quality: float  # Documentation quality score
    maintenance_requirements: List[str]  # Maintenance requirements
    upgrade_path: List[str]  # Upgrade path
    scalability_requirements: List[str]  # Scalability requirements
    security_vulnerabilities: List[str]  # Security vulnerabilities
    performance_bottlenecks: List[str]  # Performance bottlenecks
    technical_requirements: List[str]  # Technical requirements
    business_requirements: List[str]  # Business requirements
    user_requirements: List[str]  # User requirements
    market_requirements: List[str]  # Market requirements
    regulatory_requirements: List[str]  # Regulatory requirements
    competitive_analysis: Dict[str, float]  # Competitive analysis scores
    market_analysis: Dict[str, float]  # Market analysis scores
    trend_analysis: Dict[str, float]  # Trend analysis scores
    risk_analysis: Dict[str, float]  # Risk analysis scores
    opportunity_analysis: Dict[str, float]  # Opportunity analysis scores
    investment_analysis: Dict[str, float]  # Investment analysis scores
    valuation_analysis: Dict[str, float]  # Valuation analysis scores
    due_diligence_analysis: Dict[str, float]  # Due diligence analysis scores
    transition_analysis: Dict[str, float]  # Transition analysis scores
    integration_analysis: Dict[str, float]  # Integration analysis scores
    maintenance_analysis: Dict[str, float]  # Maintenance analysis scores
    upgrade_analysis: Dict[str, float]  # Upgrade analysis scores
    scalability_analysis: Dict[str, float]  # Scalability analysis scores
    security_analysis: Dict[str, float]  # Security analysis scores
    performance_analysis: Dict[str, float]  # Performance analysis scores
    user_analysis: Dict[str, float]  # User analysis scores
    team_analysis: Dict[str, float]  # Team analysis scores
    code_analysis: Dict[str, float]  # Code analysis scores
    documentation_analysis: Dict[str, float]  # Documentation analysis scores
    business_analysis: Dict[str, float]  # Business analysis scores
    market_analysis: Dict[str, float]  # Market analysis scores
    competitive_analysis: Dict[str, float]  # Competitive analysis scores
    trend_analysis: Dict[str, float]  # Trend analysis scores
    risk_analysis: Dict[str, float]  # Risk analysis scores
    opportunity_analysis: Dict[str, float]  # Opportunity analysis scores
    investment_analysis: Dict[str, float]  # Investment analysis scores
    valuation_analysis: Dict[str, float]  # Valuation analysis scores
    due_diligence_analysis: Dict[str, float]  # Due diligence analysis scores
    transition_analysis: Dict[str, float]  # Transition analysis scores
    integration_analysis: Dict[str, float]  # Integration analysis scores
    maintenance_analysis: Dict[str, float]  # Maintenance analysis scores
    upgrade_analysis: Dict[str, float]  # Upgrade analysis scores
    scalability_analysis: Dict[str, float]  # Scalability analysis scores
    security_analysis: Dict[str, float]  # Security analysis scores
    performance_analysis: Dict[str, float]  # Performance analysis scores
    user_analysis: Dict[str, float]  # User analysis scores
    team_analysis: Dict[str, float]  # Team analysis scores
    code_analysis: Dict[str, float]  # Code analysis scores
    documentation_analysis: Dict[str, float]  # Documentation analysis scores

@dataclass
class UserPreference:
    user_id: str
    preferred_asset_types: List[AssetType]
    min_monthly_revenue: float
    max_price: float
    min_domain_authority: int
    keywords: List[str]
    last_purchase_date: Optional[datetime]
    purchase_history: List[str]

class AssetRecommender:
    def __init__(self, data_path: str = "data/asset_data.json"):
        self.data_path = data_path
        self.assets: List[Asset] = []
        self.user_preferences: Dict[str, UserPreference] = {}
        self.vectorizer = TfidfVectorizer()
        self.load_data()
        
    def load_data(self) -> None:
        """Load asset and user preference data"""
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                self.assets = [Asset(**asset) for asset in data.get('assets', [])]
                self.user_preferences = {
                    user_id: UserPreference(**pref)
                    for user_id, pref in data.get('user_preferences', {}).items()
                }
    
    def save_data(self) -> None:
        """Save asset and user preference data"""
        data = {
            'assets': [vars(asset) for asset in self.assets],
            'user_preferences': {
                user_id: vars(pref)
                for user_id, pref in self.user_preferences.items()
            }
        }
        with open(self.data_path, 'w') as f:
            json.dump(data, f, default=str)
    
    def add_asset(self, asset: Asset) -> None:
        """Add a new asset to the system"""
        self.assets.append(asset)
        self.save_data()
    
    def update_user_preference(self, user_id: str, preference: UserPreference) -> None:
        """Update or add user preferences"""
        self.user_preferences[user_id] = preference
        self.save_data()
    
    def _calculate_asset_score(self, asset: Asset) -> float:
        """Calculate a comprehensive score for an asset"""
        score = 0.0
        
        # Financial metrics (40%)
        financial_score = (
            asset.growth_rate * 0.2 +
            asset.profit_margin * 0.1 +
            (1 - asset.churn_rate) * 0.1 +
            asset.return_on_investment * 0.1 +
            asset.cash_flow * 0.1
        )
        score += financial_score * 0.4
        
        # Growth potential (20%)
        growth_score = (
            asset.growth_potential * 0.4 +
            asset.scalability_score * 0.3 +
            asset.market_share * 0.3
        )
        score += growth_score * 0.2
        
        # Risk assessment (20%)
        risk_score = (
            (100 - asset.overall_risk_score) * 0.4 +
            (100 - asset.technology_risk) * 0.2 +
            (100 - asset.market_risk) * 0.2 +
            (100 - asset.operational_risk) * 0.1 +
            (100 - asset.financial_risk) * 0.1
        )
        score += risk_score * 0.2
        
        # Market position (10%)
        market_score = (
            asset.brand_strength * 0.4 +
            asset.customer_support_score * 0.3 +
            asset.net_promoter_score * 0.3
        )
        score += market_score * 0.1
        
        # Technical quality (10%)
        technical_score = (
            asset.code_quality * 0.3 +
            asset.test_coverage * 0.2 +
            asset.documentation_quality * 0.2 +
            asset.uptime_percentage * 0.2 +
            (100 - asset.technical_debt) * 0.1
        )
        score += technical_score * 0.1
        
        return score / 100  # Normalize to 0-1 range
    
    def get_recommendations(self, user_id: str, limit: int = 5) -> List[Asset]:
        """Get personalized asset recommendations for a user"""
        if user_id not in self.user_preferences:
            return []
        
        user_pref = self.user_preferences[user_id]
        
        # Filter assets based on basic criteria
        filtered_assets = [
            asset for asset in self.assets
            if asset.type in user_pref.preferred_asset_types
            and asset.monthly_revenue >= user_pref.min_monthly_revenue
            and asset.price <= user_pref.max_price
            and asset.domain_authority >= user_pref.min_domain_authority
        ]
        
        if not filtered_assets:
            return []
        
        # Calculate similarity scores using multiple factors
        similarity_scores = []
        for asset in filtered_assets:
            # Content similarity (30%)
            content_similarity = self._calculate_content_similarity(asset, user_pref)
            
            # Metric similarity (40%)
            metric_similarity = self._calculate_metric_similarity(asset, user_pref)
            
            # Market similarity (30%)
            market_similarity = self._calculate_market_similarity(asset, user_pref)
            
            # Combine scores
            total_similarity = (
                content_similarity * 0.3 +
                metric_similarity * 0.4 +
                market_similarity * 0.3
            )
            
            # Apply asset score as a multiplier
            asset_score = self._calculate_asset_score(asset)
            final_score = total_similarity * (1 + asset_score)
            
            similarity_scores.append((asset, final_score))
        
        # Sort by final score
        similarity_scores.sort(key=lambda x: x[1], reverse=True)
        return [asset for asset, _ in similarity_scores[:limit]]
    
    def _calculate_content_similarity(self, asset: Asset, user_pref: UserPreference) -> float:
        """Calculate content-based similarity"""
        asset_text = f"{asset.description} {' '.join(asset.features)}"
        user_text = ' '.join(user_pref.keywords)
        
        feature_matrix = self.vectorizer.fit_transform([asset_text, user_text])
        return cosine_similarity(feature_matrix[0:1], feature_matrix[1:2])[0][0]
    
    def _calculate_metric_similarity(self, asset: Asset, user_pref: UserPreference) -> float:
        """Calculate similarity based on metrics"""
        # Normalize metrics to 0-1 range
        revenue_similarity = min(asset.monthly_revenue / user_pref.min_monthly_revenue, 1)
        price_similarity = 1 - (asset.price / user_pref.max_price)
        authority_similarity = min(asset.domain_authority / user_pref.min_domain_authority, 1)
        
        return (revenue_similarity + price_similarity + authority_similarity) / 3
    
    def _calculate_market_similarity(self, asset: Asset, user_pref: UserPreference) -> float:
        """Calculate market-based similarity"""
        # Check if asset type matches user preferences
        type_match = 1.0 if asset.type in user_pref.preferred_asset_types else 0.0
        
        # Check market maturity
        maturity_match = 1.0 if asset.market_maturity in ["growing", "stable"] else 0.5
        
        # Check competitive position
        position_match = 1.0 if asset.competitive_position in ["leader", "challenger"] else 0.5
        
        return (type_match + maturity_match + position_match) / 3
    
    def get_opportunity_alerts(self, user_id: str) -> List[Dict]:
        """Get opportunity alerts for a user"""
        if user_id not in self.user_preferences:
            return []
        
        user_pref = self.user_preferences[user_id]
        alerts = []
        
        for asset in self.assets:
            # Check if asset matches user preferences
            if (asset.type in user_pref.preferred_asset_types and
                asset.monthly_revenue >= user_pref.min_monthly_revenue and
                asset.price <= user_pref.max_price and
                asset.domain_authority >= user_pref.min_domain_authority):
                
                # Calculate opportunity score
                opportunity_score = self._calculate_opportunity_score(asset)
                
                # Check if it's a significant opportunity
                if opportunity_score >= 0.7:  # 70% or higher opportunity score
                    alerts.append({
                        'asset_id': asset.id,
                        'asset_name': asset.name,
                        'asset_type': asset.type.value,
                        'current_price': asset.price,
                        'market_value': asset.market_value,
                        'price_difference': ((asset.market_value - asset.price) / asset.market_value) * 100,
                        'opportunity_score': opportunity_score,
                        'monthly_revenue': asset.monthly_revenue,
                        'growth_rate': asset.growth_rate,
                        'profit_margin': asset.profit_margin,
                        'customer_count': asset.customer_count,
                        'recurring_revenue': asset.recurring_revenue,
                        'market_share': asset.market_share,
                        'competitive_position': asset.competitive_position,
                        'risk_score': asset.overall_risk_score,
                        'listing_date': asset.listing_date,
                        'match_score': self._calculate_match_score(asset, user_pref)
                    })
        
        # Sort alerts by opportunity score and match score
        alerts.sort(key=lambda x: (x['opportunity_score'], x['match_score']), reverse=True)
        return alerts
    
    def _calculate_opportunity_score(self, asset: Asset) -> float:
        """Calculate a comprehensive opportunity score"""
        score = 0.0
        
        # Price opportunity (30%)
        price_difference = ((asset.market_value - asset.price) / asset.market_value)
        score += min(price_difference * 3, 0.3)  # Cap at 30%
        
        # Growth potential (20%)
        growth_score = (
            asset.growth_rate * 0.4 +
            asset.growth_potential * 0.3 +
            asset.scalability_score * 0.3
        )
        score += growth_score * 0.2
        
        # Market position (20%)
        market_score = (
            asset.market_share * 0.4 +
            (1 if asset.competitive_position in ["leader", "challenger"] else 0.5) * 0.3 +
            asset.brand_strength * 0.3
        )
        score += market_score * 0.2
        
        # Financial health (15%)
        financial_score = (
            asset.profit_margin * 0.4 +
            asset.cash_flow * 0.3 +
            (1 - asset.churn_rate) * 0.3
        )
        score += financial_score * 0.15
        
        # Risk assessment (15%)
        risk_score = (100 - asset.overall_risk_score) / 100
        score += risk_score * 0.15
        
        return score
    
    def get_trending_assets(self, days: int = 30) -> List[Asset]:
        """Get trending assets based on recent activity"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_assets = [
            asset for asset in self.assets
            if asset.listing_date >= cutoff_date
        ]
        
        # Sort by price difference from market value
        recent_assets.sort(
            key=lambda x: ((x.market_value - x.price) / x.market_value) * 100,
            reverse=True
        )
        
        return recent_assets[:10]  # Return top 10 trending assets
    
    def get_similar_assets(self, asset_id: str, limit: int = 5) -> List[Asset]:
        """Get similar assets based on features and metrics"""
        target_asset = next((asset for asset in self.assets if asset.id == asset_id), None)
        if not target_asset:
            return []
        
        # Create feature vectors
        asset_features = [
            f"{asset.description} {' '.join(asset.features)}"
            for asset in self.assets
            if asset.id != asset_id
        ]
        
        target_features = f"{target_asset.description} {' '.join(target_asset.features)}"
        
        # Calculate similarity scores
        feature_matrix = self.vectorizer.fit_transform(asset_features + [target_features])
        similarity_scores = cosine_similarity(feature_matrix[-1:], feature_matrix[:-1])[0]
        
        # Sort assets by similarity score
        sorted_indices = np.argsort(similarity_scores)[::-1]
        similar_assets = [
            self.assets[i] for i in sorted_indices[:limit]
            if self.assets[i].id != asset_id
        ]
        
        return similar_assets 