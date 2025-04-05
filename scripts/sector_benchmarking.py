from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import pandas as pd
import numpy as np
from scipy import stats
import pycountry
import requests
import logging
from pathlib import Path

@dataclass
class BenchmarkMetric:
    name: str
    value: float
    sector_average: float
    sector_median: float
    percentile: float
    trend: str
    comparison: str
    confidence: float
    sample_size: int
    time_period: str

@dataclass
class SectorProfile:
    name: str
    country: str
    size_category: str
    main_metrics: Dict[str, float]
    trends: Dict[str, List[float]]
    sample_size: int
    last_updated: datetime

class SectorBenchmarking:
    def __init__(self):
        """Initialize the sector benchmarking system."""
        self.logger = self._setup_logging()
        self._load_sector_data()
        
        # Define standard metrics for comparison
        self.standard_metrics = {
            "financial": [
                "net_margin",
                "gross_margin",
                "operating_margin",
                "revenue_growth",
                "ebitda_margin",
                "roi",
                "debt_to_equity",
                "current_ratio"
            ],
            "operational": [
                "inventory_turnover",
                "employee_productivity",
                "customer_acquisition_cost",
                "customer_lifetime_value"
            ],
            "market": [
                "market_share",
                "customer_satisfaction",
                "brand_value",
                "online_presence_score"
            ]
        }

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger("SectorBenchmarking")
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def _load_sector_data(self):
        """Load sector benchmark data from various sources."""
        self.sector_data = {
            "e-commerce": {
                "portugal": {
                    "metrics": {
                        "net_margin": {
                            "average": 0.15,
                            "median": 0.12,
                            "percentiles": [0.05, 0.08, 0.12, 0.18, 0.25],
                            "sample_size": 150
                        },
                        "gross_margin": {
                            "average": 0.45,
                            "median": 0.42,
                            "percentiles": [0.25, 0.35, 0.42, 0.50, 0.60],
                            "sample_size": 150
                        },
                        # Add more metrics as needed
                    },
                    "trends": {
                        "2024": {
                            "net_margin": 0.15,
                            "gross_margin": 0.45
                        },
                        "2023": {
                            "net_margin": 0.14,
                            "gross_margin": 0.44
                        }
                        # Add more historical data
                    }
                }
                # Add more countries
            }
            # Add more sectors
        }

    def analyze_sector_performance(self, 
                                 metrics: Dict[str, float],
                                 sector: str,
                                 country: str,
                                 year: int = None) -> Dict[str, Any]:
        """Analyze company performance against sector benchmarks."""
        try:
            self.logger.info(f"Analyzing sector performance for {sector} in {country}")
            
            if year is None:
                year = datetime.now().year
                
            benchmark_results = []
            sector_insights = []
            
            # Get sector data
            sector_metrics = self.sector_data.get(sector, {}).get(country, {}).get("metrics", {})
            
            # Compare each metric
            for metric_name, value in metrics.items():
                if metric_name in sector_metrics:
                    sector_data = sector_metrics[metric_name]
                    
                    # Calculate percentile
                    percentile = self._calculate_percentile(value, sector_data["percentiles"])
                    
                    # Determine trend
                    trend = self._analyze_trend(sector, country, metric_name, year)
                    
                    # Generate comparison insight
                    comparison = self._generate_comparison(
                        value,
                        sector_data["average"],
                        sector_data["median"],
                        metric_name
                    )
                    
                    benchmark = BenchmarkMetric(
                        name=metric_name,
                        value=value,
                        sector_average=sector_data["average"],
                        sector_median=sector_data["median"],
                        percentile=percentile,
                        trend=trend,
                        comparison=comparison,
                        confidence=0.95,
                        sample_size=sector_data["sample_size"],
                        time_period=str(year)
                    )
                    benchmark_results.append(benchmark)
                    
                    # Generate sector insights
                    insight = self._generate_sector_insight(benchmark)
                    sector_insights.append(insight)
            
            return {
                "benchmarks": benchmark_results,
                "insights": sector_insights,
                "sector_profile": self._get_sector_profile(sector, country, year),
                "recommendations": self._generate_recommendations(benchmark_results),
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing sector performance: {str(e)}")
            raise

    def _calculate_percentile(self, value: float, percentiles: List[float]) -> float:
        """Calculate the percentile of a value within the sector."""
        for i, p in enumerate(percentiles):
            if value <= p:
                return (i / len(percentiles)) * 100
        return 100.0

    def _analyze_trend(self, sector: str, country: str, metric: str, year: int) -> str:
        """Analyze the trend of a metric over time."""
        trends = self.sector_data.get(sector, {}).get(country, {}).get("trends", {})
        
        current = trends.get(str(year), {}).get(metric)
        previous = trends.get(str(year-1), {}).get(metric)
        
        if current is None or previous is None:
            return "stable"
            
        change = ((current - previous) / previous) * 100
        
        if change > 5:
            return "increasing"
        elif change < -5:
            return "decreasing"
        else:
            return "stable"

    def _generate_comparison(self, value: float, average: float, median: float, metric_name: str) -> str:
        """Generate a comparison insight for a metric."""
        avg_diff_percent = ((value - average) / average) * 100
        med_diff_percent = ((value - median) / median) * 100
        
        if avg_diff_percent > 20:
            return f"Significantly above sector average ({avg_diff_percent:.1f}% higher)"
        elif avg_diff_percent > 5:
            return f"Above sector average ({avg_diff_percent:.1f}% higher)"
        elif avg_diff_percent < -20:
            return f"Significantly below sector average ({-avg_diff_percent:.1f}% lower)"
        elif avg_diff_percent < -5:
            return f"Below sector average ({-avg_diff_percent:.1f}% lower)"
        else:
            return "In line with sector average"

    def _generate_sector_insight(self, benchmark: BenchmarkMetric) -> Dict[str, str]:
        """Generate detailed insights for a benchmark metric."""
        return {
            "metric": benchmark.name,
            "summary": f"{benchmark.name.replace('_', ' ').title()}: {benchmark.comparison}",
            "detail": (
                f"Your {benchmark.name.replace('_', ' ')} of {benchmark.value:.1%} is at the "
                f"{benchmark.percentile:.0f}th percentile of the sector. "
                f"The sector average is {benchmark.sector_average:.1%} and the trend is {benchmark.trend}."
            ),
            "trend": benchmark.trend,
            "confidence": f"Based on a sample of {benchmark.sample_size} companies"
        }

    def _get_sector_profile(self, sector: str, country: str, year: int) -> SectorProfile:
        """Get the profile of a sector in a specific country."""
        sector_data = self.sector_data.get(sector, {}).get(country, {})
        
        return SectorProfile(
            name=sector,
            country=country,
            size_category="All",
            main_metrics=sector_data.get("metrics", {}),
            trends=sector_data.get("trends", {}),
            sample_size=150,  # Example value
            last_updated=datetime.now()
        )

    def _generate_recommendations(self, benchmarks: List[BenchmarkMetric]) -> List[Dict[str, str]]:
        """Generate recommendations based on benchmark comparisons."""
        recommendations = []
        
        for benchmark in benchmarks:
            if benchmark.percentile < 25:
                recommendations.append({
                    "metric": benchmark.name,
                    "priority": "high",
                    "action": f"Improve {benchmark.name.replace('_', ' ')} to meet sector standards",
                    "detail": (
                        f"Your {benchmark.name.replace('_', ' ')} is in the bottom quartile. "
                        f"Consider implementing industry best practices to improve this metric."
                    )
                })
            elif benchmark.percentile > 75:
                recommendations.append({
                    "metric": benchmark.name,
                    "priority": "low",
                    "action": f"Maintain strong {benchmark.name.replace('_', ' ')} performance",
                    "detail": (
                        f"Your {benchmark.name.replace('_', ' ')} is in the top quartile. "
                        f"Document and maintain current practices."
                    )
                })
        
        return recommendations 