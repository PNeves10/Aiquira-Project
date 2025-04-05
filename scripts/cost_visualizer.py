from typing import List, Dict, Any, Optional
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from dataclasses import dataclass
from .contract_analyzer import TransactionCosts

@dataclass
class ComparisonScenario:
    name: str
    costs: TransactionCosts
    description: str
    parameters: Dict[str, Any]

class CostVisualizer:
    def __init__(self, theme: str = "light"):
        """Initialize the Cost Visualizer."""
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

    def create_cost_breakdown(self, scenario: ComparisonScenario) -> go.Figure:
        """Create a detailed cost breakdown visualization for a single scenario."""
        # Prepare data
        costs = scenario.costs
        
        # Create figure with secondary y-axis
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        
        # Add bars for different cost components
        components = []
        values = []
        
        # Add taxes
        for tax_type, amount in costs.taxes.items():
            components.append(tax_type.replace("_", " ").title())
            values.append(amount)
        
        # Add fees
        for fee_type, amount in costs.fees.items():
            components.append(fee_type.replace("_", " ").title())
            values.append(amount)
        
        # Create bar chart
        fig.add_trace(
            go.Bar(
                name="Cost Components",
                x=components,
                y=values,
                marker_color=self.color_scheme["primary"]
            ),
            secondary_y=False
        )
        
        # Add line for percentage of total
        percentages = [v/costs.total_amount * 100 for v in values]
        fig.add_trace(
            go.Scatter(
                name="% of Total",
                x=components,
                y=percentages,
                mode="lines+markers",
                line=dict(color=self.color_scheme["accent"]),
                marker=dict(size=8)
            ),
            secondary_y=True
        )
        
        # Update layout
        fig.update_layout(
            title=f"Cost Breakdown: {scenario.name}",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"]),
            showlegend=True,
            barmode="group",
            height=500
        )
        
        # Update axes
        fig.update_xaxes(title_text="Cost Components")
        fig.update_yaxes(title_text="Amount (€)", secondary_y=False)
        fig.update_yaxes(title_text="Percentage of Total (%)", secondary_y=True)
        
        return fig

    def create_scenario_comparison(self, scenarios: List[ComparisonScenario]) -> go.Figure:
        """Create a comparison visualization for multiple scenarios."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Total Costs Comparison",
                "Net Amount Comparison",
                "Tax Distribution",
                "Cost Structure"
            ),
            specs=[
                [{"type": "bar"}, {"type": "bar"}],
                [{"type": "pie"}, {"type": "bar"}]
            ]
        )
        
        # Prepare data
        names = [s.name for s in scenarios]
        total_costs = [sum(s.costs.taxes.values()) + sum(s.costs.fees.values()) for s in scenarios]
        net_amounts = [s.costs.net_amount for s in scenarios]
        
        # Total Costs Comparison
        fig.add_trace(
            go.Bar(
                name="Total Costs",
                x=names,
                y=total_costs,
                marker_color=self.color_scheme["primary"],
                text=[f"€{c:,.2f}" for c in total_costs],
                textposition="auto",
            ),
            row=1, col=1
        )
        
        # Net Amount Comparison
        fig.add_trace(
            go.Bar(
                name="Net Amount",
                x=names,
                y=net_amounts,
                marker_color=self.color_scheme["secondary"],
                text=[f"€{n:,.2f}" for n in net_amounts],
                textposition="auto",
            ),
            row=1, col=2
        )
        
        # Tax Distribution (Pie Chart)
        tax_types = set()
        for s in scenarios:
            tax_types.update(s.costs.taxes.keys())
        
        tax_data = {tax: [] for tax in tax_types}
        for s in scenarios:
            for tax in tax_types:
                tax_data[tax].append(s.costs.taxes.get(tax, 0))
        
        total_taxes = [sum(s.costs.taxes.values()) for s in scenarios]
        fig.add_trace(
            go.Pie(
                labels=list(tax_types),
                values=[sum(tax_data[tax]) for tax in tax_types],
                hole=0.3
            ),
            row=2, col=1
        )
        
        # Cost Structure (Stacked Bar)
        tax_components = []
        for tax in tax_types:
            tax_components.append(go.Bar(
                name=tax.replace("_", " ").title(),
                x=names,
                y=[s.costs.taxes.get(tax, 0) for s in scenarios],
                marker_color=self.color_scheme["primary"]
            ))
        
        fee_types = set()
        for s in scenarios:
            fee_types.update(s.costs.fees.keys())
        
        for fee in fee_types:
            tax_components.append(go.Bar(
                name=fee.replace("_", " ").title(),
                x=names,
                y=[s.costs.fees.get(fee, 0) for s in scenarios],
                marker_color=self.color_scheme["secondary"]
            ))
        
        for comp in tax_components:
            fig.add_trace(comp, row=2, col=2)
        
        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Scenario Comparison Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"]),
            barmode="stack"
        )
        
        return fig

    def create_optimization_analysis(self, 
                                  base_scenario: ComparisonScenario,
                                  optimized_scenario: ComparisonScenario) -> go.Figure:
        """Create a visualization comparing base and optimized scenarios."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Cost Reduction Overview",
                "Tax Savings Breakdown",
                "Fee Comparison",
                "Net Amount Improvement"
            ),
            specs=[
                [{"type": "waterfall"}, {"type": "bar"}],
                [{"type": "bar"}, {"type": "indicator"}]
            ]
        )
        
        # Cost Reduction Overview (Waterfall)
        base_total = sum(base_scenario.costs.taxes.values()) + sum(base_scenario.costs.fees.values())
        opt_total = sum(optimized_scenario.costs.taxes.values()) + sum(optimized_scenario.costs.fees.values())
        
        fig.add_trace(
            go.Waterfall(
                name="Cost Reduction",
                orientation="v",
                measure=["relative", "relative", "total"],
                x=["Base Cost", "Reduction", "Optimized Cost"],
                y=[base_total, -(base_total - opt_total), opt_total],
                connector={"line": {"color": self.color_scheme["primary"]}},
                decreasing={"marker": {"color": self.color_scheme["secondary"]}},
                increasing={"marker": {"color": self.color_scheme["danger"]}},
                totals={"marker": {"color": self.color_scheme["accent"]}}
            ),
            row=1, col=1
        )
        
        # Tax Savings Breakdown
        tax_types = set(base_scenario.costs.taxes.keys()) | set(optimized_scenario.costs.taxes.keys())
        tax_savings = []
        tax_labels = []
        
        for tax in tax_types:
            base_tax = base_scenario.costs.taxes.get(tax, 0)
            opt_tax = optimized_scenario.costs.taxes.get(tax, 0)
            if base_tax != opt_tax:
                tax_savings.append(base_tax - opt_tax)
                tax_labels.append(tax.replace("_", " ").title())
        
        fig.add_trace(
            go.Bar(
                name="Tax Savings",
                x=tax_labels,
                y=tax_savings,
                marker_color=self.color_scheme["secondary"],
                text=[f"€{s:,.2f}" for s in tax_savings],
                textposition="auto"
            ),
            row=1, col=2
        )
        
        # Fee Comparison
        fee_types = set(base_scenario.costs.fees.keys()) | set(optimized_scenario.costs.fees.keys())
        base_fees = []
        opt_fees = []
        fee_labels = []
        
        for fee in fee_types:
            base_fees.append(base_scenario.costs.fees.get(fee, 0))
            opt_fees.append(optimized_scenario.costs.fees.get(fee, 0))
            fee_labels.append(fee.replace("_", " ").title())
        
        fig.add_trace(
            go.Bar(
                name="Base Fees",
                x=fee_labels,
                y=base_fees,
                marker_color=self.color_scheme["primary"]
            ),
            row=2, col=1
        )
        
        fig.add_trace(
            go.Bar(
                name="Optimized Fees",
                x=fee_labels,
                y=opt_fees,
                marker_color=self.color_scheme["secondary"]
            ),
            row=2, col=1
        )
        
        # Net Amount Improvement
        improvement_pct = ((optimized_scenario.costs.net_amount - base_scenario.costs.net_amount) / 
                         base_scenario.costs.net_amount * 100)
        
        fig.add_trace(
            go.Indicator(
                mode="number+delta",
                value=optimized_scenario.costs.net_amount,
                delta={
                    "reference": base_scenario.costs.net_amount,
                    "relative": True,
                    "position": "top"
                },
                title={
                    "text": "Net Amount Improvement",
                    "font": {"size": 20}
                },
                number={"prefix": "€", "font": {"size": 30}}
            ),
            row=2, col=2
        )
        
        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Optimization Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )
        
        return fig

    def create_tax_efficiency_report(self, scenarios: List[ComparisonScenario]) -> go.Figure:
        """Create a comprehensive tax efficiency analysis visualization."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Effective Tax Rate Comparison",
                "Tax Efficiency Score",
                "Cost Structure Analysis",
                "Savings Opportunities"
            ),
            specs=[
                [{"type": "bar"}, {"type": "indicator"}],
                [{"type": "pie"}, {"type": "bar"}]
            ]
        )
        
        # Effective Tax Rate Comparison
        names = [s.name for s in scenarios]
        effective_rates = []
        
        for s in scenarios:
            total_tax = sum(s.costs.taxes.values())
            effective_rate = (total_tax / s.costs.total_amount) * 100
            effective_rates.append(effective_rate)
        
        fig.add_trace(
            go.Bar(
                name="Effective Tax Rate",
                x=names,
                y=effective_rates,
                marker_color=self.color_scheme["primary"],
                text=[f"{rate:.1f}%" for rate in effective_rates],
                textposition="auto"
            ),
            row=1, col=1
        )
        
        # Tax Efficiency Score
        best_rate = min(effective_rates)
        worst_rate = max(effective_rates)
        avg_rate = sum(effective_rates) / len(effective_rates)
        
        efficiency_score = 100 * (1 - (avg_rate - best_rate) / (worst_rate - best_rate))
        
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=efficiency_score,
                gauge={
                    "axis": {"range": [0, 100]},
                    "bar": {"color": self.color_scheme["primary"]},
                    "steps": [
                        {"range": [0, 33], "color": self.color_scheme["danger"]},
                        {"range": [33, 66], "color": self.color_scheme["accent"]},
                        {"range": [66, 100], "color": self.color_scheme["secondary"]}
                    ]
                },
                title={"text": "Tax Efficiency Score"}
            ),
            row=1, col=2
        )
        
        # Cost Structure Analysis
        total_costs = []
        tax_portions = []
        fee_portions = []
        
        for s in scenarios:
            total_tax = sum(s.costs.taxes.values())
            total_fees = sum(s.costs.fees.values())
            total = total_tax + total_fees
            total_costs.append(total)
            tax_portions.append(total_tax / total * 100)
            fee_portions.append(total_fees / total * 100)
        
        fig.add_trace(
            go.Pie(
                labels=["Taxes", "Fees"],
                values=[sum(tax_portions)/len(scenarios), sum(fee_portions)/len(scenarios)],
                hole=0.4,
                marker={"colors": [self.color_scheme["primary"], self.color_scheme["secondary"]]}
            ),
            row=2, col=1
        )
        
        # Savings Opportunities
        best_scenario = scenarios[effective_rates.index(min(effective_rates))]
        savings = []
        scenario_names = []
        
        for s in scenarios:
            if s != best_scenario:
                saving = (sum(s.costs.taxes.values()) + sum(s.costs.fees.values())) - \
                        (sum(best_scenario.costs.taxes.values()) + sum(best_scenario.costs.fees.values()))
                if saving > 0:
                    savings.append(saving)
                    scenario_names.append(s.name)
        
        fig.add_trace(
            go.Bar(
                name="Potential Savings",
                x=scenario_names,
                y=savings,
                marker_color=self.color_scheme["secondary"],
                text=[f"€{s:,.2f}" for s in savings],
                textposition="auto"
            ),
            row=2, col=2
        )
        
        # Update layout
        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Tax Efficiency Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )
        
        return fig

    def create_time_series_analysis(self, scenarios: List[ComparisonScenario], periods: List[str]) -> go.Figure:
        """Create a time series analysis of costs and tax efficiency."""
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=("Cost Evolution Over Time", "Tax Efficiency Trends"),
            specs=[[{"type": "scatter"}], [{"type": "scatter"}]],
            vertical_spacing=0.15
        )

        for scenario in scenarios:
            # Cost evolution
            fig.add_trace(
                go.Scatter(
                    name=f"{scenario.name} - Total Cost",
                    x=periods,
                    y=[sum(scenario.costs.taxes.values()) + sum(scenario.costs.fees.values()) for _ in periods],
                    mode="lines+markers",
                    line=dict(width=2)
                ),
                row=1, col=1
            )

            # Tax efficiency trend
            total_tax = sum(scenario.costs.taxes.values())
            efficiency_scores = [100 * (1 - total_tax / scenario.costs.total_amount) for _ in periods]
            fig.add_trace(
                go.Scatter(
                    name=f"{scenario.name} - Tax Efficiency",
                    x=periods,
                    y=efficiency_scores,
                    mode="lines+markers",
                    line=dict(dash="dot", width=2)
                ),
                row=2, col=1
            )

        fig.update_layout(
            height=800,
            showlegend=True,
            title_text="Time Series Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def create_jurisdiction_comparison(self, scenarios: List[ComparisonScenario]) -> go.Figure:
        """Create a comparison of tax implications across different jurisdictions."""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Effective Tax Rates by Jurisdiction",
                "Tax Structure Comparison",
                "Special Regime Benefits",
                "Total Cost Comparison"
            ),
            specs=[
                [{"type": "bar"}, {"type": "sunburst"}],
                [{"type": "bar"}, {"type": "heatmap"}]
            ]
        )

        jurisdictions = list(set(s.costs.jurisdiction for s in scenarios))
        
        # Effective Tax Rates
        effective_rates = []
        for j in jurisdictions:
            j_scenarios = [s for s in scenarios if s.costs.jurisdiction == j]
            if j_scenarios:
                avg_rate = np.mean([sum(s.costs.taxes.values()) / s.costs.total_amount for s in j_scenarios])
                effective_rates.append(avg_rate * 100)

        fig.add_trace(
            go.Bar(
                name="Effective Tax Rate",
                x=jurisdictions,
                y=effective_rates,
                text=[f"{rate:.1f}%" for rate in effective_rates],
                textposition="auto",
            ),
            row=1, col=1
        )

        # Tax Structure (Sunburst)
        tax_data = {j: {} for j in jurisdictions}
        for s in scenarios:
            for tax_type, amount in s.costs.taxes.items():
                if tax_type not in tax_data[s.costs.jurisdiction]:
                    tax_data[s.costs.jurisdiction][tax_type] = 0
                tax_data[s.costs.jurisdiction][tax_type] += amount

        fig.add_trace(
            go.Sunburst(
                labels=[*jurisdictions, *[t for j in jurisdictions for t in tax_data[j].keys()]],
                parents=["" for _ in jurisdictions] + [j for j in jurisdictions for _ in tax_data[j].keys()],
                values=[sum(tax_data[j].values()) for j in jurisdictions] + 
                       [v for j in jurisdictions for v in tax_data[j].values()],
            ),
            row=1, col=2
        )

        # Special Regime Benefits
        benefit_types = ["startup_benefits", "tech_transfer", "rd_incentives"]
        benefit_values = []
        for j in jurisdictions:
            j_scenarios = [s for s in scenarios if s.costs.jurisdiction == j]
            if j_scenarios:
                benefits = []
                for s in j_scenarios:
                    total_tax = sum(s.costs.taxes.values())
                    benefit = (s.costs.total_amount * 0.3 - total_tax) / s.costs.total_amount * 100
                    benefits.append(max(0, benefit))
                benefit_values.append(np.mean(benefits))

        fig.add_trace(
            go.Bar(
                name="Special Regime Benefits",
                x=jurisdictions,
                y=benefit_values,
                text=[f"{b:.1f}%" for b in benefit_values],
                textposition="auto",
            ),
            row=2, col=1
        )

        # Total Cost Comparison (Heatmap)
        cost_matrix = []
        cost_types = ["Capital Gains", "Stamp Duty", "VAT", "Other Taxes"]
        for j in jurisdictions:
            j_costs = []
            j_scenarios = [s for s in scenarios if s.costs.jurisdiction == j]
            if j_scenarios:
                for cost_type in cost_types:
                    avg_cost = np.mean([
                        sum(v for k, v in s.costs.taxes.items() if cost_type.lower() in k.lower())
                        for s in j_scenarios
                    ])
                    j_costs.append(avg_cost)
            cost_matrix.append(j_costs)

        fig.add_trace(
            go.Heatmap(
                z=cost_matrix,
                x=cost_types,
                y=jurisdictions,
                colorscale="Viridis",
                showscale=True,
            ),
            row=2, col=2
        )

        fig.update_layout(
            height=1000,
            showlegend=True,
            title_text="Cross-Jurisdiction Analysis",
            paper_bgcolor=self.color_scheme["background"],
            plot_bgcolor=self.color_scheme["background"],
            font=dict(color=self.color_scheme["text"])
        )

        return fig

    def export_report(self, scenarios: List[ComparisonScenario], output_format: str = "html") -> str:
        """Export visualization report in different formats."""
        figures = [
            self.create_cost_breakdown(scenarios[0]),
            self.create_scenario_comparison(scenarios),
            self.create_optimization_analysis(scenarios[0], scenarios[-1]),
            self.create_tax_efficiency_report(scenarios),
            self.create_time_series_analysis(scenarios, ["Q1", "Q2", "Q3", "Q4"]),
            self.create_jurisdiction_comparison(scenarios)
        ]

        if output_format == "html":
            html_content = "<html><head><title>Tax Analysis Report</title></head><body>"
            for i, fig in enumerate(figures):
                html_content += f"<div id='fig{i}'>"
                html_content += fig.to_html(full_html=False)
                html_content += "</div>"
            html_content += "</body></html>"
            return html_content

        elif output_format == "pdf":
            import pdfkit
            html_content = self.export_report(scenarios, "html")
            pdf_path = "tax_analysis_report.pdf"
            pdfkit.from_string(html_content, pdf_path)
            return pdf_path

        elif output_format == "png":
            image_paths = []
            for i, fig in enumerate(figures):
                path = f"figure_{i}.png"
                fig.write_image(path)
                image_paths.append(path)
            return image_paths

        else:
            raise ValueError(f"Unsupported output format: {output_format}") 