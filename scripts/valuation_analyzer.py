from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from datetime import datetime, timedelta
import plotly.graph_objects as go
import plotly.express as px
from pathlib import Path
import json
import logging

@dataclass
class CompanyMetrics:
    revenue: float
    growth_rate: float
    gross_margin: float
    ebitda_margin: float
    arr: Optional[float]
    mrr: Optional[float]
    cac: Optional[float]
    ltv: Optional[float]
    churn_rate: Optional[float]
    traffic: Optional[int]
    conversion_rate: Optional[float]

@dataclass
class ValuationScenario:
    name: str
    description: str
    adjusted_metrics: CompanyMetrics
    valuation: float
    multiple: float
    key_drivers: List[Dict[str, Any]]
    probability: float

class ValuationAnalyzer:
    def __init__(self, data_dir: str = "data/market_transactions"):
        """Initialize the Valuation Analyzer with historical transaction data."""
        self.data_dir = Path(data_dir)
        self.logger = self._setup_logging()
        self.transaction_data = self._load_transaction_data()
        self.ml_model = self._train_valuation_model()
        self.scaler = StandardScaler()

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger("ValuationAnalyzer")
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def _load_transaction_data(self) -> pd.DataFrame:
        """Load and preprocess historical transaction data."""
        transactions = []
        
        # Load transaction data from JSON files
        for file_path in self.data_dir.glob("*.json"):
            with open(file_path, "r") as f:
                transaction = json.load(f)
                transactions.append(transaction)
        
        df = pd.DataFrame(transactions)
        
        # Add derived metrics
        df["revenue_multiple"] = df["valuation"] / df["revenue"]
        df["arr_multiple"] = df["valuation"] / df["arr"]
        df["growth_adjusted_multiple"] = df["revenue_multiple"] / df["growth_rate"]
        
        return df

    def _train_valuation_model(self) -> RandomForestRegressor:
        """Train ML model for valuation predictions."""
        # Prepare features
        feature_columns = [
            "revenue", "growth_rate", "gross_margin", "ebitda_margin",
            "arr", "mrr", "cac", "ltv", "churn_rate", "traffic", "conversion_rate"
        ]
        
        X = self.transaction_data[feature_columns].fillna(0)
        y = self.transaction_data["valuation"]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        model.fit(X_scaled, y)
        
        return model

    def analyze_company(self, metrics: CompanyMetrics) -> Dict[str, Any]:
        """Perform comprehensive valuation analysis for a company."""
        # Calculate base valuation
        base_valuation = self._predict_valuation(metrics)
        
        # Generate scenarios
        scenarios = self._generate_scenarios(metrics, base_valuation)
        
        # Calculate multiples
        multiples = self._calculate_multiples(metrics, base_valuation)
        
        # Get comparable transactions
        comparables = self._find_comparable_transactions(metrics)
        
        # Generate valuation summary
        summary = {
            "base_valuation": base_valuation,
            "valuation_range": {
                "low": min(s.valuation for s in scenarios),
                "high": max(s.valuation for s in scenarios),
                "expected": sum(s.valuation * s.probability for s in scenarios)
            },
            "multiples": multiples,
            "scenarios": [s.__dict__ for s in scenarios],
            "comparables": comparables,
            "key_drivers": self._identify_key_drivers(metrics),
            "confidence_score": self._calculate_confidence_score(metrics)
        }
        
        return summary

    def _predict_valuation(self, metrics: CompanyMetrics) -> float:
        """Predict company valuation using the ML model."""
        # Prepare features
        features = pd.DataFrame([{
            "revenue": metrics.revenue,
            "growth_rate": metrics.growth_rate,
            "gross_margin": metrics.gross_margin,
            "ebitda_margin": metrics.ebitda_margin,
            "arr": metrics.arr or 0,
            "mrr": metrics.mrr or 0,
            "cac": metrics.cac or 0,
            "ltv": metrics.ltv or 0,
            "churn_rate": metrics.churn_rate or 0,
            "traffic": metrics.traffic or 0,
            "conversion_rate": metrics.conversion_rate or 0
        }])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict valuation
        return float(self.ml_model.predict(features_scaled)[0])

    def _generate_scenarios(self, base_metrics: CompanyMetrics, base_valuation: float) -> List[ValuationScenario]:
        """Generate different valuation scenarios."""
        scenarios = []
        
        # Optimistic growth scenario
        optimistic_metrics = CompanyMetrics(
            revenue=base_metrics.revenue * 1.2,
            growth_rate=base_metrics.growth_rate * 1.5,
            gross_margin=min(base_metrics.gross_margin * 1.1, 0.95),
            ebitda_margin=min(base_metrics.ebitda_margin * 1.2, 0.4),
            arr=base_metrics.arr * 1.2 if base_metrics.arr else None,
            mrr=base_metrics.mrr * 1.2 if base_metrics.mrr else None,
            cac=base_metrics.cac * 0.9 if base_metrics.cac else None,
            ltv=base_metrics.ltv * 1.2 if base_metrics.ltv else None,
            churn_rate=base_metrics.churn_rate * 0.8 if base_metrics.churn_rate else None,
            traffic=int(base_metrics.traffic * 1.3) if base_metrics.traffic else None,
            conversion_rate=base_metrics.conversion_rate * 1.2 if base_metrics.conversion_rate else None
        )
        
        scenarios.append(ValuationScenario(
            name="Optimistic Growth",
            description="Accelerated growth with improved margins",
            adjusted_metrics=optimistic_metrics,
            valuation=self._predict_valuation(optimistic_metrics),
            multiple=self._calculate_primary_multiple(optimistic_metrics),
            key_drivers=[
                {"factor": "Growth Rate", "change": "+50%"},
                {"factor": "Margins", "change": "+10-20%"},
                {"factor": "Efficiency", "change": "+20%"}
            ],
            probability=0.25
        ))
        
        # Conservative scenario
        conservative_metrics = CompanyMetrics(
            revenue=base_metrics.revenue * 0.9,
            growth_rate=base_metrics.growth_rate * 0.7,
            gross_margin=base_metrics.gross_margin * 0.95,
            ebitda_margin=base_metrics.ebitda_margin * 0.8,
            arr=base_metrics.arr * 0.9 if base_metrics.arr else None,
            mrr=base_metrics.mrr * 0.9 if base_metrics.mrr else None,
            cac=base_metrics.cac * 1.2 if base_metrics.cac else None,
            ltv=base_metrics.ltv * 0.9 if base_metrics.ltv else None,
            churn_rate=base_metrics.churn_rate * 1.2 if base_metrics.churn_rate else None,
            traffic=int(base_metrics.traffic * 0.8) if base_metrics.traffic else None,
            conversion_rate=base_metrics.conversion_rate * 0.9 if base_metrics.conversion_rate else None
        )
        
        scenarios.append(ValuationScenario(
            name="Conservative",
            description="Slower growth with compressed margins",
            adjusted_metrics=conservative_metrics,
            valuation=self._predict_valuation(conservative_metrics),
            multiple=self._calculate_primary_multiple(conservative_metrics),
            key_drivers=[
                {"factor": "Growth Rate", "change": "-30%"},
                {"factor": "Margins", "change": "-5-20%"},
                {"factor": "Efficiency", "change": "-20%"}
            ],
            probability=0.35
        ))
        
        # Base case scenario
        scenarios.append(ValuationScenario(
            name="Base Case",
            description="Current trajectory maintained",
            adjusted_metrics=base_metrics,
            valuation=base_valuation,
            multiple=self._calculate_primary_multiple(base_metrics),
            key_drivers=[
                {"factor": "Current Metrics", "change": "Maintained"}
            ],
            probability=0.40
        ))
        
        return scenarios

    def _calculate_multiples(self, metrics: CompanyMetrics, valuation: float) -> Dict[str, float]:
        """Calculate various valuation multiples."""
        return {
            "revenue_multiple": valuation / metrics.revenue if metrics.revenue else None,
            "arr_multiple": valuation / metrics.arr if metrics.arr else None,
            "growth_adjusted_multiple": (valuation / metrics.revenue) / metrics.growth_rate if metrics.revenue and metrics.growth_rate else None,
            "ltv_cac_ratio": metrics.ltv / metrics.cac if metrics.ltv and metrics.cac else None
        }

    def _calculate_primary_multiple(self, metrics: CompanyMetrics) -> float:
        """Calculate the primary valuation multiple based on available metrics."""
        if metrics.arr:
            return self._predict_valuation(metrics) / metrics.arr
        return self._predict_valuation(metrics) / metrics.revenue

    def _find_comparable_transactions(self, metrics: CompanyMetrics) -> List[Dict[str, Any]]:
        """Find similar companies and their transaction details."""
        # Calculate similarity scores
        df = self.transaction_data.copy()
        
        # Normalize metrics for comparison
        metric_columns = ["revenue", "growth_rate", "gross_margin", "ebitda_margin"]
        df_normalized = (df[metric_columns] - df[metric_columns].mean()) / df[metric_columns].std()
        
        company_metrics = pd.DataFrame([{
            "revenue": metrics.revenue,
            "growth_rate": metrics.growth_rate,
            "gross_margin": metrics.gross_margin,
            "ebitda_margin": metrics.ebitda_margin
        }])
        company_normalized = (company_metrics - df[metric_columns].mean()) / df[metric_columns].std()
        
        # Calculate Euclidean distance
        distances = np.sqrt(((df_normalized - company_normalized.iloc[0]) ** 2).sum(axis=1))
        
        # Get top 5 most similar companies
        similar_indices = distances.nsmallest(5).index
        comparables = []
        
        for idx in similar_indices:
            transaction = self.transaction_data.iloc[idx]
            comparables.append({
                "company_name": transaction["company_name"],
                "transaction_date": transaction["date"],
                "valuation": transaction["valuation"],
                "revenue_multiple": transaction["revenue_multiple"],
                "growth_rate": transaction["growth_rate"],
                "similarity_score": 1 - (distances[idx] / distances.max())
            })
        
        return comparables

    def _identify_key_drivers(self, metrics: CompanyMetrics) -> List[Dict[str, Any]]:
        """Identify key value drivers based on feature importance."""
        feature_importance = self.ml_model.feature_importances_
        feature_names = [
            "Revenue", "Growth Rate", "Gross Margin", "EBITDA Margin",
            "ARR", "MRR", "CAC", "LTV", "Churn Rate", "Traffic", "Conversion Rate"
        ]
        
        drivers = []
        for name, importance in zip(feature_names, feature_importance):
            if importance > 0.05:  # Only include significant drivers
                drivers.append({
                    "factor": name,
                    "importance": float(importance),
                    "current_value": getattr(metrics, name.lower().replace(" ", "_")),
                    "impact": "High" if importance > 0.1 else "Medium"
                })
        
        return sorted(drivers, key=lambda x: x["importance"], reverse=True)

    def _calculate_confidence_score(self, metrics: CompanyMetrics) -> float:
        """Calculate confidence score for the valuation."""
        # Factors affecting confidence:
        # 1. Data completeness
        # 2. Similarity to historical transactions
        # 3. Market conditions
        # 4. Growth predictability
        
        confidence = 0.0
        factors = 0
        
        # Data completeness
        metric_values = [
            metrics.revenue, metrics.growth_rate, metrics.gross_margin,
            metrics.ebitda_margin, metrics.arr, metrics.mrr, metrics.cac,
            metrics.ltv, metrics.churn_rate, metrics.traffic, metrics.conversion_rate
        ]
        completeness = sum(1 for v in metric_values if v is not None) / len(metric_values)
        confidence += completeness * 0.4
        factors += 1
        
        # Similarity to historical transactions
        comparables = self._find_comparable_transactions(metrics)
        avg_similarity = sum(c["similarity_score"] for c in comparables) / len(comparables)
        confidence += avg_similarity * 0.3
        factors += 1
        
        # Growth predictability
        if metrics.growth_rate is not None:
            growth_confidence = 1.0 - min(abs(metrics.growth_rate), 1.0) * 0.5
            confidence += growth_confidence * 0.3
            factors += 1
        
        return confidence / factors

    def generate_valuation_charts(self, metrics: CompanyMetrics, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate visualization charts for the valuation analysis."""
        charts = {}
        
        # Valuation Range Chart
        scenarios = analysis_results["scenarios"]
        fig_range = go.Figure()
        
        for scenario in scenarios:
            fig_range.add_trace(go.Bar(
                name=scenario["name"],
                x=[scenario["name"]],
                y=[scenario["valuation"]],
                text=[f"€{scenario['valuation']:,.0f}"],
                textposition="auto",
            ))
        
        fig_range.update_layout(
            title="Valuation Scenarios",
            yaxis_title="Valuation (€)",
            showlegend=True
        )
        
        charts["valuation_scenarios"] = fig_range
        
        # Multiples Comparison
        comparables = analysis_results["comparables"]
        multiples_data = pd.DataFrame(comparables)
        
        fig_multiples = px.box(
            multiples_data,
            y="revenue_multiple",
            title="Revenue Multiple Distribution"
        )
        
        fig_multiples.add_trace(
            go.Scatter(
                x=[0],
                y=[analysis_results["multiples"]["revenue_multiple"]],
                mode="markers",
                name="Company",
                marker=dict(size=10, color="red")
            )
        )
        
        charts["multiples_comparison"] = fig_multiples
        
        # Key Drivers Impact
        drivers = analysis_results["key_drivers"]
        fig_drivers = go.Figure()
        
        fig_drivers.add_trace(go.Bar(
            x=[d["factor"] for d in drivers],
            y=[d["importance"] for d in drivers],
            text=[f"{d['importance']:.1%}" for d in drivers],
            textposition="auto"
        ))
        
        fig_drivers.update_layout(
            title="Value Drivers Importance",
            xaxis_title="Driver",
            yaxis_title="Importance",
            showlegend=False
        )
        
        charts["value_drivers"] = fig_drivers
        
        return charts 