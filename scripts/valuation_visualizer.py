from typing import List, Dict, Any, Optional
import plotly.graph_objects as go
import plotly.express as px
import plotly.figure_factory as ff
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class ValuationVisualizer:
    def __init__(self, theme: str = "light"):
        """Initialize the Valuation Visualizer."""
        self.theme = theme
        self.color_scheme = self._get_color_scheme(theme)

    def _get_color_scheme(self, theme: str) -> Dict[str, str]:
        """Get color scheme based on theme."""
        if theme == "dark":
            return {
                "primary": "#2196F3",
                "secondary": "#4CAF50",
                "accent": "#FFC107",
                "danger": "#F44336",
                "background": "#1E1E1E",
                "text": "#FFFFFF"
            }
        return {
            "primary": "#1976D2",
            "secondary": "#388E3C",
            "accent": "#FFA000",
            "danger": "#D32F2F",
            "background": "#FFFFFF",
            "text": "#000000"
        }

    def create_valuation_summary(self, analysis_results: Dict[str, Any]) -> go.Figure:
        """Create comprehensive valuation summary visualization."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Valuation Range",
                "Key Metrics vs Benchmarks",
                "Risk Factors",
                "Growth Projections"
            ),
            specs=[
                [{"type": "bar"}, {"type": "scatter"}],
                [{"type": "heatmap"}, {"type": "scatter"}]
            ]
        )

        # Valuation Range
        self._add_valuation_range(fig, analysis_results, row=1, col=1)
        
        # Metrics vs Benchmarks
        self._add_benchmark_comparison(fig, analysis_results, row=1, col=2)
        
        # Risk Factors
        self._add_risk_heatmap(fig, analysis_results, row=2, col=1)
        
        # Growth Projections
        self._add_growth_projections(fig, analysis_results, row=2, col=2)

        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Valuation Analysis Summary",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def create_scenario_analysis(self, scenarios: List[Dict[str, Any]]) -> go.Figure:
        """Create detailed scenario analysis visualization."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Scenario Valuations",
                "Key Drivers by Scenario",
                "Probability Distribution",
                "Sensitivity Analysis"
            ),
            specs=[
                [{"type": "bar"}, {"type": "heatmap"}],
                [{"type": "violin"}, {"type": "scatter"}]
            ]
        )

        # Scenario Valuations
        self._add_scenario_valuations(fig, scenarios, row=1, col=1)
        
        # Key Drivers
        self._add_driver_heatmap(fig, scenarios, row=1, col=2)
        
        # Probability Distribution
        self._add_probability_distribution(fig, scenarios, row=2, col=1)
        
        # Sensitivity Analysis
        self._add_sensitivity_analysis(fig, scenarios, row=2, col=2)

        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Scenario Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def create_industry_comparison(self, 
                                 company_metrics: Dict[str, Any],
                                 industry_data: pd.DataFrame) -> go.Figure:
        """Create industry comparison visualization."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Revenue Multiple Distribution",
                "Growth vs Profitability",
                "Unit Economics Comparison",
                "Market Position"
            ),
            specs=[
                [{"type": "violin"}, {"type": "scatter"}],
                [{"type": "bar"}, {"type": "scatter"}]
            ]
        )

        # Revenue Multiple Distribution
        self._add_multiple_distribution(fig, company_metrics, industry_data, row=1, col=1)
        
        # Growth vs Profitability
        self._add_growth_profitability_scatter(fig, company_metrics, industry_data, row=1, col=2)
        
        # Unit Economics
        self._add_unit_economics_comparison(fig, company_metrics, industry_data, row=2, col=1)
        
        # Market Position
        self._add_market_position_radar(fig, company_metrics, industry_data, row=2, col=2)

        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Industry Comparison Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def create_growth_analysis(self, 
                             historical_data: pd.DataFrame,
                             projections: Dict[str, Any]) -> go.Figure:
        """Create growth analysis visualization."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Historical vs Projected Growth",
                "Growth Drivers",
                "Cohort Analysis",
                "Growth Efficiency"
            ),
            specs=[
                [{"type": "scatter"}, {"type": "bar"}],
                [{"type": "heatmap"}, {"type": "scatter"}]
            ]
        )

        # Historical vs Projected Growth
        self._add_growth_trajectory(fig, historical_data, projections, row=1, col=1)
        
        # Growth Drivers
        self._add_growth_drivers(fig, projections, row=1, col=2)
        
        # Cohort Analysis
        self._add_cohort_heatmap(fig, historical_data, row=2, col=1)
        
        # Growth Efficiency
        self._add_growth_efficiency(fig, historical_data, projections, row=2, col=2)

        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Growth Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def _add_valuation_range(self, fig: go.Figure, analysis_results: Dict[str, Any], row: int, col: int):
        """Add valuation range chart."""
        valuation_range = analysis_results["valuation_range"]
        
        fig.add_trace(
            go.Bar(
                x=["Low", "Expected", "High"],
                y=[valuation_range["low"], valuation_range["expected"], valuation_range["high"]],
                marker_color=[
                    self.color_scheme["danger"],
                    self.color_scheme["primary"],
                    self.color_scheme["secondary"]
                ],
                text=[f"€{v:,.0f}" for v in [
                    valuation_range["low"],
                    valuation_range["expected"],
                    valuation_range["high"]
                ]],
                textposition="auto",
            ),
            row=row, col=col
        )

    def _add_benchmark_comparison(self, fig: go.Figure, analysis_results: Dict[str, Any], row: int, col: int):
        """Add benchmark comparison chart."""
        benchmarks = analysis_results["benchmarks"]
        metrics = list(benchmarks.keys())
        company_values = [benchmarks[m]["value"] for m in metrics]
        industry_avg = [benchmarks[m]["industry_avg"] for m in metrics]
        
        fig.add_trace(
            go.Scatter(
                x=metrics,
                y=company_values,
                name="Company",
                mode="lines+markers",
                line=dict(color=self.color_scheme["primary"]),
                marker=dict(size=10)
            ),
            row=row, col=col
        )
        
        fig.add_trace(
            go.Scatter(
                x=metrics,
                y=industry_avg,
                name="Industry Average",
                mode="lines+markers",
                line=dict(
                    color=self.color_scheme["secondary"],
                    dash="dash"
                ),
                marker=dict(size=10)
            ),
            row=row, col=col
        )

    def _add_risk_heatmap(self, fig: go.Figure, analysis_results: Dict[str, Any], row: int, col: int):
        """Add risk factors heatmap."""
        risks = analysis_results["risks"]
        risk_factors = [r["factor"] for r in risks]
        risk_scores = [r["score"] for r in risks]
        
        fig.add_trace(
            go.Heatmap(
                z=[risk_scores],
                x=risk_factors,
                y=["Risk Level"],
                colorscale=[
                    [0, self.color_scheme["secondary"]],
                    [0.5, self.color_scheme["accent"]],
                    [1, self.color_scheme["danger"]]
                ],
                showscale=True
            ),
            row=row, col=col
        )

    def _add_growth_projections(self, fig: go.Figure, analysis_results: Dict[str, Any], row: int, col: int):
        """Add growth projections chart."""
        projections = analysis_results["growth_projections"]
        years = list(projections.keys())
        values = list(projections.values())
        
        fig.add_trace(
            go.Scatter(
                x=years,
                y=values,
                mode="lines+markers",
                line=dict(color=self.color_scheme["primary"]),
                marker=dict(size=8),
                name="Projected Growth"
            ),
            row=row, col=col
        )

    def _add_scenario_valuations(self, fig: go.Figure, scenarios: List[Dict[str, Any]], row: int, col: int):
        """Add scenario valuations chart."""
        names = [s["name"] for s in scenarios]
        valuations = [s["valuation"] for s in scenarios]
        probabilities = [s["probability"] for s in scenarios]
        
        fig.add_trace(
            go.Bar(
                x=names,
                y=valuations,
                marker_color=self.color_scheme["primary"],
                text=[f"€{v:,.0f}<br>({p:.1%})" for v, p in zip(valuations, probabilities)],
                textposition="auto",
                name="Scenario Valuations"
            ),
            row=row, col=col
        )

    def _add_driver_heatmap(self, fig: go.Figure, scenarios: List[Dict[str, Any]], row: int, col: int):
        """Add key drivers heatmap."""
        scenario_names = [s["name"] for s in scenarios]
        drivers = list(scenarios[0]["key_drivers"].keys())
        values = [[s["key_drivers"][d] for d in drivers] for s in scenarios]
        
        fig.add_trace(
            go.Heatmap(
                z=values,
                x=drivers,
                y=scenario_names,
                colorscale=[
                    [0, self.color_scheme["danger"]],
                    [0.5, self.color_scheme["accent"]],
                    [1, self.color_scheme["secondary"]]
                ],
                showscale=True
            ),
            row=row, col=col
        )

    def _add_probability_distribution(self, fig: go.Figure, scenarios: List[Dict[str, Any]], row: int, col: int):
        """Add probability distribution chart."""
        valuations = [s["valuation"] for s in scenarios]
        probabilities = [s["probability"] for s in scenarios]
        
        fig.add_trace(
            go.Violin(
                x=valuations,
                y=probabilities,
                box_visible=True,
                line_color=self.color_scheme["primary"],
                fillcolor=self.color_scheme["primary"],
                opacity=0.6,
                name="Valuation Distribution"
            ),
            row=row, col=col
        )

    def _add_sensitivity_analysis(self, fig: go.Figure, scenarios: List[Dict[str, Any]], row: int, col: int):
        """Add sensitivity analysis chart."""
        factors = list(scenarios[0]["sensitivity"].keys())
        impacts = [scenarios[0]["sensitivity"][f] for f in factors]
        
        fig.add_trace(
            go.Bar(
                x=factors,
                y=impacts,
                marker_color=self.color_scheme["primary"],
                name="Sensitivity Impact"
            ),
            row=row, col=col
        )

    def _add_multiple_distribution(self, fig: go.Figure, company_metrics: Dict[str, Any], 
                                 industry_data: pd.DataFrame, row: int, col: int):
        """Add revenue multiple distribution chart."""
        fig.add_trace(
            go.Violin(
                x=industry_data["revenue_multiple"],
                name="Industry Distribution",
                line_color=self.color_scheme["secondary"],
                fillcolor=self.color_scheme["secondary"],
                opacity=0.6
            ),
            row=row, col=col
        )
        
        fig.add_trace(
            go.Scatter(
                x=[company_metrics["revenue_multiple"]],
                y=[0],
                mode="markers",
                marker=dict(
                    size=15,
                    color=self.color_scheme["primary"],
                    symbol="diamond"
                ),
                name="Company"
            ),
            row=row, col=col
        )

    def _add_growth_profitability_scatter(self, fig: go.Figure, company_metrics: Dict[str, Any],
                                        industry_data: pd.DataFrame, row: int, col: int):
        """Add growth vs profitability scatter plot."""
        fig.add_trace(
            go.Scatter(
                x=industry_data["growth_rate"],
                y=industry_data["ebitda_margin"],
                mode="markers",
                marker=dict(
                    size=8,
                    color=self.color_scheme["secondary"],
                    opacity=0.6
                ),
                name="Industry"
            ),
            row=row, col=col
        )
        
        fig.add_trace(
            go.Scatter(
                x=[company_metrics["growth_rate"]],
                y=[company_metrics["ebitda_margin"]],
                mode="markers",
                marker=dict(
                    size=15,
                    color=self.color_scheme["primary"],
                    symbol="star"
                ),
                name="Company"
            ),
            row=row, col=col
        )

    def _add_unit_economics_comparison(self, fig: go.Figure, company_metrics: Dict[str, Any],
                                     industry_data: pd.DataFrame, row: int, col: int):
        """Add unit economics comparison chart."""
        metrics = ["ltv_cac_ratio", "gross_margin", "cac_payback_months"]
        company_values = [company_metrics[m] for m in metrics]
        industry_avg = [industry_data[m].mean() for m in metrics]
        
        fig.add_trace(
            go.Bar(
                x=metrics,
                y=company_values,
                name="Company",
                marker_color=self.color_scheme["primary"]
            ),
            row=row, col=col
        )
        
        fig.add_trace(
            go.Bar(
                x=metrics,
                y=industry_avg,
                name="Industry Average",
                marker_color=self.color_scheme["secondary"]
            ),
            row=row, col=col
        )

    def _add_market_position_radar(self, fig: go.Figure, company_metrics: Dict[str, Any],
                                 industry_data: pd.DataFrame, row: int, col: int):
        """Add market position radar chart."""
        categories = ["Market Share", "Growth Rate", "Profitability", "Scale", "Innovation"]
        company_values = [
            company_metrics["market_share"],
            company_metrics["growth_rate"],
            company_metrics["ebitda_margin"],
            company_metrics["revenue"] / 1e6,  # Convert to millions
            company_metrics["innovation_score"]
        ]
        
        fig.add_trace(
            go.Scatterpolar(
                r=company_values,
                theta=categories,
                fill="toself",
                name="Company Position",
                line_color=self.color_scheme["primary"]
            ),
            row=row, col=col
        ) 