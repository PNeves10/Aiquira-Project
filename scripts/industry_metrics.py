from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class IndustryType(Enum):
    B2B_SAAS = "B2B SaaS"
    ECOMMERCE = "E-commerce"
    MARKETPLACE = "Marketplace"
    CONTENT = "Content/Media"
    D2C = "Direct to Consumer"
    AGENCY = "Agency/Services"

@dataclass
class SaaSMetrics:
    net_revenue_retention: Optional[float]
    gross_revenue_retention: Optional[float]
    expansion_revenue: Optional[float]
    customer_acquisition_cost: Optional[float]
    customer_lifetime_value: Optional[float]
    arr_churn_rate: Optional[float]
    logo_churn_rate: Optional[float]
    quick_ratio: Optional[float]
    burn_rate: Optional[float]
    runway_months: Optional[float]
    magic_number: Optional[float]

@dataclass
class EcommerceMetrics:
    aov: Optional[float]  # Average Order Value
    repeat_purchase_rate: Optional[float]
    customer_acquisition_cost: Optional[float]
    inventory_turnover: Optional[float]
    gross_merchandise_value: Optional[float]
    return_rate: Optional[float]
    fulfillment_cost_ratio: Optional[float]
    customer_lifetime_value: Optional[float]
    cart_abandonment_rate: Optional[float]
    inventory_days: Optional[float]

@dataclass
class MarketplaceMetrics:
    gmv: Optional[float]  # Gross Merchandise Value
    take_rate: Optional[float]
    buyer_seller_ratio: Optional[float]
    transaction_value_avg: Optional[float]
    seller_retention_rate: Optional[float]
    buyer_retention_rate: Optional[float]
    liquidity_score: Optional[float]
    matching_rate: Optional[float]
    fraud_rate: Optional[float]
    network_effects_score: Optional[float]

@dataclass
class ContentMetrics:
    monthly_visitors: Optional[int]
    page_views_per_visit: Optional[float]
    time_on_site: Optional[float]
    ad_revenue_per_user: Optional[float]
    content_costs: Optional[float]
    subscriber_lifetime_value: Optional[float]
    paid_subscriber_ratio: Optional[float]
    content_engagement_rate: Optional[float]
    advertiser_retention: Optional[float]
    revenue_per_thousand_impressions: Optional[float]

class IndustryMetrics:
    def __init__(self):
        """Initialize industry-specific metric analyzers."""
        self.benchmarks = self._load_industry_benchmarks()
        self.growth_models = self._initialize_growth_models()

    def _load_industry_benchmarks(self) -> Dict[str, pd.DataFrame]:
        """Load benchmark data for different industries."""
        benchmarks = {}
        
        # SaaS Benchmarks
        saas_benchmarks = {
            "arr_growth_rate": {
                "top_quartile": 1.5,  # 150% YoY growth
                "median": 0.7,        # 70% YoY growth
                "bottom_quartile": 0.4 # 40% YoY growth
            },
            "net_revenue_retention": {
                "top_quartile": 1.3,  # 130% NRR
                "median": 1.1,        # 110% NRR
                "bottom_quartile": 0.9 # 90% NRR
            },
            "gross_margin": {
                "top_quartile": 0.85,
                "median": 0.75,
                "bottom_quartile": 0.65
            },
            "cac_payback_months": {
                "top_quartile": 6,
                "median": 12,
                "bottom_quartile": 18
            }
        }
        benchmarks["B2B_SAAS"] = pd.DataFrame(saas_benchmarks)
        
        # E-commerce Benchmarks
        ecommerce_benchmarks = {
            "revenue_growth_rate": {
                "top_quartile": 1.0,  # 100% YoY growth
                "median": 0.5,        # 50% YoY growth
                "bottom_quartile": 0.2 # 20% YoY growth
            },
            "gross_margin": {
                "top_quartile": 0.65,
                "median": 0.45,
                "bottom_quartile": 0.25
            },
            "repeat_purchase_rate": {
                "top_quartile": 0.6,
                "median": 0.4,
                "bottom_quartile": 0.2
            }
        }
        benchmarks["ECOMMERCE"] = pd.DataFrame(ecommerce_benchmarks)
        
        return benchmarks

    def _initialize_growth_models(self) -> Dict[str, Any]:
        """Initialize growth prediction models for different industries."""
        return {
            "B2B_SAAS": self._create_saas_growth_model(),
            "ECOMMERCE": self._create_ecommerce_growth_model(),
            "MARKETPLACE": self._create_marketplace_growth_model(),
            "CONTENT": self._create_content_growth_model()
        }

    def analyze_metrics(self, industry_type: IndustryType, metrics: Any) -> Dict[str, Any]:
        """Analyze industry-specific metrics and provide insights."""
        if industry_type == IndustryType.B2B_SAAS:
            return self._analyze_saas_metrics(metrics)
        elif industry_type == IndustryType.ECOMMERCE:
            return self._analyze_ecommerce_metrics(metrics)
        elif industry_type == IndustryType.MARKETPLACE:
            return self._analyze_marketplace_metrics(metrics)
        elif industry_type == IndustryType.CONTENT:
            return self._analyze_content_metrics(metrics)
        else:
            raise ValueError(f"Unsupported industry type: {industry_type}")

    def _analyze_saas_metrics(self, metrics: SaaSMetrics) -> Dict[str, Any]:
        """Analyze SaaS-specific metrics."""
        analysis = {
            "health_scores": {},
            "benchmarks": {},
            "risks": [],
            "opportunities": [],
            "valuation_factors": {}
        }
        
        # Growth Efficiency
        if metrics.magic_number is not None:
            analysis["health_scores"]["growth_efficiency"] = self._score_magic_number(metrics.magic_number)
        
        # Revenue Quality
        if metrics.net_revenue_retention is not None:
            analysis["health_scores"]["revenue_quality"] = self._score_nrr(metrics.net_revenue_retention)
        
        # Unit Economics
        if metrics.customer_lifetime_value is not None and metrics.customer_acquisition_cost is not None:
            ltv_cac = metrics.customer_lifetime_value / metrics.customer_acquisition_cost
            analysis["health_scores"]["unit_economics"] = self._score_ltv_cac(ltv_cac)
        
        # Growth Sustainability
        if metrics.burn_rate is not None and metrics.runway_months is not None:
            analysis["health_scores"]["growth_sustainability"] = self._score_runway(metrics.runway_months)
        
        # Compare with benchmarks
        benchmark_data = self.benchmarks["B2B_SAAS"]
        if metrics.net_revenue_retention is not None:
            analysis["benchmarks"]["nrr_percentile"] = self._calculate_percentile(
                metrics.net_revenue_retention,
                benchmark_data["net_revenue_retention"]
            )
        
        # Risk Assessment
        if metrics.quick_ratio is not None and metrics.quick_ratio < 1:
            analysis["risks"].append({
                "factor": "Cash Flow",
                "severity": "High",
                "description": "Quick ratio below 1 indicates potential cash flow issues"
            })
        
        if metrics.arr_churn_rate is not None and metrics.arr_churn_rate > 0.15:
            analysis["risks"].append({
                "factor": "Customer Retention",
                "severity": "High",
                "description": "High ARR churn rate indicates retention issues"
            })
        
        # Opportunities
        if metrics.expansion_revenue is not None and metrics.net_revenue_retention > 1.2:
            analysis["opportunities"].append({
                "factor": "Customer Expansion",
                "potential": "High",
                "description": "Strong expansion revenue suggests upsell opportunities"
            })
        
        # Valuation Impact Factors
        analysis["valuation_factors"] = {
            "growth_quality": self._calculate_growth_quality(metrics),
            "retention_strength": self._calculate_retention_strength(metrics),
            "scale_potential": self._calculate_scale_potential(metrics)
        }
        
        return analysis

    def _analyze_ecommerce_metrics(self, metrics: EcommerceMetrics) -> Dict[str, Any]:
        """Analyze e-commerce specific metrics."""
        analysis = {
            "health_scores": {},
            "benchmarks": {},
            "risks": [],
            "opportunities": [],
            "valuation_factors": {}
        }
        
        # Customer Economics
        if metrics.customer_lifetime_value is not None and metrics.customer_acquisition_cost is not None:
            ltv_cac = metrics.customer_lifetime_value / metrics.customer_acquisition_cost
            analysis["health_scores"]["customer_economics"] = self._score_ltv_cac(ltv_cac)
        
        # Inventory Efficiency
        if metrics.inventory_turnover is not None:
            analysis["health_scores"]["inventory_efficiency"] = self._score_inventory_turnover(
                metrics.inventory_turnover
            )
        
        # Customer Loyalty
        if metrics.repeat_purchase_rate is not None:
            analysis["health_scores"]["customer_loyalty"] = self._score_repeat_purchase_rate(
                metrics.repeat_purchase_rate
            )
        
        # Operational Efficiency
        if metrics.fulfillment_cost_ratio is not None:
            analysis["health_scores"]["operational_efficiency"] = self._score_fulfillment_cost(
                metrics.fulfillment_cost_ratio
            )
        
        # Risk Assessment
        if metrics.inventory_days is not None and metrics.inventory_days > 90:
            analysis["risks"].append({
                "factor": "Inventory Management",
                "severity": "Medium",
                "description": "High inventory days indicating potential obsolescence risk"
            })
        
        if metrics.return_rate is not None and metrics.return_rate > 0.3:
            analysis["risks"].append({
                "factor": "Product Quality",
                "severity": "High",
                "description": "High return rate affecting profitability"
            })
        
        # Opportunities
        if metrics.cart_abandonment_rate is not None and metrics.cart_abandonment_rate > 0.7:
            analysis["opportunities"].append({
                "factor": "Conversion Optimization",
                "potential": "High",
                "description": "High cart abandonment rate presents optimization opportunity"
            })
        
        # Valuation Impact Factors
        analysis["valuation_factors"] = {
            "market_position": self._calculate_market_position(metrics),
            "operational_excellence": self._calculate_operational_excellence(metrics),
            "growth_potential": self._calculate_growth_potential(metrics)
        }
        
        return analysis

    def _analyze_marketplace_metrics(self, metrics: MarketplaceMetrics) -> Dict[str, Any]:
        """Analyze marketplace specific metrics."""
        analysis = {
            "health_scores": {},
            "benchmarks": {},
            "risks": [],
            "opportunities": [],
            "valuation_factors": {}
        }
        
        # Network Strength
        if metrics.network_effects_score is not None:
            analysis["health_scores"]["network_strength"] = self._score_network_effects(
                metrics.network_effects_score
            )
        
        # Marketplace Liquidity
        if metrics.liquidity_score is not None:
            analysis["health_scores"]["marketplace_liquidity"] = self._score_liquidity(
                metrics.liquidity_score
            )
        
        # Platform Economics
        if metrics.take_rate is not None:
            analysis["health_scores"]["platform_economics"] = self._score_take_rate(
                metrics.take_rate
            )
        
        # Risk Assessment
        if metrics.fraud_rate is not None and metrics.fraud_rate > 0.02:
            analysis["risks"].append({
                "factor": "Platform Trust",
                "severity": "High",
                "description": "Elevated fraud rate threatening platform trust"
            })
        
        if metrics.matching_rate < 0.5:
            analysis["risks"].append({
                "factor": "Marketplace Efficiency",
                "severity": "Medium",
                "description": "Low matching rate indicating potential liquidity issues"
            })
        
        # Opportunities
        if metrics.take_rate < 0.15 and metrics.transaction_value_avg > 1000:
            analysis["opportunities"].append({
                "factor": "Revenue Optimization",
                "potential": "High",
                "description": "Potential for take rate optimization in high-value transactions"
            })
        
        # Valuation Impact Factors
        analysis["valuation_factors"] = {
            "network_value": self._calculate_network_value(metrics),
            "platform_scalability": self._calculate_platform_scalability(metrics),
            "market_penetration": self._calculate_market_penetration(metrics)
        }
        
        return analysis

    def _analyze_content_metrics(self, metrics: ContentMetrics) -> Dict[str, Any]:
        """Analyze content/media specific metrics."""
        analysis = {
            "health_scores": {},
            "benchmarks": {},
            "risks": [],
            "opportunities": [],
            "valuation_factors": {}
        }
        
        # Audience Engagement
        if metrics.time_on_site is not None and metrics.page_views_per_visit is not None:
            analysis["health_scores"]["audience_engagement"] = self._score_engagement(
                metrics.time_on_site,
                metrics.page_views_per_visit
            )
        
        # Monetization Efficiency
        if metrics.ad_revenue_per_user is not None:
            analysis["health_scores"]["monetization_efficiency"] = self._score_arpu(
                metrics.ad_revenue_per_user
            )
        
        # Content Economics
        if metrics.content_costs is not None and metrics.ad_revenue_per_user is not None:
            analysis["health_scores"]["content_economics"] = self._score_content_roi(
                metrics.ad_revenue_per_user,
                metrics.content_costs
            )
        
        # Risk Assessment
        if metrics.advertiser_retention < 0.6:
            analysis["risks"].append({
                "factor": "Revenue Stability",
                "severity": "High",
                "description": "Low advertiser retention threatening revenue stability"
            })
        
        if metrics.paid_subscriber_ratio < 0.05:
            analysis["risks"].append({
                "factor": "Revenue Diversification",
                "severity": "Medium",
                "description": "Heavy dependence on advertising revenue"
            })
        
        # Opportunities
        if metrics.content_engagement_rate > 0.4 and metrics.paid_subscriber_ratio < 0.1:
            analysis["opportunities"].append({
                "factor": "Subscription Growth",
                "potential": "High",
                "description": "High engagement provides opportunity for subscription conversion"
            })
        
        # Valuation Impact Factors
        analysis["valuation_factors"] = {
            "audience_value": self._calculate_audience_value(metrics),
            "content_efficiency": self._calculate_content_efficiency(metrics),
            "monetization_potential": self._calculate_monetization_potential(metrics)
        }
        
        return analysis

    def generate_growth_projections(self, 
                                  industry_type: IndustryType, 
                                  metrics: Any, 
                                  projection_years: int = 5) -> Dict[str, Any]:
        """Generate industry-specific growth projections."""
        model = self.growth_models[industry_type.name]
        return model.predict_growth(metrics, projection_years)

    def calculate_industry_premium(self, 
                                 industry_type: IndustryType, 
                                 metrics: Any) -> float:
        """Calculate industry-specific valuation premium/discount."""
        analysis = self.analyze_metrics(industry_type, metrics)
        
        # Base premium calculation on key factors
        base_premium = 1.0
        
        if industry_type == IndustryType.B2B_SAAS:
            if metrics.net_revenue_retention > 1.2:
                base_premium += 0.3
            if metrics.gross_margin > 0.8:
                base_premium += 0.2
            if metrics.magic_number > 1:
                base_premium += 0.2
                
        elif industry_type == IndustryType.ECOMMERCE:
            if metrics.repeat_purchase_rate > 0.5:
                base_premium += 0.2
            if metrics.customer_lifetime_value / metrics.customer_acquisition_cost > 3:
                base_premium += 0.2
                
        # Apply risk adjustments
        for risk in analysis["risks"]:
            if risk["severity"] == "High":
                base_premium -= 0.1
            elif risk["severity"] == "Medium":
                base_premium -= 0.05
                
        return max(base_premium, 0.5)  # Minimum 0.5x premium

    def _score_magic_number(self, magic_number: float) -> float:
        """Score SaaS magic number (ratio of new ARR to sales & marketing spend)."""
        if magic_number >= 1.0:
            return 1.0
        elif magic_number >= 0.75:
            return 0.8
        elif magic_number >= 0.5:
            return 0.6
        return 0.4

    def _score_nrr(self, nrr: float) -> float:
        """Score Net Revenue Retention."""
        if nrr >= 1.3:
            return 1.0
        elif nrr >= 1.1:
            return 0.8
        elif nrr >= 1.0:
            return 0.6
        return 0.4

    def _score_ltv_cac(self, ltv_cac: float) -> float:
        """Score LTV/CAC ratio."""
        if ltv_cac >= 5:
            return 1.0
        elif ltv_cac >= 3:
            return 0.8
        elif ltv_cac >= 2:
            return 0.6
        return 0.4

    def _calculate_percentile(self, value: float, benchmark_series: pd.Series) -> float:
        """Calculate percentile of a value within a benchmark distribution."""
        return len(benchmark_series[benchmark_series <= value]) / len(benchmark_series)

    def _create_saas_growth_model(self):
        """Create growth prediction model for SaaS companies."""
        # Implement growth model logic
        pass

    def _create_ecommerce_growth_model(self):
        """Create growth prediction model for e-commerce companies."""
        # Implement growth model logic
        pass

    def _create_marketplace_growth_model(self):
        """Create growth prediction model for marketplace companies."""
        # Implement growth model logic
        pass

    def _create_content_growth_model(self):
        """Create growth prediction model for content/media companies."""
        # Implement growth model logic
        pass 