from typing import Dict, List, Optional, Set, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import jinja2
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import schedule
import threading
import json
from pathlib import Path
import logging
from enum import Enum
import pytz
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller
from prophet import Prophet
import networkx as nx
from textblob import TextBlob
from wordcloud import WordCloud
import pycountry
import folium
from scipy import stats
import spacy

class ReportType(Enum):
    VALUATION = "valuation"
    TRAFFIC = "traffic"
    REVENUE = "revenue"
    DOMAIN_MARKET = "domain_market"
    INDUSTRY_TRENDS = "industry_trends"
    INVESTOR_ACTIVITY = "investor_activity"
    MARKET_SENTIMENT = "market_sentiment"
    DEAL_FLOW = "deal_flow"
    SEO_PERFORMANCE = "seo_performance"
    COMPETITOR_ANALYSIS = "competitor_analysis"
    GEOGRAPHIC_DISTRIBUTION = "geographic_distribution"
    TECHNOLOGY_STACK = "technology_stack"
    CONTENT_ANALYSIS = "content_analysis"
    USER_BEHAVIOR = "user_behavior"
    CONVERSION_FUNNEL = "conversion_funnel"
    SOCIAL_MEDIA = "social_media"
    EMAIL_MARKETING = "email_marketing"
    SECURITY_AUDIT = "security_audit"
    COMPLIANCE_STATUS = "compliance_status"
    PERFORMANCE_METRICS = "performance_metrics"

class ChartType(Enum):
    LINE = "line"
    BAR = "bar"
    SCATTER = "scatter"
    PIE = "pie"
    HEATMAP = "heatmap"
    CANDLESTICK = "candlestick"
    BOX = "box"
    VIOLIN = "violin"
    TREEMAP = "treemap"
    SUNBURST = "sunburst"
    SANKEY = "sankey"
    RADAR = "radar"
    BUBBLE = "bubble"
    WATERFALL = "waterfall"
    FUNNEL = "funnel"
    GAUGE = "gauge"
    WORDCLOUD = "wordcloud"
    NETWORK = "network"
    MAP = "map"
    TIMELINE = "timeline"

@dataclass
class AdvancedAnalytics:
    seasonality_analysis: bool = False
    trend_decomposition: bool = False
    anomaly_detection: bool = False
    forecasting: bool = False
    correlation_analysis: bool = False
    cluster_analysis: bool = False
    sentiment_analysis: bool = False
    competitive_positioning: bool = False
    geographic_analysis: bool = False
    cohort_analysis: bool = False

@dataclass
class ReportConfig:
    report_type: ReportType
    time_range: Dict[str, datetime]
    filters: Dict[str, Any]
    metrics: List[str]
    chart_type: ChartType
    comparison_mode: bool
    aggregation: str
    custom_options: Dict[str, Any]
    advanced_analytics: Optional[AdvancedAnalytics] = None
    interactive_features: Dict[str, bool] = None
    export_formats: List[str] = None
    notification_preferences: Dict[str, bool] = None

@dataclass
class NewsletterConfig:
    frequency: str
    send_time: str
    recipient_groups: List[str]
    content_types: List[str]
    template_id: str
    custom_sections: Dict[str, bool]
    personalization: bool

class MarketReportingSystem:
    def __init__(self, db_connection: Any = None, email_config: Dict = None):
        self.db = db_connection
        self.email_config = email_config or self._default_email_config()
        self.setup_logging()
        self.load_templates()
        self.setup_scheduler()
        self.setup_advanced_analytics()
        self.setup_interactive_features()
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('MarketReportingSystem')

    def load_templates(self):
        """Load report and newsletter templates"""
        template_dir = Path("templates")
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
    def setup_scheduler(self):
        """Setup scheduled tasks"""
        schedule.every().monday.at("09:00").do(self.generate_weekly_newsletter)
        schedule.every().day.at("00:00").do(self.update_market_metrics)
        
        # Start scheduler in a separate thread
        scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        scheduler_thread.start()

    def generate_dynamic_report(self, config: ReportConfig) -> Dict[str, Any]:
        """Generate a dynamic report based on user configuration"""
        try:
            # Fetch data
            data = self._fetch_report_data(config)
            
            # Process data
            processed_data = self._process_report_data(data, config)
            
            # Generate visualizations
            charts = self._generate_charts(processed_data, config)
            
            # Generate insights
            insights = self._generate_insights(processed_data, config)
            
            # Compile report
            report = {
                "title": f"{config.report_type.value.title()} Report",
                "timestamp": datetime.now(),
                "config": config,
                "data": processed_data,
                "charts": charts,
                "insights": insights,
                "summary": self._generate_summary(processed_data, insights)
            }
            
            return report
        except Exception as e:
            self.logger.error(f"Error generating report: {str(e)}")
            raise

    def generate_weekly_newsletter(self):
        """Generate and send weekly newsletter"""
        try:
            # Get market trends
            trends = self._analyze_market_trends()
            
            # Get notable deals
            deals = self._get_notable_deals()
            
            # Get industry insights
            insights = self._generate_industry_insights()
            
            # Generate newsletter content
            content = self._generate_newsletter_content(trends, deals, insights)
            
            # Send newsletter
            self._send_newsletter(content)
            
            self.logger.info("Weekly newsletter sent successfully")
        except Exception as e:
            self.logger.error(f"Error generating newsletter: {str(e)}")
            raise

    def create_custom_chart(self, data: pd.DataFrame, chart_config: Dict) -> go.Figure:
        """Enhanced custom chart creation"""
        try:
            fig = go.Figure()
            
            if chart_config["type"] == ChartType.TREEMAP:
                fig = px.treemap(
                    data,
                    path=chart_config["path"],
                    values=chart_config["values"],
                    color=chart_config.get("color"),
                    title=chart_config.get("title", "")
                )
            elif chart_config["type"] == ChartType.SANKEY:
                fig = go.Figure(data=[go.Sankey(
                    node=chart_config["node"],
                    link=chart_config["link"]
                )])
            elif chart_config["type"] == ChartType.RADAR:
                fig = go.Figure(data=[go.Scatterpolar(
                    r=data[chart_config["values"]],
                    theta=data[chart_config["categories"]],
                    fill='toself'
                )])
            elif chart_config["type"] == ChartType.MAP:
                fig = self._create_map_visualization(data, chart_config)
            elif chart_config["type"] == ChartType.NETWORK:
                fig = self._create_network_visualization(data, chart_config)
            elif chart_config["type"] == ChartType.LINE:
                for column in chart_config["metrics"]:
                    fig.add_trace(go.Scatter(
                        x=data.index,
                        y=data[column],
                        name=column,
                        mode='lines+markers'
                    ))
            elif chart_config["type"] == ChartType.BAR:
                for column in chart_config["metrics"]:
                    fig.add_trace(go.Bar(
                        x=data.index,
                        y=data[column],
                        name=column
                    ))
            
            # Add interactive features
            if chart_config.get("interactive", True):
                fig.update_layout(
                    hoverlabel=dict(bgcolor="white"),
                    hovermode='closest',
                    clickmode='event+select'
                )
            
            return fig
        except Exception as e:
            self.logger.error(f"Error creating chart: {str(e)}")
            raise

    def _fetch_report_data(self, config: ReportConfig) -> pd.DataFrame:
        """Fetch data for report"""
        # Implement data fetching logic
        return pd.DataFrame()

    def _process_report_data(self, data: pd.DataFrame, config: ReportConfig) -> pd.DataFrame:
        """Process report data"""
        try:
            # Apply filters
            for column, value in config.filters.items():
                data = data[data[column] == value]
            
            # Apply time range
            data = data[
                (data.index >= config.time_range["start"]) &
                (data.index <= config.time_range["end"])
            ]
            
            # Apply aggregation
            if config.aggregation:
                data = data.resample(config.aggregation).agg({
                    metric: "mean" for metric in config.metrics
                })
            
            # Calculate comparisons if needed
            if config.comparison_mode:
                data = self._calculate_comparisons(data, config)
            
            return data
        except Exception as e:
            self.logger.error(f"Error processing data: {str(e)}")
            raise

    def _generate_charts(self, data: pd.DataFrame, config: ReportConfig) -> List[go.Figure]:
        """Generate charts for report"""
        charts = []
        
        try:
            # Create main chart
            main_chart = self.create_custom_chart(data, {
                "type": config.chart_type,
                "metrics": config.metrics,
                "title": f"{config.report_type.value.title()} Trends",
                "xaxis_title": "Date",
                "yaxis_title": config.metrics[0]
            })
            charts.append(main_chart)
            
            # Create additional charts based on config
            if config.custom_options.get("include_distribution", False):
                dist_chart = self._create_distribution_chart(data, config)
                charts.append(dist_chart)
            
            if config.custom_options.get("include_breakdown", False):
                breakdown_chart = self._create_breakdown_chart(data, config)
                charts.append(breakdown_chart)
            
            return charts
        except Exception as e:
            self.logger.error(f"Error generating charts: {str(e)}")
            raise

    def _generate_insights(self, data: pd.DataFrame, config: ReportConfig) -> List[Dict]:
        """Enhanced insight generation"""
        insights = []
        
        try:
            # Basic statistics and trends
            stats = self._calculate_statistics(data, config.metrics)
            trends = self._identify_trends(data, config.metrics)
            
            insights.extend(self._generate_statistical_insights(stats))
            insights.extend(self._generate_trend_insights(trends))
            
            # Advanced analytics if configured
            if config.advanced_analytics:
                if config.advanced_analytics.seasonality_analysis:
                    seasonal_insights = self._analyze_seasonality(data, config.metrics)
                    insights.extend(seasonal_insights)
                
                if config.advanced_analytics.anomaly_detection:
                    anomaly_insights = self._detect_anomalies(data, config.metrics)
                    insights.extend(anomaly_insights)
                
                if config.advanced_analytics.forecasting:
                    forecast_insights = self._generate_forecasts(data, config.metrics)
                    insights.extend(forecast_insights)
                
                if config.advanced_analytics.correlation_analysis:
                    correlation_insights = self._analyze_correlations(data)
                    insights.extend(correlation_insights)
                
                if config.advanced_analytics.cluster_analysis:
                    cluster_insights = self._analyze_clusters(data, config.metrics)
                    insights.extend(cluster_insights)
                
                if config.advanced_analytics.sentiment_analysis:
                    sentiment_insights = self._analyze_sentiment(data)
                    insights.extend(sentiment_insights)
            
            return insights
        except Exception as e:
            self.logger.error(f"Error generating insights: {str(e)}")
            raise

    def _analyze_market_trends(self) -> List[Dict]:
        """Analyze market trends for newsletter"""
        trends = []
        
        # Analyze domain market trends
        domain_trends = self._analyze_domain_market()
        if domain_trends:
            trends.append({
                "category": "Domain Market",
                "trends": domain_trends
            })
        
        # Analyze industry trends
        industry_trends = self._analyze_industry_trends()
        if industry_trends:
            trends.append({
                "category": "Industry",
                "trends": industry_trends
            })
        
        # Analyze valuation trends
        valuation_trends = self._analyze_valuation_trends()
        if valuation_trends:
            trends.append({
                "category": "Valuations",
                "trends": valuation_trends
            })
        
        return trends

    def _get_notable_deals(self) -> List[Dict]:
        """Get notable deals for newsletter"""
        # Implement deal retrieval logic
        return []

    def _generate_industry_insights(self) -> List[Dict]:
        """Generate industry insights for newsletter"""
        # Implement insight generation logic
        return []

    def _generate_newsletter_content(self, trends: List[Dict], deals: List[Dict], insights: List[Dict]) -> Dict:
        """Generate newsletter content"""
        try:
            template = self.env.get_template("newsletter_template.html")
            
            content = {
                "title": "Weekly Market Update",
                "date": datetime.now().strftime("%B %d, %Y"),
                "trends": trends,
                "deals": deals,
                "insights": insights,
                "summary": self._generate_market_summary(trends, deals, insights)
            }
            
            return {
                "html": template.render(**content),
                "text": self._generate_text_content(content),
                "subject": f"Market Update - {content['date']}"
            }
        except Exception as e:
            self.logger.error(f"Error generating newsletter content: {str(e)}")
            raise

    def _send_newsletter(self, content: Dict):
        """Send newsletter to subscribers"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = content['subject']
            msg['From'] = self.email_config['from_address']
            msg['To'] = self.email_config['to_address']
            
            # Attach text and HTML versions
            msg.attach(MIMEText(content['text'], 'plain'))
            msg.attach(MIMEText(content['html'], 'html'))
            
            # Send email
            with smtplib.SMTP_SSL(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                server.login(self.email_config['username'], self.email_config['password'])
                server.send_message(msg)
        except Exception as e:
            self.logger.error(f"Error sending newsletter: {str(e)}")
            raise

    def _default_email_config(self) -> Dict:
        """Get default email configuration"""
        return {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 465,
            'username': os.getenv('EMAIL_USERNAME'),
            'password': os.getenv('EMAIL_PASSWORD'),
            'from_address': 'reports@example.com',
            'to_address': 'subscribers@example.com'
        }

    def _run_scheduler(self):
        """Run scheduler loop"""
        while True:
            schedule.run_pending()
            time.sleep(60)

    def _calculate_statistics(self, data: pd.DataFrame, metrics: List[str]) -> Dict:
        """Calculate statistical measures"""
        stats = {}
        for metric in metrics:
            stats[metric] = {
                "mean": data[metric].mean(),
                "median": data[metric].median(),
                "std": data[metric].std(),
                "min": data[metric].min(),
                "max": data[metric].max()
            }
        return stats

    def _identify_trends(self, data: pd.DataFrame, metrics: List[str]) -> Dict:
        """Identify trends in data"""
        trends = {}
        for metric in metrics:
            trends[metric] = {
                "direction": "up" if data[metric].diff().mean() > 0 else "down",
                "magnitude": abs(data[metric].pct_change().mean()),
                "volatility": data[metric].std() / data[metric].mean()
            }
        return trends

    def _generate_market_summary(self, trends: List[Dict], deals: List[Dict], insights: List[Dict]) -> str:
        """Generate market summary"""
        # Implement summary generation logic
        return ""

    def _generate_text_content(self, content: Dict) -> str:
        """Generate text version of newsletter"""
        # Implement text content generation logic
        return ""

    def setup_advanced_analytics(self):
        """Setup advanced analytics components"""
        self.prophet_model = Prophet()
        self.nlp = spacy.load("en_core_web_sm")
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.kmeans = KMeans(n_clusters=5)
        
    def setup_interactive_features(self):
        """Setup interactive visualization features"""
        self.interactive_components = {
            "filters": True,
            "drill_down": True,
            "tooltips": True,
            "animations": True,
            "export": True
        }

    def _analyze_seasonality(self, data: pd.DataFrame, metrics: List[str]) -> List[Dict]:
        """Analyze seasonality patterns"""
        insights = []
        for metric in metrics:
            try:
                # Perform seasonal decomposition
                decomposition = seasonal_decompose(data[metric], period=30)
                
                # Extract seasonal patterns
                seasonal_patterns = {
                    "daily": self._extract_daily_patterns(decomposition.seasonal),
                    "weekly": self._extract_weekly_patterns(decomposition.seasonal),
                    "monthly": self._extract_monthly_patterns(decomposition.seasonal)
                }
                
                insights.append({
                    "type": "seasonality",
                    "metric": metric,
                    "patterns": seasonal_patterns,
                    "strength": self._calculate_seasonality_strength(decomposition),
                    "recommendations": self._generate_seasonal_recommendations(seasonal_patterns)
                })
            except Exception as e:
                self.logger.warning(f"Could not analyze seasonality for {metric}: {str(e)}")
                continue
                
        return insights

    def _detect_anomalies(self, data: pd.DataFrame, metrics: List[str]) -> List[Dict]:
        """Detect anomalies in time series data"""
        insights = []
        for metric in metrics:
            try:
                # Calculate rolling statistics
                rolling_mean = data[metric].rolling(window=7).mean()
                rolling_std = data[metric].rolling(window=7).std()
                
                # Detect anomalies using z-score
                z_scores = np.abs((data[metric] - rolling_mean) / rolling_std)
                anomalies = data[z_scores > 3].index.tolist()
                
                if anomalies:
                    insights.append({
                        "type": "anomaly",
                        "metric": metric,
                        "anomalies": anomalies,
                        "severity": z_scores[anomalies].tolist(),
                        "context": self._get_anomaly_context(data, metric, anomalies)
                    })
            except Exception as e:
                self.logger.warning(f"Could not detect anomalies for {metric}: {str(e)}")
                continue
                
        return insights

    def _generate_forecasts(self, data: pd.DataFrame, metrics: List[str]) -> List[Dict]:
        """Generate forecasts using Prophet"""
        insights = []
        for metric in metrics:
            try:
                # Prepare data for Prophet
                df = pd.DataFrame({
                    'ds': data.index,
                    'y': data[metric]
                })
                
                # Fit model and make predictions
                self.prophet_model.fit(df)
                future = self.prophet_model.make_future_dataframe(periods=30)
                forecast = self.prophet_model.predict(future)
                
                insights.append({
                    "type": "forecast",
                    "metric": metric,
                    "predictions": forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30).to_dict('records'),
                    "components": self._extract_forecast_components(forecast),
                    "confidence": self._calculate_forecast_confidence(forecast)
                })
            except Exception as e:
                self.logger.warning(f"Could not generate forecast for {metric}: {str(e)}")
                continue
                
        return insights

    def _analyze_correlations(self, data: pd.DataFrame) -> List[Dict]:
        """Analyze correlations between metrics"""
        try:
            # Calculate correlation matrix
            corr_matrix = data.corr()
            
            # Find significant correlations
            significant_corr = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    if abs(corr_matrix.iloc[i, j]) > 0.7:
                        significant_corr.append({
                            "metric1": corr_matrix.columns[i],
                            "metric2": corr_matrix.columns[j],
                            "correlation": corr_matrix.iloc[i, j],
                            "significance": self._test_correlation_significance(
                                data[corr_matrix.columns[i]],
                                data[corr_matrix.columns[j]]
                            )
                        })
            
            return [{
                "type": "correlation",
                "correlations": significant_corr,
                "visualization": self._create_correlation_heatmap(corr_matrix),
                "insights": self._generate_correlation_insights(significant_corr)
            }]
        except Exception as e:
            self.logger.warning(f"Could not analyze correlations: {str(e)}")
            return []

    def _analyze_clusters(self, data: pd.DataFrame, metrics: List[str]) -> List[Dict]:
        """Perform cluster analysis"""
        try:
            # Prepare data
            X = data[metrics].values
            X_scaled = self.scaler.fit_transform(X)
            
            # Perform PCA
            X_pca = self.pca.fit_transform(X_scaled)
            
            # Perform clustering
            clusters = self.kmeans.fit_predict(X_pca)
            
            return [{
                "type": "cluster",
                "clusters": self._describe_clusters(data, clusters),
                "visualization": self._create_cluster_visualization(X_pca, clusters),
                "silhouette_score": metrics.silhouette_score(X_pca, clusters),
                "recommendations": self._generate_cluster_recommendations(data, clusters)
            }]
        except Exception as e:
            self.logger.warning(f"Could not perform cluster analysis: {str(e)}")
            return []

    def _analyze_sentiment(self, data: pd.DataFrame) -> List[Dict]:
        """Analyze sentiment in textual data"""
        try:
            # Process text data
            text_data = data['text'].tolist() if 'text' in data.columns else []
            sentiments = []
            
            for text in text_data:
                blob = TextBlob(text)
                sentiments.append({
                    "text": text,
                    "polarity": blob.sentiment.polarity,
                    "subjectivity": blob.sentiment.subjectivity,
                    "entities": self._extract_entities(text)
                })
            
            return [{
                "type": "sentiment",
                "overall_sentiment": np.mean([s['polarity'] for s in sentiments]),
                "sentiment_distribution": self._calculate_sentiment_distribution(sentiments),
                "key_topics": self._extract_key_topics(text_data),
                "wordcloud": self._generate_wordcloud(text_data)
            }]
        except Exception as e:
            self.logger.warning(f"Could not analyze sentiment: {str(e)}")
            return [] 