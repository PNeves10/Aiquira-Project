from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import requests
from textblob import TextBlob
import plotly.graph_objects as go
import plotly.express as px
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import io
import base64
from collections import defaultdict
import asyncio
import aiohttp
from urllib.parse import urljoin
import json
import re
from concurrent.futures import ThreadPoolExecutor
from newspaper import Article
import tweepy
import linkedin.client
from transformers import pipeline
import logging
import seaborn as sns
from prophet import Prophet
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import networkx as nx
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from pytrends.request import TrendReq
import pycountry
from scipy import stats

@dataclass
class MarketMetrics:
    sector: str
    average_price: float
    deal_count: int
    yoy_growth: float
    sentiment_score: float
    mention_count: int
    top_keywords: List[str]

@dataclass
class SectorMetrics(MarketMetrics):
    """Enhanced sector metrics with additional KPIs."""
    # Financial Metrics
    revenue_growth: float
    ebitda_margin: float
    net_profit_margin: float
    cash_flow_ratio: float
    
    # Valuation Metrics
    ev_ebitda: float
    price_sales: float
    price_earnings: float
    
    # Operational Metrics
    customer_acquisition_cost: float
    lifetime_value: float
    churn_rate: float
    
    # Market Metrics
    market_share: float
    competitor_count: int
    market_concentration: float
    
    # Growth Metrics
    yoy_user_growth: float
    revenue_per_user: float
    expansion_rate: float
    
    # Innovation Metrics
    rd_investment_ratio: float
    patent_count: int
    tech_adoption_score: float
    
    # Risk Metrics
    market_volatility: float
    regulatory_risk_score: float
    competition_intensity: float

class MarketIntelligence:
    def __init__(self, config: Dict[str, str]):
        """Initialize the enhanced Market Intelligence system."""
        self.config = config
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.news_sources = [
            "https://eco.sapo.pt",
            "https://observador.pt",
            "https://jornaleconomico.pt",
            # Add more Portuguese news sources
        ]
        
        # Initialize social media clients
        self.twitter_client = tweepy.Client(
            bearer_token=config.get("TWITTER_BEARER_TOKEN"),
            consumer_key=config.get("TWITTER_API_KEY"),
            consumer_secret=config.get("TWITTER_API_SECRET"),
            access_token=config.get("TWITTER_ACCESS_TOKEN"),
            access_token_secret=config.get("TWITTER_ACCESS_SECRET")
        )
        
        self.linkedin_client = linkedin.client.LinkedInApplication(
            token=config.get("LINKEDIN_ACCESS_TOKEN")
        )
        
        # Initialize cache for scraped data
        self.cache = {
            "news": {},
            "social": {},
            "metrics": {}
        }
        
        self.logger = logging.getLogger(__name__)
        
        # Additional news sources
        self.news_sources.extend([
            "https://www.dinheirovivo.pt",
            "https://www.publico.pt/economia",
            "https://expresso.pt/economia",
            "https://www.jornaldenegocios.pt",
            "https://www.bloomberg.com/europe",
            "https://www.reuters.com/markets",
            "https://www.ft.com/companies"
        ])
        
        # Initialize additional analyzers
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.pytrends = TrendReq(hl='en-US', tz=360)
        
        # Initialize visualization settings
        plt.style.use('seaborn')
        sns.set_palette("husl")
        
        # Initialize sector-specific benchmarks
        self.sector_benchmarks = self._load_sector_benchmarks()
        
        # Initialize network analysis
        self.company_network = nx.Graph()
        
        # Initialize time series forecasting
        self.forecasting_models = {}

    def _load_sector_benchmarks(self) -> Dict[str, Dict]:
        """Load sector-specific benchmarks and KPIs."""
        # In production, load from database
        return {
            "E-commerce": {
                "median_cac": 25,
                "median_ltv": 150,
                "expected_growth": 0.15,
                "market_size": 5e9
            },
            "FinTech": {
                "median_cac": 200,
                "median_ltv": 1000,
                "expected_growth": 0.25,
                "market_size": 8e9
            },
            # Add more sectors...
        }

    async def generate_market_report(self, 
                                   sectors: Optional[List[str]] = None,
                                   start_date: Optional[datetime] = None,
                                   end_date: Optional[datetime] = None) -> Dict:
        """Generate an enhanced comprehensive market report."""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        # Collect and analyze data
        news_data = await self.collect_news_data(sectors, start_date, end_date)
        social_data = await self.collect_social_data(sectors, start_date, end_date)
        platform_metrics = self.analyze_platform_metrics(sectors, start_date, end_date)
        
        # Generate sector-specific metrics
        sector_metrics = {}
        for sector in (sectors or self.get_all_sectors()):
            metrics = self.calculate_sector_metrics(
                sector,
                news_data,
                social_data,
                platform_metrics
            )
            sector_metrics[sector] = metrics
        
        # Generate visualizations
        charts = self.generate_report_charts(sector_metrics)
        
        # Add new analysis sections
        report = {
            "title": "State of Digital M&A in Portugal",
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "summary": self.generate_executive_summary(sector_metrics),
            "sector_analysis": sector_metrics,
            "trends": self.analyze_trends(sector_metrics),
            "sentiment_analysis": self.analyze_overall_sentiment(news_data, social_data),
            "visualizations": charts,
            "recommendations": self.generate_recommendations(sector_metrics),
            "market_forecasts": self.generate_market_forecasts(sector_metrics),
            "competitive_landscape": self.analyze_competitive_landscape(sector_metrics),
            "innovation_analysis": self.analyze_innovation_metrics(sector_metrics),
            "risk_assessment": self.generate_risk_assessment(sector_metrics),
            "market_network": self.analyze_market_network(sector_metrics),
            "regional_analysis": await self.analyze_regional_distribution(sectors),
            "advanced_visualizations": self.generate_advanced_visualizations(sector_metrics)
        }
        
        return report

    async def collect_news_data(self, 
                              sectors: Optional[List[str]] = None,
                              start_date: Optional[datetime] = None,
                              end_date: Optional[datetime] = None) -> List[Dict]:
        """Collect news data from various sources."""
        all_articles = []
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for source in self.news_sources:
                task = asyncio.create_task(
                    self._scrape_news_source(session, source, sectors)
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            for articles in results:
                all_articles.extend(articles)
        
        # Process and analyze articles
        with ThreadPoolExecutor() as executor:
            processed_articles = list(executor.map(
                self._process_article,
                all_articles
            ))
        
        return [article for article in processed_articles if article is not None]

    async def _scrape_news_source(self, 
                                session: aiohttp.ClientSession,
                                source: str,
                                sectors: Optional[List[str]] = None) -> List[Dict]:
        """Scrape a specific news source."""
        try:
            async with session.get(source) as response:
                if response.status != 200:
                    self.logger.error(f"Failed to fetch {source}: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                articles = []
                for link in soup.find_all('a', href=True):
                    url = urljoin(source, link['href'])
                    if any(sector.lower() in url.lower() for sector in (sectors or [])):
                        articles.append({"url": url})
                
                return articles
        except Exception as e:
            self.logger.error(f"Error scraping {source}: {str(e)}")
            return []

    def _process_article(self, article_data: Dict) -> Optional[Dict]:
        """Process and analyze a single article."""
        try:
            article = Article(article_data["url"])
            article.download()
            article.parse()
            article.nlp()
            
            # Perform sentiment analysis
            sentiment = self.sentiment_analyzer(article.text[:512])[0]
            
            return {
                "url": article_data["url"],
                "title": article.title,
                "text": article.text,
                "summary": article.summary,
                "keywords": article.keywords,
                "publish_date": article.publish_date,
                "sentiment": sentiment["label"],
                "sentiment_score": sentiment["score"]
            }
        except Exception as e:
            self.logger.error(f"Error processing article {article_data['url']}: {str(e)}")
            return None

    async def collect_social_data(self,
                                sectors: Optional[List[str]] = None,
                                start_date: Optional[datetime] = None,
                                end_date: Optional[datetime] = None) -> Dict[str, List]:
        """Collect data from social media platforms."""
        social_data = {
            "twitter": await self._collect_twitter_data(sectors, start_date, end_date),
            "linkedin": await self._collect_linkedin_data(sectors, start_date, end_date)
        }
        return social_data

    async def _collect_twitter_data(self,
                                  sectors: Optional[List[str]] = None,
                                  start_date: Optional[datetime] = None,
                                  end_date: Optional[datetime] = None) -> List[Dict]:
        """Collect relevant tweets."""
        tweets = []
        search_queries = [f"M&A Portugal {sector}" for sector in (sectors or [])]
        
        for query in search_queries:
            try:
                response = self.twitter_client.search_recent_tweets(
                    query=query,
                    max_results=100,
                    tweet_fields=['created_at', 'public_metrics']
                )
                
                if response.data:
                    for tweet in response.data:
                        sentiment = self.sentiment_analyzer(tweet.text[:512])[0]
                        tweets.append({
                            "text": tweet.text,
                            "created_at": tweet.created_at,
                            "metrics": tweet.public_metrics,
                            "sentiment": sentiment["label"],
                            "sentiment_score": sentiment["score"]
                        })
            except Exception as e:
                self.logger.error(f"Error collecting Twitter data: {str(e)}")
        
        return tweets

    async def _collect_linkedin_data(self,
                                   sectors: Optional[List[str]] = None,
                                   start_date: Optional[datetime] = None,
                                   end_date: Optional[datetime] = None) -> List[Dict]:
        """Collect relevant LinkedIn posts."""
        posts = []
        # Implementation depends on LinkedIn API access level
        return posts

    def analyze_platform_metrics(self,
                               sectors: Optional[List[str]] = None,
                               start_date: Optional[datetime] = None,
                               end_date: Optional[datetime] = None) -> Dict:
        """Analyze metrics from the platform's database."""
        metrics = defaultdict(lambda: {
            "deal_count": 0,
            "total_value": 0,
            "average_value": 0,
            "growth_rate": 0
        })
        
        # In production, get this data from your database
        # This is a placeholder for demonstration
        for sector in (sectors or self.get_all_sectors()):
            metrics[sector] = {
                "deal_count": np.random.randint(10, 100),
                "total_value": np.random.uniform(1e6, 1e8),
                "average_value": np.random.uniform(1e5, 1e7),
                "growth_rate": np.random.uniform(-0.2, 0.5)
            }
        
        return dict(metrics)

    def calculate_sector_metrics(self,
                               sector: str,
                               news_data: List[Dict],
                               social_data: Dict[str, List],
                               platform_metrics: Dict) -> MarketMetrics:
        """Calculate comprehensive metrics for a sector."""
        # Filter data for the sector
        sector_news = [
            article for article in news_data
            if sector.lower() in article["text"].lower()
        ]
        
        sector_tweets = [
            tweet for tweet in social_data["twitter"]
            if sector.lower() in tweet["text"].lower()
        ]
        
        # Calculate metrics
        sentiment_scores = [
            article["sentiment_score"] for article in sector_news
        ] + [
            tweet["sentiment_score"] for tweet in sector_tweets
        ]
        
        keywords = []
        for article in sector_news:
            keywords.extend(article["keywords"])
        
        return MarketMetrics(
            sector=sector,
            average_price=platform_metrics[sector]["average_value"],
            deal_count=platform_metrics[sector]["deal_count"],
            yoy_growth=platform_metrics[sector]["growth_rate"],
            sentiment_score=np.mean(sentiment_scores) if sentiment_scores else 0,
            mention_count=len(sector_news) + len(sector_tweets),
            top_keywords=self._get_top_keywords(keywords)
        )

    def generate_report_charts(self, sector_metrics: Dict[str, MarketMetrics]) -> Dict[str, str]:
        """Generate visualizations for the report."""
        charts = {}
        
        # Deal Value by Sector
        fig = go.Figure(data=[
            go.Bar(
                x=[m.sector for m in sector_metrics.values()],
                y=[m.average_price for m in sector_metrics.values()],
                name="Average Deal Value"
            )
        ])
        fig.update_layout(title="Average Deal Value by Sector")
        charts["deal_value"] = self._fig_to_base64(fig)
        
        # Sentiment Analysis
        fig = go.Figure(data=[
            go.Scatter(
                x=[m.sector for m in sector_metrics.values()],
                y=[m.sentiment_score for m in sector_metrics.values()],
                mode='lines+markers',
                name="Sentiment Score"
            )
        ])
        fig.update_layout(title="Sector Sentiment Analysis")
        charts["sentiment"] = self._fig_to_base64(fig)
        
        # Growth Rates
        fig = go.Figure(data=[
            go.Bar(
                x=[m.sector for m in sector_metrics.values()],
                y=[m.yoy_growth * 100 for m in sector_metrics.values()],
                name="YoY Growth (%)"
            )
        ])
        fig.update_layout(title="Sector Growth Rates")
        charts["growth"] = self._fig_to_base64(fig)
        
        # Generate Word Cloud
        all_keywords = []
        for metrics in sector_metrics.values():
            all_keywords.extend(metrics.top_keywords)
        
        wordcloud = WordCloud(width=800, height=400).generate(" ".join(all_keywords))
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        charts["wordcloud"] = base64.b64encode(buf.getvalue()).decode()
        
        return charts

    def _fig_to_base64(self, fig) -> str:
        """Convert a plotly figure to base64 string."""
        img_bytes = fig.to_image(format="png")
        return base64.b64encode(img_bytes).decode()

    def _get_top_keywords(self, keywords: List[str], top_n: int = 10) -> List[str]:
        """Get top N keywords by frequency."""
        keyword_freq = defaultdict(int)
        for keyword in keywords:
            keyword_freq[keyword.lower()] += 1
        
        return sorted(
            keyword_freq.keys(),
            key=lambda k: keyword_freq[k],
            reverse=True
        )[:top_n]

    def generate_executive_summary(self, sector_metrics: Dict[str, MarketMetrics]) -> str:
        """Generate an executive summary of the findings."""
        total_deals = sum(m.deal_count for m in sector_metrics.values())
        avg_sentiment = np.mean([m.sentiment_score for m in sector_metrics.values()])
        
        # Find fastest growing sectors
        sorted_sectors = sorted(
            sector_metrics.values(),
            key=lambda m: m.yoy_growth,
            reverse=True
        )
        
        summary = f"""
        Executive Summary: State of Digital M&A in Portugal
        
        Market Overview:
        - Total Deals: {total_deals}
        - Overall Market Sentiment: {"Positive" if avg_sentiment > 0.5 else "Neutral" if avg_sentiment > 0.3 else "Negative"}
        
        Top Growing Sectors:
        """
        
        for metrics in sorted_sectors[:3]:
            summary += f"- {metrics.sector}: {metrics.yoy_growth*100:.1f}% YoY growth\n"
        
        return summary

    def analyze_trends(self, sector_metrics: Dict[str, MarketMetrics]) -> List[Dict]:
        """Analyze and identify significant trends."""
        trends = []
        
        # Identify sectors with significant growth
        for metrics in sector_metrics.values():
            if metrics.yoy_growth > 0.2:  # 20% growth threshold
                trends.append({
                    "type": "growth",
                    "sector": metrics.sector,
                    "metric": f"{metrics.yoy_growth*100:.1f}% YoY growth",
                    "significance": "high" if metrics.yoy_growth > 0.5 else "medium"
                })
            
            # Identify sectors with high sentiment
            if metrics.sentiment_score > 0.7:
                trends.append({
                    "type": "sentiment",
                    "sector": metrics.sector,
                    "metric": f"Sentiment score: {metrics.sentiment_score:.2f}",
                    "significance": "high"
                })
            
            # Identify sectors with high activity
            if metrics.mention_count > 100:
                trends.append({
                    "type": "activity",
                    "sector": metrics.sector,
                    "metric": f"{metrics.mention_count} mentions",
                    "significance": "high" if metrics.mention_count > 200 else "medium"
                })
        
        return trends

    def generate_recommendations(self, sector_metrics: Dict[str, MarketMetrics]) -> List[Dict]:
        """Generate actionable recommendations based on the analysis."""
        recommendations = []
        
        for metrics in sector_metrics.values():
            if metrics.yoy_growth > 0.3 and metrics.sentiment_score > 0.6:
                recommendations.append({
                    "sector": metrics.sector,
                    "type": "investment",
                    "recommendation": f"Consider increasing investment focus in {metrics.sector}",
                    "reasoning": [
                        f"Strong growth: {metrics.yoy_growth*100:.1f}% YoY",
                        f"Positive sentiment: {metrics.sentiment_score:.2f}",
                        f"Active market: {metrics.deal_count} recent deals"
                    ]
                })
        
        return recommendations

    def get_all_sectors(self) -> List[str]:
        """Get list of all tracked sectors."""
        return [
            "E-commerce",
            "FinTech",
            "HealthTech",
            "EdTech",
            "SaaS",
            "AI/ML",
            "Cybersecurity",
            "Digital Media",
            "IoT",
            "Clean Tech"
        ]

    def generate_market_forecasts(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict:
        """Generate market forecasts using Prophet and additional models."""
        forecasts = {}
        
        for sector, metrics in sector_metrics.items():
            # Prepare historical data
            historical_data = pd.DataFrame({
                'ds': pd.date_range(end=datetime.now(), periods=24, freq='M'),
                'y': np.random.normal(loc=metrics.average_price, scale=metrics.market_volatility, size=24)
            })
            
            # Create and fit Prophet model
            model = Prophet(
                changepoint_prior_scale=0.05,
                seasonality_mode='multiplicative'
            )
            model.fit(historical_data)
            
            # Make predictions
            future = model.make_future_dataframe(periods=12, freq='M')
            forecast = model.predict(future)
            
            # Calculate confidence intervals
            confidence_intervals = stats.norm.interval(
                0.95,
                loc=forecast['yhat'].values[-12:],
                scale=metrics.market_volatility
            )
            
            forecasts[sector] = {
                "short_term": {
                    "values": forecast['yhat'].values[-12:].tolist(),
                    "confidence_intervals": {
                        "lower": confidence_intervals[0].tolist(),
                        "upper": confidence_intervals[1].tolist()
                    }
                },
                "growth_factors": self._analyze_growth_factors(metrics),
                "market_drivers": self._identify_market_drivers(sector),
                "scenario_analysis": self._generate_scenarios(metrics)
            }
        
        return forecasts

    def analyze_competitive_landscape(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict:
        """Analyze competitive landscape and market structure."""
        landscape = {}
        
        for sector, metrics in sector_metrics.items():
            # Calculate market concentration (HHI)
            market_shares = [0.1, 0.08, 0.05]  # Example market shares
            hhi = sum(share * share for share in market_shares)
            
            # Analyze competitive intensity
            intensity = {
                "level": "high" if metrics.competitor_count > 20 else "medium" if metrics.competitor_count > 10 else "low",
                "score": metrics.competition_intensity,
                "factors": []
            }
            
            if metrics.market_volatility > 0.3:
                intensity["factors"].append("High market volatility")
            if metrics.yoy_growth > 0.25:
                intensity["factors"].append("High growth attracting new entrants")
            
            landscape[sector] = {
                "market_concentration": {
                    "hhi": hhi,
                    "type": "concentrated" if hhi > 0.25 else "moderately concentrated" if hhi > 0.15 else "competitive"
                },
                "competitive_intensity": intensity,
                "barriers_to_entry": self._analyze_entry_barriers(metrics),
                "market_maturity": self._assess_market_maturity(metrics)
            }
        
        return landscape

    def analyze_innovation_metrics(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict:
        """Analyze innovation and technological advancement."""
        innovation = {}
        
        for sector, metrics in sector_metrics.items():
            innovation[sector] = {
                "rd_investment": {
                    "ratio": metrics.rd_investment_ratio,
                    "comparison": "above_average" if metrics.rd_investment_ratio > 0.1 else "below_average"
                },
                "patent_analysis": {
                    "count": metrics.patent_count,
                    "yoy_growth": 0.15  # Example growth rate
                },
                "tech_adoption": {
                    "score": metrics.tech_adoption_score,
                    "key_technologies": self._identify_key_technologies(sector)
                },
                "innovation_index": self._calculate_innovation_index(metrics)
            }
        
        return innovation

    def generate_risk_assessment(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict:
        """Generate risk assessment for the sector."""
        risk_assessment = {}
        
        for sector, metrics in sector_metrics.items():
            risk_assessment[sector] = {
                "market_volatility": metrics.market_volatility,
                "regulatory_risk": metrics.regulatory_risk_score,
                "competition_intensity": metrics.competition_intensity,
                "risk_level": self._assess_risk_level(metrics)
            }
        
        return risk_assessment

    def analyze_market_network(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict:
        """Analyze market relationships and network effects."""
        network_analysis = {}
        
        for sector, metrics in sector_metrics.items():
            # Calculate network centrality
            centrality = nx.degree_centrality(self.company_network)
            eigenvector_centrality = nx.eigenvector_centrality_numpy(self.company_network)
            
            network_analysis[sector] = {
                "centrality": {
                    "degree": max(centrality.values()),
                    "eigenvector": max(eigenvector_centrality.values())
                },
                "clustering_coefficient": nx.average_clustering(self.company_network),
                "key_players": self._identify_key_players(sector),
                "community_structure": self._analyze_communities(sector)
            }
        
        return network_analysis

    async def analyze_regional_distribution(self, sectors: Optional[List[str]] = None) -> Dict:
        """Analyze regional distribution and market penetration."""
        regions = {}
        
        for region in ["North", "Center", "South", "Islands"]:
            region_data = await self._collect_regional_data(region, sectors)
            regions[region] = {
                "market_size": sum(data["size"] for data in region_data.values()),
                "growth_rate": np.mean([data["growth"] for data in region_data.values()]),
                "sector_distribution": {
                    sector: data for sector, data in region_data.items()
                },
                "opportunities": self._identify_regional_opportunities(region, region_data)
            }
        
        return regions

    def _analyze_entry_barriers(self, metrics: SectorMetrics) -> Dict:
        """Analyze barriers to entry for a sector."""
        barriers = []
        
        if metrics.customer_acquisition_cost > 100:
            barriers.append({
                "type": "high_cac",
                "severity": "high",
                "impact": "Difficult customer acquisition"
            })
        
        if metrics.market_concentration > 0.7:
            barriers.append({
                "type": "market_concentration",
                "severity": "high",
                "impact": "Dominated by incumbents"
            })
        
        return {
            "total_score": len(barriers) * 0.2,
            "factors": barriers
        }

    def _assess_market_maturity(self, metrics: SectorMetrics) -> Dict:
        """Assess market maturity stage."""
        growth_score = metrics.yoy_growth * 0.4 + metrics.expansion_rate * 0.6
        
        if growth_score > 0.5:
            stage = "growth"
        elif growth_score > 0.2:
            stage = "maturity"
        else:
            stage = "decline"
        
        return {
            "stage": stage,
            "growth_score": growth_score,
            "characteristics": self._get_stage_characteristics(stage)
        }

    def _calculate_innovation_index(self, metrics: SectorMetrics) -> float:
        """Calculate composite innovation index."""
        weights = {
            "rd_investment": 0.3,
            "patent_count": 0.2,
            "tech_adoption": 0.3,
            "growth": 0.2
        }
        
        return (
            weights["rd_investment"] * metrics.rd_investment_ratio +
            weights["patent_count"] * (metrics.patent_count / 100) +
            weights["tech_adoption"] * metrics.tech_adoption_score +
            weights["growth"] * metrics.yoy_growth
        )

    def _analyze_growth_factors(self, metrics: SectorMetrics) -> List[Dict]:
        """Analyze factors contributing to growth."""
        factors = []
        
        if metrics.yoy_user_growth > 0.2:
            factors.append({
                "factor": "user_growth",
                "impact": "high",
                "sustainability": "medium"
            })
        
        if metrics.revenue_per_user > self.sector_benchmarks.get(metrics.sector, {}).get("median_ltv", 0):
            factors.append({
                "factor": "monetization",
                "impact": "medium",
                "sustainability": "high"
            })
        
        return factors

    def _identify_market_drivers(self, sector: str) -> List[Dict]:
        """Identify key market drivers."""
        return [
            {
                "driver": "technological_advancement",
                "impact": "high",
                "trend": "increasing"
            },
            {
                "driver": "consumer_behavior",
                "impact": "medium",
                "trend": "stable"
            }
        ]

    def _generate_scenarios(self, metrics: SectorMetrics) -> List[Dict]:
        """Generate market scenarios."""
        return [
            {
                "scenario": "optimistic",
                "growth_rate": metrics.yoy_growth * 1.5,
                "probability": 0.3
            },
            {
                "scenario": "base",
                "growth_rate": metrics.yoy_growth,
                "probability": 0.5
            },
            {
                "scenario": "pessimistic",
                "growth_rate": metrics.yoy_growth * 0.5,
                "probability": 0.2
            }
        ]

    def _identify_key_technologies(self, sector: str) -> List[str]:
        """Identify key technologies for a sector."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust technology identification logic
        return ["AI", "Blockchain", "Cloud Computing"]

    def _assess_risk_level(self, metrics: SectorMetrics) -> str:
        """Assess risk level based on metrics."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust risk assessment logic
        if metrics.market_volatility > 0.3:
            return "High"
        elif metrics.market_volatility > 0.1:
            return "Medium"
        else:
            return "Low"

    def _get_stage_characteristics(self, stage: str) -> str:
        """Get characteristics of a market stage."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust stage characterization logic
        if stage == "growth":
            return "The market is experiencing rapid growth and expansion."
        elif stage == "maturity":
            return "The market is mature and stable, with limited growth potential."
        else:
            return "The market is in decline and experiencing contraction."

    def _identify_key_players(self, sector: str) -> List[str]:
        """Identify key players in the market."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust key player identification logic
        return ["Company A", "Company B"]

    def _analyze_communities(self, sector: str) -> str:
        """Analyze community structure in the market."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust community analysis logic
        return "The market is fragmented into multiple communities."

    def _identify_regional_opportunities(self, region: str, data: Dict) -> List[Dict]:
        """Identify regional opportunities based on data."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust regional opportunity identification logic
        opportunities = []
        for sector, sector_data in data.items():
            if sector_data["growth"] > 0.1:
                opportunities.append({
                    "sector": sector,
                    "growth_rate": sector_data["growth"],
                    "market_size": sector_data["size"],
                    "region": region
                })
        return opportunities

    def _collect_regional_data(self, region: str, sectors: Optional[List[str]] = None) -> Dict:
        """Collect regional data for a given region and sectors."""
        # This is a placeholder implementation. In a real-world scenario, you might want to implement a more robust regional data collection logic
        data = {}
        for sector in (sectors or self.get_all_sectors()):
            data[sector] = {
                "growth": np.random.uniform(0.05, 0.2),
                "size": np.random.uniform(1e6, 1e9)
            }
        return data

    def generate_advanced_visualizations(self, sector_metrics: Dict[str, SectorMetrics]) -> Dict[str, str]:
        """Generate enhanced visualizations for the report."""
        charts = {}
        
        # Market Position Matrix
        fig = go.Figure()
        for metric in sector_metrics.values():
            fig.add_trace(go.Scatter(
                x=[metric.market_share],
                y=[metric.yoy_growth],
                mode='markers+text',
                name=metric.sector,
                text=[metric.sector],
                marker=dict(
                    size=metric.deal_count * 2,
                    sizemode='area',
                    sizeref=2.*max([m.deal_count for m in sector_metrics.values()])/(40.**2),
                    sizemin=4
                )
            ))
        fig.update_layout(
            title="Market Position Matrix",
            xaxis_title="Market Share (%)",
            yaxis_title="YoY Growth (%)",
            showlegend=False
        )
        charts["market_position"] = self._fig_to_base64(fig)
        
        # Valuation Metrics Comparison
        fig = go.Figure()
        metrics = ["ev_ebitda", "price_sales", "price_earnings"]
        for metric in metrics:
            fig.add_trace(go.Bar(
                name=metric.replace("_", "/"),
                x=[m.sector for m in sector_metrics.values()],
                y=[getattr(m, metric) for m in sector_metrics.values()]
            ))
        fig.update_layout(
            title="Valuation Metrics by Sector",
            barmode='group'
        )
        charts["valuation_metrics"] = self._fig_to_base64(fig)
        
        # Innovation Radar
        categories = ['R&D Investment', 'Patents', 'Tech Adoption', 'Growth Rate', 'Market Share']
        fig = go.Figure()
        for metric in sector_metrics.values():
            fig.add_trace(go.Scatterpolar(
                r=[
                    metric.rd_investment_ratio * 100,
                    metric.patent_count / 10,
                    metric.tech_adoption_score * 100,
                    metric.yoy_growth * 100,
                    metric.market_share * 100
                ],
                theta=categories,
                fill='toself',
                name=metric.sector
            ))
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )),
            showlegend=True,
            title="Innovation Radar"
        )
        charts["innovation_radar"] = self._fig_to_base64(fig)
        
        # Risk Heat Map
        risk_data = []
        for metric in sector_metrics.values():
            risk_data.append([
                metric.market_volatility,
                metric.regulatory_risk_score,
                metric.competition_intensity
            ])
        
        fig = go.Figure(data=go.Heatmap(
            z=risk_data,
            x=['Market Volatility', 'Regulatory Risk', 'Competition'],
            y=[m.sector for m in sector_metrics.values()],
            colorscale='RdYlGn_r'
        ))
        fig.update_layout(title="Risk Heat Map")
        charts["risk_heatmap"] = self._fig_to_base64(fig)
        
        # Network Graph
        G = self.company_network
        pos = nx.spring_layout(G)
        
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])

        node_x = []
        node_y = []
        for node in G.nodes():
            x, y = pos[node]
            node_x.append(x)
            node_y.append(y)
            
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=edge_x, y=edge_y,
            line=dict(width=0.5, color='#888'),
            hoverinfo='none',
            mode='lines'
        ))
        fig.add_trace(go.Scatter(
            x=node_x, y=node_y,
            mode='markers+text',
            hoverinfo='text',
            text=list(G.nodes()),
            marker=dict(
                size=10,
                line_width=2
            )
        ))
        fig.update_layout(title="Market Network Analysis")
        charts["network_graph"] = self._fig_to_base64(fig)
        
        return charts 