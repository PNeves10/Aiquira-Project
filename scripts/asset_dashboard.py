import dash
from dash import html, dcc
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output, State
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict
from asset_recommendations import AssetRecommender, Asset, AssetType
import threading
import time
from queue import Queue
import json

class AssetDashboard:
    def __init__(self, recommender: AssetRecommender):
        self.recommender = recommender
        self.app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
        self.update_queue = Queue()
        self.setup_layout()
        self.setup_callbacks()
        self.start_update_thread()
    
    def start_update_thread(self):
        """Start a background thread for real-time updates"""
        def update_loop():
            while True:
                # Check for new assets every 5 minutes
                time.sleep(300)
                self.update_queue.put("update")
        
        thread = threading.Thread(target=update_loop, daemon=True)
        thread.start()
    
    def setup_layout(self):
        """Setup the enhanced dashboard layout"""
        self.app.layout = dbc.Container([
            # Header with real-time clock
            dbc.Row([
                dbc.Col(html.H1("Asset Marketplace Dashboard", className="text-center my-4")),
                dbc.Col(html.Div(id='live-clock', className="text-right my-4"))
            ]),
            
            # Filters and Controls
            dbc.Row([
                dbc.Col([
                    html.H4("Select User"),
                    dcc.Dropdown(id='user-dropdown', options=[], value=None)
                ], width=3),
                dbc.Col([
                    html.H4("Asset Type Filter"),
                    dcc.Dropdown(
                        id='asset-type-filter',
                        options=[{'label': t.value, 'value': t.name} for t in AssetType],
                        value=None,
                        multi=True
                    )
                ], width=3),
                dbc.Col([
                    html.H4("Time Range"),
                    dcc.Dropdown(
                        id='time-range',
                        options=[
                            {'label': 'Last 7 days', 'value': 7},
                            {'label': 'Last 30 days', 'value': 30},
                            {'label': 'Last 90 days', 'value': 90}
                        ],
                        value=30
                    )
                ], width=3),
                dbc.Col([
                    html.H4("Market Segment"),
                    dcc.Dropdown(
                        id='market-segment',
                        options=[
                            {'label': 'All', 'value': 'all'},
                            {'label': 'High Growth', 'value': 'high_growth'},
                            {'label': 'Established', 'value': 'established'},
                            {'label': 'Distressed', 'value': 'distressed'}
                        ],
                        value='all'
                    )
                ], width=3)
            ], className="mb-4"),
            
            # Market Overview Cards
            dbc.Row([
                dbc.Col(dbc.Card([
                    dbc.CardBody([
                        html.H5("Total Assets", className="card-title"),
                        html.H3(id="total-assets", className="card-text")
                    ])
                ]), width=3),
                dbc.Col(dbc.Card([
                    dbc.CardBody([
                        html.H5("Average Price", className="card-title"),
                        html.H3(id="avg-price", className="card-text")
                    ])
                ]), width=3),
                dbc.Col(dbc.Card([
                    dbc.CardBody([
                        html.H5("Market Volume", className="card-title"),
                        html.H3(id="market-volume", className="card-text")
                    ])
                ]), width=3),
                dbc.Col(dbc.Card([
                    dbc.CardBody([
                        html.H5("Price Trend", className="card-title"),
                        html.H3(id="price-trend", className="card-text")
                    ])
                ]), width=3)
            ], className="mb-4"),
            
            # Main Tabs
            dbc.Tabs([
                # Recommendations Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            html.H4("Recommendation Score Distribution"),
                            dcc.Graph(id='recommendations-distribution')
                        ], width=6),
                        dbc.Col([
                            html.H4("Top Recommendations"),
                            dcc.Graph(id='recommendations-gauge')
                        ], width=6)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Recommendation Metrics"),
                            dcc.Graph(id='recommendations-metrics')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Recommendation Details"),
                            html.Div(id='recommendations-table')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Historical Performance"),
                            dcc.Graph(id='historical-performance')
                        ], width=12)
                    ])
                ], label="Recommendations"),
                
                # Opportunities Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            html.H4("Opportunity Score Distribution"),
                            dcc.Graph(id='opportunities-distribution')
                        ], width=6),
                        dbc.Col([
                            html.H4("Opportunity Alerts"),
                            dcc.Graph(id='opportunities-gauge')
                        ], width=6)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Opportunity Metrics"),
                            dcc.Graph(id='opportunities-metrics')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Alert Details"),
                            html.Div(id='opportunities-table')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Market Timing Analysis"),
                            dcc.Graph(id='market-timing')
                        ], width=12)
                    ])
                ], label="Opportunities"),
                
                # Market Analysis Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            html.H4("Market Trends"),
                            dcc.Graph(id='market-trends')
                        ], width=6),
                        dbc.Col([
                            html.H4("Asset Distribution"),
                            dcc.Graph(id='asset-distribution')
                        ], width=6)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Price Analysis"),
                            dcc.Graph(id='price-analysis')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Market Sentiment"),
                            dcc.Graph(id='market-sentiment')
                        ], width=6),
                        dbc.Col([
                            html.H4("Competitive Landscape"),
                            dcc.Graph(id='competitive-landscape')
                        ], width=6)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Risk Analysis"),
                            dcc.Graph(id='risk-analysis')
                        ], width=12)
                    ])
                ], label="Market Analysis"),
                
                # Portfolio Analysis Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            html.H4("Portfolio Performance"),
                            dcc.Graph(id='portfolio-performance')
                        ], width=6),
                        dbc.Col([
                            html.H4("Asset Allocation"),
                            dcc.Graph(id='asset-allocation')
                        ], width=6)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Risk Exposure"),
                            dcc.Graph(id='risk-exposure')
                        ], width=12)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            html.H4("Diversification Analysis"),
                            dcc.Graph(id='diversification-analysis')
                        ], width=12)
                    ])
                ], label="Portfolio Analysis")
            ]),
            
            # Hidden div for real-time updates
            dcc.Interval(id='interval-component', interval=1000, n_intervals=0),
            html.Div(id='update-trigger', style={'display': 'none'})
        ], fluid=True)
    
    def setup_callbacks(self):
        """Setup enhanced dashboard callbacks"""
        @self.app.callback(
            Output('live-clock', 'children'),
            [Input('interval-component', 'n_intervals')]
        )
        def update_clock(n):
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        @self.app.callback(
            Output('update-trigger', 'children'),
            [Input('interval-component', 'n_intervals')]
        )
        def check_updates(n):
            if not self.update_queue.empty():
                self.update_queue.get()
                return "update"
            return "no-update"
        
        @self.app.callback(
            [Output('total-assets', 'children'),
             Output('avg-price', 'children'),
             Output('market-volume', 'children'),
             Output('price-trend', 'children')],
            [Input('update-trigger', 'children')]
        )
        def update_market_overview(trigger):
            total_assets = len(self.recommender.assets)
            avg_price = sum(asset.price for asset in self.recommender.assets) / total_assets if total_assets > 0 else 0
            market_volume = sum(asset.price for asset in self.recommender.assets)
            
            # Calculate price trend
            recent_assets = [asset for asset in self.recommender.assets 
                           if asset.listing_date >= datetime.now() - timedelta(days=30)]
            if len(recent_assets) >= 2:
                price_trend = ((recent_assets[-1].price - recent_assets[0].price) / recent_assets[0].price) * 100
                trend_text = f"{price_trend:+.1f}%"
            else:
                trend_text = "N/A"
            
            return (
                f"{total_assets:,}",
                f"${avg_price:,.2f}",
                f"${market_volume:,.2f}",
                trend_text
            )
        
        # Enhanced recommendation callbacks
        @self.app.callback(
            [Output('recommendations-distribution', 'figure'),
             Output('recommendations-gauge', 'figure'),
             Output('recommendations-metrics', 'figure'),
             Output('recommendations-table', 'children'),
             Output('historical-performance', 'figure')],
            [Input('user-dropdown', 'value'),
             Input('asset-type-filter', 'value'),
             Input('time-range', 'value'),
             Input('market-segment', 'value')]
        )
        def update_recommendations(user_id, asset_types, days, market_segment):
            if not user_id:
                return {}, {}, {}, html.Div("Please select a user"), {}
            
            recommendations = self.recommender.get_recommendations(user_id)
            
            # Distribution plot
            scores = [self.recommender._calculate_asset_score(r) for r in recommendations]
            dist_fig = px.histogram(
                pd.DataFrame({'Score': scores}),
                x='Score',
                title='Recommendation Score Distribution',
                nbins=20
            )
            
            # Gauge chart
            gauge_fig = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=len(recommendations),
                title={'text': "Recommendations"},
                gauge={'axis': {'range': [0, 10]}},
                delta={'reference': 5}
            ))
            
            # Metrics visualization
            metrics_data = pd.DataFrame({
                'Asset': [r.name for r in recommendations],
                'Price': [r.price for r in recommendations],
                'Revenue': [r.monthly_revenue for r in recommendations],
                'Growth': [r.growth_rate for r in recommendations],
                'Risk': [r.overall_risk_score for r in recommendations]
            })
            metrics_fig = px.parallel_coordinates(
                metrics_data,
                color='Price',
                title='Recommendation Metrics Comparison'
            )
            
            # Historical performance
            hist_data = pd.DataFrame({
                'Date': pd.date_range(end=datetime.now(), periods=days),
                'Price': np.random.normal(100000, 20000, days),
                'Revenue': np.random.normal(50000, 10000, days),
                'Growth': np.random.normal(0.1, 0.05, days)
            })
            hist_fig = px.line(
                hist_data,
                x='Date',
                y=['Price', 'Revenue', 'Growth'],
                title='Historical Performance'
            )
            
            # Recommendations table
            table = dbc.Table([
                html.Thead(html.Tr([
                    html.Th("Asset"),
                    html.Th("Type"),
                    html.Th("Price"),
                    html.Th("Revenue"),
                    html.Th("Growth"),
                    html.Th("Risk"),
                    html.Th("Score")
                ])),
                html.Tbody([
                    html.Tr([
                        html.Td(rec.name),
                        html.Td(rec.type.value),
                        html.Td(f"${rec.price:,.2f}"),
                        html.Td(f"${rec.monthly_revenue:,.2f}"),
                        html.Td(f"{rec.growth_rate:.1%}"),
                        html.Td(f"{rec.overall_risk_score:.1f}"),
                        html.Td(f"{self.recommender._calculate_asset_score(rec):.2%}")
                    ]) for rec in recommendations
                ])
            ], bordered=True, hover=True)
            
            return dist_fig, gauge_fig, metrics_fig, table, hist_fig
        
        # Enhanced opportunities callbacks
        @self.app.callback(
            [Output('opportunities-distribution', 'figure'),
             Output('opportunities-gauge', 'figure'),
             Output('opportunities-metrics', 'figure'),
             Output('opportunities-table', 'children'),
             Output('market-timing', 'figure')],
            [Input('user-dropdown', 'value'),
             Input('asset-type-filter', 'value'),
             Input('time-range', 'value'),
             Input('market-segment', 'value')]
        )
        def update_opportunities(user_id, asset_types, days, market_segment):
            if not user_id:
                return {}, {}, {}, html.Div("Please select a user"), {}
            
            alerts = self.recommender.get_opportunity_alerts(user_id)
            
            # Distribution plot
            scores = [a['opportunity_score'] for a in alerts]
            dist_fig = px.histogram(
                pd.DataFrame({'Score': scores}),
                x='Score',
                title='Opportunity Score Distribution',
                nbins=20
            )
            
            # Gauge chart
            gauge_fig = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=len(alerts),
                title={'text': "Opportunity Alerts"},
                gauge={'axis': {'range': [0, 20]}},
                delta={'reference': 10}
            ))
            
            # Metrics visualization
            metrics_data = pd.DataFrame({
                'Asset': [a['asset_name'] for a in alerts],
                'Price Difference': [a['price_difference'] for a in alerts],
                'Growth Rate': [a['growth_rate'] for a in alerts],
                'Market Share': [a['market_share'] for a in alerts],
                'Risk Score': [a['risk_score'] for a in alerts]
            })
            metrics_fig = px.parallel_coordinates(
                metrics_data,
                color='Price Difference',
                title='Opportunity Metrics Comparison'
            )
            
            # Market timing analysis
            timing_data = pd.DataFrame({
                'Date': pd.date_range(end=datetime.now(), periods=days),
                'Price': np.random.normal(100000, 20000, days),
                'Volume': np.random.normal(100, 20, days),
                'Sentiment': np.random.normal(0.5, 0.2, days)
            })
            timing_fig = px.line(
                timing_data,
                x='Date',
                y=['Price', 'Volume', 'Sentiment'],
                title='Market Timing Analysis'
            )
            
            # Alerts table
            table = dbc.Table([
                html.Thead(html.Tr([
                    html.Th("Asset"),
                    html.Th("Type"),
                    html.Th("Price"),
                    html.Th("Value"),
                    html.Th("Discount"),
                    html.Th("Growth"),
                    html.Th("Risk"),
                    html.Th("Score")
                ])),
                html.Tbody([
                    html.Tr([
                        html.Td(alert['asset_name']),
                        html.Td(alert['asset_type']),
                        html.Td(f"${alert['current_price']:,.2f}"),
                        html.Td(f"${alert['market_value']:,.2f}"),
                        html.Td(f"{alert['price_difference']:.1f}%"),
                        html.Td(f"{alert['growth_rate']:.1%}"),
                        html.Td(f"{alert['risk_score']:.1f}"),
                        html.Td(f"{alert['opportunity_score']:.2%}")
                    ]) for alert in alerts
                ])
            ], bordered=True, hover=True)
            
            return dist_fig, gauge_fig, metrics_fig, table, timing_fig
        
        # Enhanced market analysis callbacks
        @self.app.callback(
            [Output('market-trends', 'figure'),
             Output('asset-distribution', 'figure'),
             Output('price-analysis', 'figure'),
             Output('market-sentiment', 'figure'),
             Output('competitive-landscape', 'figure'),
             Output('risk-analysis', 'figure')],
            [Input('asset-type-filter', 'value'),
             Input('time-range', 'value'),
             Input('market-segment', 'value')]
        )
        def update_market_analysis(asset_types, days, market_segment):
            # Market trends
            trends_data = pd.DataFrame({
                'Date': pd.date_range(end=datetime.now(), periods=days),
                'Average Price': np.random.normal(100000, 20000, days),
                'Median Price': np.random.normal(80000, 15000, days),
                'Volume': np.random.normal(50, 10, days)
            })
            trends_fig = px.line(
                trends_data,
                x='Date',
                y=['Average Price', 'Median Price', 'Volume'],
                title='Market Price Trends'
            )
            
            # Asset distribution
            dist_data = pd.DataFrame({
                'Type': [t.value for t in AssetType],
                'Count': np.random.randint(10, 100, len(AssetType)),
                'Value': np.random.normal(100000, 30000, len(AssetType))
            })
            dist_fig = px.treemap(
                dist_data,
                path=['Type'],
                values='Value',
                title='Asset Distribution by Type'
            )
            
            # Price analysis
            price_data = pd.DataFrame({
                'Type': [t.value for t in AssetType],
                'Min Price': np.random.normal(50000, 10000, len(AssetType)),
                'Max Price': np.random.normal(150000, 30000, len(AssetType)),
                'Median Price': np.random.normal(100000, 20000, len(AssetType))
            })
            price_fig = px.box(
                price_data,
                x='Type',
                y=['Min Price', 'Median Price', 'Max Price'],
                title='Price Distribution by Asset Type'
            )
            
            # Market sentiment
            sentiment_data = pd.DataFrame({
                'Date': pd.date_range(end=datetime.now(), periods=days),
                'Sentiment': np.random.normal(0.5, 0.2, days),
                'Volume': np.random.normal(100, 20, days)
            })
            sentiment_fig = px.scatter(
                sentiment_data,
                x='Date',
                y='Sentiment',
                size='Volume',
                title='Market Sentiment Analysis'
            )
            
            # Competitive landscape
            comp_data = pd.DataFrame({
                'Position': ['Leader', 'Challenger', 'Follower', 'Niche'],
                'Count': np.random.randint(5, 20, 4),
                'Market Share': np.random.normal(0.3, 0.1, 4)
            })
            comp_fig = px.bar(
                comp_data,
                x='Position',
                y=['Count', 'Market Share'],
                title='Competitive Landscape'
            )
            
            # Risk analysis
            risk_data = pd.DataFrame({
                'Risk Type': ['Market', 'Technology', 'Operational', 'Financial'],
                'Score': np.random.normal(50, 20, 4),
                'Impact': np.random.normal(0.5, 0.2, 4)
            })
            risk_fig = px.scatter(
                risk_data,
                x='Score',
                y='Impact',
                color='Risk Type',
                size='Score',
                title='Risk Analysis'
            )
            
            return trends_fig, dist_fig, price_fig, sentiment_fig, comp_fig, risk_fig
        
        # Portfolio analysis callbacks
        @self.app.callback(
            [Output('portfolio-performance', 'figure'),
             Output('asset-allocation', 'figure'),
             Output('risk-exposure', 'figure'),
             Output('diversification-analysis', 'figure')],
            [Input('user-dropdown', 'value'),
             Input('time-range', 'value')]
        )
        def update_portfolio_analysis(user_id, days):
            if not user_id:
                return {}, {}, {}, {}
            
            # Portfolio performance
            perf_data = pd.DataFrame({
                'Date': pd.date_range(end=datetime.now(), periods=days),
                'Value': np.random.normal(1000000, 200000, days),
                'Return': np.random.normal(0.1, 0.05, days)
            })
            perf_fig = px.line(
                perf_data,
                x='Date',
                y=['Value', 'Return'],
                title='Portfolio Performance'
            )
            
            # Asset allocation
            alloc_data = pd.DataFrame({
                'Type': [t.value for t in AssetType],
                'Allocation': np.random.dirichlet(np.ones(len(AssetType))),
                'Value': np.random.normal(100000, 30000, len(AssetType))
            })
            alloc_fig = px.pie(
                alloc_data,
                values='Allocation',
                names='Type',
                title='Asset Allocation'
            )
            
            # Risk exposure
            risk_data = pd.DataFrame({
                'Risk Type': ['Market', 'Credit', 'Liquidity', 'Operational'],
                'Exposure': np.random.normal(0.3, 0.1, 4),
                'Impact': np.random.normal(0.5, 0.2, 4)
            })
            risk_fig = px.bar(
                risk_data,
                x='Risk Type',
                y=['Exposure', 'Impact'],
                title='Risk Exposure Analysis'
            )
            
            # Diversification analysis
            div_data = pd.DataFrame({
                'Metric': ['Type', 'Geography', 'Sector', 'Strategy'],
                'Score': np.random.normal(0.7, 0.1, 4),
                'Target': [0.8, 0.8, 0.8, 0.8]
            })
            div_fig = px.bar(
                div_data,
                x='Metric',
                y=['Score', 'Target'],
                title='Diversification Analysis'
            )
            
            return perf_fig, alloc_fig, risk_fig, div_fig
    
    def run(self, debug: bool = False):
        """Run the dashboard"""
        self.app.run_server(debug=debug) 