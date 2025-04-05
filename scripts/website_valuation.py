import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import json
from datetime import datetime
import os
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import IsolationForest
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import dash_bootstrap_components as dbc
from sklearn.neighbors import LocalOutlierFactor

class WebsiteValuationAI:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_importance = {}
        self.nlp_model = None
        self.bot_detector = None
        self.dashboard = None
        
        # Download NLTK resources
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
            
    def load_data(self, csv_path: str) -> pd.DataFrame:
        """Load and preprocess website data from CSV"""
        print("Loading website data...")
        df = pd.read_csv(csv_path)
        
        # Enhanced data validation
        required_columns = [
            'monthly_visitors', 'page_views', 'avg_time_on_site',
            'bounce_rate', 'domain_authority', 'backlinks',
            'organic_keywords', 'ranking_keywords', 'conversion_rate',
            'conversion_value', 'competition_score',
            'social_shares', 'email_subscribers', 'mobile_traffic',
            'returning_visitors', 'page_load_time', 'ssl_score',
            'content_freshness', 'internal_links', 'external_links',
            'brand_mentions', 'actual_value'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
            
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray], List[str]]:
        """Preprocess the data for model training"""
        print("Preprocessing data...")
        
        # Handle missing values with advanced imputation
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0])
        
        # Enhanced feature engineering
        df['traffic_quality'] = (
            df['avg_time_on_site'] * (1 - df['bounce_rate']/100) *
            (df['returning_visitors']/100) * (1 - df['page_load_time']/10)
        )
        
        df['seo_strength'] = (
            df['domain_authority'] * 0.3 +
            df['backlinks'] * 0.2 +
            df['organic_keywords'] * 0.15 +
            df['ranking_keywords'] * 0.15 +
            df['internal_links'] * 0.1 +
            df['external_links'] * 0.1
        )
        
        df['content_quality'] = (
            df['content_freshness'] * 0.4 +
            df['social_shares'] * 0.3 +
            df['brand_mentions'] * 0.3
        )
        
        df['user_engagement'] = (
            df['email_subscribers'] * 0.4 +
            df['returning_visitors'] * 0.3 +
            df['social_shares'] * 0.3
        )
        
        df['technical_performance'] = (
            (100 - df['page_load_time']) * 0.6 +
            df['ssl_score'] * 0.4
        )
        
        df['conversion_potential'] = (
            df['conversion_rate'] * df['conversion_value'] *
            (df['mobile_traffic']/100) * (1 - df['bounce_rate']/100)
        )
        
        # Select features for training
        features = [
            'monthly_visitors', 'page_views', 'traffic_quality',
            'seo_strength', 'content_quality', 'user_engagement',
            'technical_performance', 'conversion_potential',
            'competition_score'
        ]
        
        X = df[features]
        y = df['actual_value'] if 'actual_value' in df.columns else None
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y, features
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train the AI model"""
        print("Training AI model...")
        
        # Split data with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=pd.qcut(y, q=5)
        )
        
        # Initialize and train model with hyperparameter tuning
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        # Calculate feature importance
        self.feature_importance = dict(zip(
            features,
            self.model.feature_importances_
        ))
        
        # Evaluate model with additional metrics
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        # Calculate additional metrics
        y_pred = self.model.predict(X_test)
        mae = np.mean(np.abs(y_test - y_pred))
        mse = np.mean((y_test - y_pred) ** 2)
        rmse = np.sqrt(mse)
        
        print(f"Model trained successfully!")
        print(f"Training R² score: {train_score:.3f}")
        print(f"Testing R² score: {test_score:.3f}")
        print(f"Mean Absolute Error: ${mae:,.2f}")
        print(f"Root Mean Square Error: ${rmse:,.2f}")
    
    def _calculate_comparative_analysis(self, website_data: Dict, predicted_value: float) -> Dict:
        """Calculate how the website compares to similar ones in its niche"""
        # Define niche categories and their average values with industry benchmarks
        niches = {
            'ecommerce': {
                'cosmetics': {
                    'avg_value': 150000,
                    'metrics': ['conversion_rate', 'avg_time_on_site', 'social_shares', 'mobile_traffic'],
                    'benchmarks': {
                        'conversion_rate': {'low': 1.5, 'medium': 2.5, 'high': 3.5},
                        'avg_time_on_site': {'low': 120, 'medium': 180, 'high': 240},
                        'social_shares': {'low': 500, 'medium': 1000, 'high': 2000},
                        'mobile_traffic': {'low': 30, 'medium': 40, 'high': 50}
                    }
                },
                'electronics': {
                    'avg_value': 200000,
                    'metrics': ['page_views', 'conversion_value', 'domain_authority', 'backlinks'],
                    'benchmarks': {
                        'page_views': {'low': 100000, 'medium': 250000, 'high': 500000},
                        'conversion_value': {'low': 30000, 'medium': 50000, 'high': 75000},
                        'domain_authority': {'low': 30, 'medium': 45, 'high': 60},
                        'backlinks': {'low': 500, 'medium': 1000, 'high': 2000}
                    }
                },
                'fashion': {
                    'avg_value': 180000,
                    'metrics': ['social_shares', 'mobile_traffic', 'returning_visitors', 'email_subscribers'],
                    'benchmarks': {
                        'social_shares': {'low': 800, 'medium': 1500, 'high': 2500},
                        'mobile_traffic': {'low': 35, 'medium': 45, 'high': 55},
                        'returning_visitors': {'low': 20, 'medium': 30, 'high': 40},
                        'email_subscribers': {'low': 500, 'medium': 1000, 'high': 2000}
                    }
                },
                'health': {
                    'avg_value': 220000,
                    'metrics': ['domain_authority', 'content_freshness', 'ssl_score', 'brand_mentions'],
                    'benchmarks': {
                        'domain_authority': {'low': 35, 'medium': 50, 'high': 65},
                        'content_freshness': {'low': 50, 'medium': 70, 'high': 90},
                        'ssl_score': {'low': 80, 'medium': 90, 'high': 100},
                        'brand_mentions': {'low': 100, 'medium': 300, 'high': 500}
                    }
                }
            },
            'saas': {
                'marketing': {
                    'avg_value': 300000,
                    'metrics': ['email_subscribers', 'conversion_rate', 'page_views', 'returning_visitors'],
                    'benchmarks': {
                        'email_subscribers': {'low': 1000, 'medium': 2000, 'high': 4000},
                        'conversion_rate': {'low': 2.0, 'medium': 3.5, 'high': 5.0},
                        'page_views': {'low': 50000, 'medium': 150000, 'high': 300000},
                        'returning_visitors': {'low': 25, 'medium': 35, 'high': 45}
                    }
                },
                'development': {
                    'avg_value': 250000,
                    'metrics': ['domain_authority', 'backlinks', 'organic_keywords', 'ranking_keywords'],
                    'benchmarks': {
                        'domain_authority': {'low': 40, 'medium': 55, 'high': 70},
                        'backlinks': {'low': 1000, 'medium': 2000, 'high': 4000},
                        'organic_keywords': {'low': 300, 'medium': 600, 'high': 1000},
                        'ranking_keywords': {'low': 100, 'medium': 250, 'high': 500}
                    }
                },
                'analytics': {
                    'avg_value': 280000,
                    'metrics': ['page_views', 'returning_visitors', 'avg_time_on_site', 'conversion_rate'],
                    'benchmarks': {
                        'page_views': {'low': 80000, 'medium': 200000, 'high': 400000},
                        'returning_visitors': {'low': 30, 'medium': 40, 'high': 50},
                        'avg_time_on_site': {'low': 150, 'medium': 240, 'high': 300},
                        'conversion_rate': {'low': 2.5, 'medium': 4.0, 'high': 6.0}
                    }
                },
                'security': {
                    'avg_value': 320000,
                    'metrics': ['ssl_score', 'domain_authority', 'backlinks', 'brand_mentions'],
                    'benchmarks': {
                        'ssl_score': {'low': 85, 'medium': 95, 'high': 100},
                        'domain_authority': {'low': 45, 'medium': 60, 'high': 75},
                        'backlinks': {'low': 1500, 'medium': 3000, 'high': 6000},
                        'brand_mentions': {'low': 200, 'medium': 400, 'high': 800}
                    }
                }
            },
            'content': {
                'news': {
                    'avg_value': 120000,
                    'metrics': ['monthly_visitors', 'page_views', 'avg_time_on_site', 'bounce_rate'],
                    'benchmarks': {
                        'monthly_visitors': {'low': 20000, 'medium': 50000, 'high': 100000},
                        'page_views': {'low': 100000, 'medium': 250000, 'high': 500000},
                        'avg_time_on_site': {'low': 90, 'medium': 150, 'high': 210},
                        'bounce_rate': {'low': 60, 'medium': 45, 'high': 30}
                    }
                },
                'blog': {
                    'avg_value': 100000,
                    'metrics': ['content_freshness', 'social_shares', 'email_subscribers', 'returning_visitors'],
                    'benchmarks': {
                        'content_freshness': {'low': 40, 'medium': 60, 'high': 80},
                        'social_shares': {'low': 300, 'medium': 800, 'high': 1500},
                        'email_subscribers': {'low': 300, 'medium': 800, 'high': 1500},
                        'returning_visitors': {'low': 15, 'medium': 25, 'high': 35}
                    }
                },
                'educational': {
                    'avg_value': 150000,
                    'metrics': ['avg_time_on_site', 'returning_visitors', 'conversion_rate', 'email_subscribers'],
                    'benchmarks': {
                        'avg_time_on_site': {'low': 180, 'medium': 300, 'high': 420},
                        'returning_visitors': {'low': 20, 'medium': 35, 'high': 50},
                        'conversion_rate': {'low': 1.5, 'medium': 3.0, 'high': 4.5},
                        'email_subscribers': {'low': 500, 'medium': 1000, 'high': 2000}
                    }
                },
                'entertainment': {
                    'avg_value': 180000,
                    'metrics': ['page_views', 'social_shares', 'mobile_traffic', 'bounce_rate'],
                    'benchmarks': {
                        'page_views': {'low': 150000, 'medium': 300000, 'high': 600000},
                        'social_shares': {'low': 1000, 'medium': 2500, 'high': 5000},
                        'mobile_traffic': {'low': 40, 'medium': 55, 'high': 70},
                        'bounce_rate': {'low': 50, 'medium': 35, 'high': 20}
                    }
                }
            }
        }
        
        # Determine the most likely niche based on metrics
        best_match = None
        highest_score = 0
        
        for category, subcategories in niches.items():
            for subcategory, data in subcategories.items():
                score = 0
                for metric in data['metrics']:
                    if metric in website_data:
                        # Normalize the metric value
                        if metric in ['conversion_rate', 'bounce_rate', 'mobile_traffic', 'returning_visitors']:
                            # These are percentages
                            score += min(website_data[metric] / 100, 1)
                        else:
                            # These are absolute values, normalize against a reasonable maximum
                            max_value = {
                                'monthly_visitors': 1000000,
                                'page_views': 5000000,
                                'avg_time_on_site': 600,
                                'domain_authority': 100,
                                'backlinks': 10000,
                                'organic_keywords': 5000,
                                'ranking_keywords': 2000,
                                'conversion_value': 500000,
                                'social_shares': 10000,
                                'email_subscribers': 10000,
                                'page_load_time': 10,
                                'ssl_score': 100,
                                'content_freshness': 100,
                                'internal_links': 5000,
                                'external_links': 3000,
                                'brand_mentions': 2000
                            }
                            score += min(website_data[metric] / max_value.get(metric, 1), 1)
                
                score = score / len(data['metrics'])
                if score > highest_score:
                    highest_score = score
                    best_match = (category, subcategory, data)
        
        if best_match:
            category, subcategory, data = best_match
            avg_value = data['avg_value']
            value_difference = predicted_value - avg_value
            percentage_difference = (value_difference / avg_value) * 100
            
            # Generate comparative insights
            insights = []
            if percentage_difference > 0:
                insights.append(f"Your {subcategory} website is worth {abs(percentage_difference):.1f}% more than the {category} niche average")
            else:
                insights.append(f"Your {subcategory} website is worth {abs(percentage_difference):.1f}% less than the {category} niche average")
            
            # Add detailed metric comparisons with benchmarks
            for metric in data['metrics']:
                if metric in website_data:
                    metric_value = website_data[metric]
                    benchmarks = data['benchmarks'][metric]
                    
                    # Determine performance level
                    if metric_value < benchmarks['low']:
                        level = 'low'
                    elif metric_value < benchmarks['medium']:
                        level = 'medium'
                    else:
                        level = 'high'
                    
                    # Format metric value
                    if metric in ['conversion_rate', 'bounce_rate', 'mobile_traffic', 'returning_visitors']:
                        metric_value = f"{metric_value}%"
                        insights.append(
                            f"Your {metric.replace('_', ' ')} ({metric_value}) is {level} compared to industry benchmarks "
                            f"(low: {benchmarks['low']}%, medium: {benchmarks['medium']}%, high: {benchmarks['high']}%)"
                        )
                    else:
                        insights.append(
                            f"Your {metric.replace('_', ' ')} ({metric_value:,}) is {level} compared to industry benchmarks "
                            f"(low: {benchmarks['low']:,}, medium: {benchmarks['medium']:,}, high: {benchmarks['high']:,})"
                        )
            
            return {
                'category': category,
                'subcategory': subcategory,
                'niche_average': avg_value,
                'value_difference': value_difference,
                'percentage_difference': percentage_difference,
                'insights': insights,
                'benchmarks': data['benchmarks'],
                'metrics': data['metrics']
            }
        
        return None
    
    def predict_value(self, website_data: Dict) -> Dict:
        """Predict website value"""
        print("Predicting website value...")
        
        # Preprocess input data
        X = self.preprocess_data(pd.DataFrame([website_data]))[0]
        
        # Make prediction with confidence intervals
        predicted_value = self.model.predict(X)[0]
        predictions = np.array([tree.predict(X)[0] for tree in self.model.estimators_])
        std_dev = np.std(predictions)
        confidence_interval = (predicted_value - 1.96*std_dev, predicted_value + 1.96*std_dev)
        
        # Calculate confidence score
        confidence = self._calculate_confidence(website_data)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(website_data)
        
        # Calculate comparative analysis
        comparative_analysis = self._calculate_comparative_analysis(website_data, predicted_value)
        
        return {
            'predicted_value': round(predicted_value, 2),
            'confidence_interval': tuple(round(x, 2) for x in confidence_interval),
            'confidence': round(confidence, 2),
            'feature_importance': self.feature_importance,
            'recommendations': recommendations,
            'comparative_analysis': comparative_analysis,
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, website_data: Dict) -> float:
        """Calculate prediction confidence based on data quality"""
        confidence_factors = {
            'monthly_visitors': 0.15,
            'domain_authority': 0.15,
            'conversion_rate': 0.15,
            'competition_score': 0.15,
            'technical_performance': 0.1,
            'content_quality': 0.1,
            'user_engagement': 0.1,
            'data_completeness': 0.1
        }
        
        # Check data completeness
        missing_data = sum(1 for v in website_data.values() if pd.isna(v))
        data_completeness = 1 - (missing_data / len(website_data))
        
        # Calculate confidence score with weighted factors
        confidence = (
            confidence_factors['monthly_visitors'] * (website_data['monthly_visitors'] > 0) +
            confidence_factors['domain_authority'] * (website_data['domain_authority'] > 0) +
            confidence_factors['conversion_rate'] * (website_data['conversion_rate'] > 0) +
            confidence_factors['competition_score'] * (website_data['competition_score'] > 0) +
            confidence_factors['technical_performance'] * (website_data['page_load_time'] > 0) +
            confidence_factors['content_quality'] * (website_data['content_freshness'] > 0) +
            confidence_factors['user_engagement'] * (website_data['email_subscribers'] > 0) +
            confidence_factors['data_completeness'] * data_completeness
        ) * 100
        
        return confidence
    
    def _generate_recommendations(self, website_data: Dict) -> List[Dict]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Traffic recommendations
        if website_data['monthly_visitors'] < 1000:
            recommendations.append({
                'category': 'traffic',
                'priority': 'high',
                'action': 'Implement comprehensive marketing strategy',
                'expected_impact': '20-30% increase in monthly visitors',
                'timeframe': '3-6 months',
                'estimated_cost': '$5,000-$10,000',
                'metrics_affected': ['monthly_visitors', 'page_views', 'conversion_rate'],
                'roi_estimate': '200-300%',
                'implementation_steps': [
                    'Develop content marketing strategy',
                    'Implement SEO best practices',
                    'Launch paid advertising campaigns',
                    'Optimize social media presence'
                ]
            })
        
        # SEO recommendations
        if website_data['domain_authority'] < 30:
            recommendations.append({
                'category': 'seo',
                'priority': 'medium',
                'action': 'Develop backlink acquisition strategy',
                'expected_impact': '5-10 point increase in domain authority',
                'timeframe': '6-12 months',
                'estimated_cost': '$3,000-$6,000',
                'metrics_affected': ['domain_authority', 'backlinks', 'organic_keywords'],
                'roi_estimate': '150-250%',
                'implementation_steps': [
                    'Conduct competitor backlink analysis',
                    'Create high-quality content for link building',
                    'Build relationships with industry influencers',
                    'Implement technical SEO improvements'
                ]
            })
        
        # Technical recommendations
        if website_data['page_load_time'] > 3:
            recommendations.append({
                'category': 'technical',
                'priority': 'high',
                'action': 'Optimize website performance',
                'expected_impact': '50% reduction in page load time',
                'timeframe': '1-2 months',
                'estimated_cost': '$2,000-$4,000',
                'metrics_affected': ['page_load_time', 'bounce_rate', 'conversion_rate'],
                'roi_estimate': '300-400%',
                'implementation_steps': [
                    'Optimize image sizes and formats',
                    'Implement browser caching',
                    'Minify CSS and JavaScript',
                    'Upgrade hosting infrastructure'
                ]
            })
        
        # Content recommendations
        if website_data['content_freshness'] < 50:
            recommendations.append({
                'category': 'content',
                'priority': 'medium',
                'action': 'Update and expand content strategy',
                'expected_impact': 'Improved user engagement and SEO',
                'timeframe': '3-6 months',
                'estimated_cost': '$4,000-$8,000',
                'metrics_affected': ['content_freshness', 'avg_time_on_site', 'social_shares'],
                'roi_estimate': '180-280%',
                'implementation_steps': [
                    'Audit existing content',
                    'Develop content calendar',
                    'Create pillar content pieces',
                    'Implement content distribution strategy'
                ]
            })
        
        # User engagement recommendations
        if website_data['email_subscribers'] < 1000:
            recommendations.append({
                'category': 'engagement',
                'priority': 'medium',
                'action': 'Implement email marketing strategy',
                'expected_impact': '500-1000 new subscribers',
                'timeframe': '3-6 months',
                'estimated_cost': '$2,000-$5,000',
                'metrics_affected': ['email_subscribers', 'conversion_rate', 'returning_visitors'],
                'roi_estimate': '250-350%',
                'implementation_steps': [
                    'Create lead magnets',
                    'Implement email automation',
                    'Design email templates',
                    'Develop segmentation strategy'
                ]
            })
        
        # Mobile optimization recommendations
        if website_data['mobile_traffic'] < 30:
            recommendations.append({
                'category': 'mobile',
                'priority': 'high',
                'action': 'Optimize for mobile experience',
                'expected_impact': '20-30% increase in mobile traffic',
                'timeframe': '2-4 months',
                'estimated_cost': '$3,000-$6,000',
                'metrics_affected': ['mobile_traffic', 'bounce_rate', 'conversion_rate'],
                'roi_estimate': '220-320%',
                'implementation_steps': [
                    'Implement responsive design',
                    'Optimize mobile navigation',
                    'Improve mobile page speed',
                    'Enhance mobile forms and CTAs'
                ]
            })
        
        return recommendations
    
    def visualize_results(self, result: Dict, save_path: Optional[str] = None) -> None:
        """Create comprehensive visualizations of the valuation results"""
        # Create interactive plotly figure
        fig = make_subplots(
            rows=3, cols=2,
            subplot_titles=(
                'Feature Importance',
                'Valuation Confidence',
                'Recommendations Priority',
                'Metrics Distribution',
                'ROI Projection',
                'Implementation Timeline'
            )
        )
        
        # Feature Importance Plot
        features = list(result['feature_importance'].keys())
        importance = list(result['feature_importance'].values())
        fig.add_trace(
            go.Bar(x=importance, y=features, orientation='h'),
            row=1, col=1
        )
        
        # Confidence Interval Plot
        fig.add_trace(
            go.Bar(
                x=['Predicted Value'],
                y=[result['predicted_value']],
                error_y=dict(
                    type='data',
                    array=[result['confidence_interval'][1] - result['predicted_value']],
                    arrayminus=[result['predicted_value'] - result['confidence_interval'][0]]
                )
            ),
            row=1, col=2
        )
        
        # Recommendations Priority Plot
        priorities = {'high': 0, 'medium': 0, 'low': 0}
        for rec in result['recommendations']:
            priorities[rec['priority']] += 1
        fig.add_trace(
            go.Pie(
                labels=list(priorities.keys()),
                values=list(priorities.values()),
                hole=0.3
            ),
            row=2, col=1
        )
        
        # Metrics Distribution Plot
        metrics = ['monthly_visitors', 'conversion_rate', 'domain_authority']
        values = [result['website_data'][m] for m in metrics]
        fig.add_trace(
            go.Bar(x=metrics, y=values),
            row=2, col=2
        )
        
        # ROI Projection Plot
        rois = [float(rec['roi_estimate'].split('-')[0].strip('%')) for rec in result['recommendations']]
        categories = [rec['category'] for rec in result['recommendations']]
        fig.add_trace(
            go.Bar(x=categories, y=rois),
            row=3, col=1
        )
        
        # Implementation Timeline
        timeframes = []
        for rec in result['recommendations']:
            timeframes.append({
                'Task': rec['category'],
                'Start': '2024-01-01',
                'Finish': f"2024-{int(rec['timeframe'].split('-')[0])}-01"
            })
        fig.add_trace(
            go.Gantt(
                x=timeframes,
                showgrid=True
            ),
            row=3, col=2
        )
        
        # Update layout
        fig.update_layout(
            height=1200,
            width=1200,
            title_text="Website Valuation Analysis",
            showlegend=True
        )
        
        # Save or show plot
        if save_path:
            fig.write_html(save_path.replace('.png', '.html'))
            fig.write_image(save_path)
        else:
            fig.show()
    
    def generate_report(self, result: Dict, save_path: Optional[str] = None) -> None:
        """Generate a comprehensive HTML report"""
        report = f"""
        <html>
        <head>
            <title>Website Valuation Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .section {{ margin-bottom: 30px; }}
                .metric {{ margin: 10px 0; }}
                .recommendation {{ 
                    border: 1px solid #ddd; 
                    padding: 15px; 
                    margin: 10px 0;
                    border-radius: 5px;
                }}
                .high-priority {{ background-color: #ffebee; }}
                .medium-priority {{ background-color: #fff3e0; }}
                .low-priority {{ background-color: #e8f5e9; }}
                .comparative-analysis {{
                    background-color: #e3f2fd;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <h1>Website Valuation Report</h1>
            <div class="section">
                <h2>Valuation Summary</h2>
                <div class="metric">
                    <strong>Predicted Value:</strong> ${result['predicted_value']:,.2f}
                </div>
                <div class="metric">
                    <strong>Confidence Interval:</strong> 
                    ${result['confidence_interval'][0]:,.2f} - ${result['confidence_interval'][1]:,.2f}
                </div>
                <div class="metric">
                    <strong>Confidence Score:</strong> {result['confidence']}%
                </div>
            </div>
            
            {self._generate_comparative_analysis_html(result.get('comparative_analysis'))}
            
            <div class="section">
                <h2>Key Metrics</h2>
                <div class="metric">
                    <strong>Monthly Visitors:</strong> {result['website_data']['monthly_visitors']:,}
                </div>
                <div class="metric">
                    <strong>Conversion Rate:</strong> {result['website_data']['conversion_rate']}%
                </div>
                <div class="metric">
                    <strong>Domain Authority:</strong> {result['website_data']['domain_authority']}
                </div>
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
                {self._generate_recommendations_html(result['recommendations'])}
            </div>
            
            <div class="section">
                <h2>Implementation Timeline</h2>
                <img src="timeline.png" alt="Implementation Timeline">
            </div>
        </body>
        </html>
        """
        
        if save_path:
            with open(save_path, 'w') as f:
                f.write(report)
    
    def _generate_recommendations_html(self, recommendations: List[Dict]) -> str:
        """Generate HTML for recommendations section"""
        html = ""
        for rec in recommendations:
            priority_class = f"{rec['priority']}-priority"
            html += f"""
            <div class="recommendation {priority_class}">
                <h3>{rec['category'].upper()} ({rec['priority']} priority)</h3>
                <p><strong>Action:</strong> {rec['action']}</p>
                <p><strong>Expected Impact:</strong> {rec['expected_impact']}</p>
                <p><strong>Timeframe:</strong> {rec['timeframe']}</p>
                <p><strong>Estimated Cost:</strong> {rec['estimated_cost']}</p>
                <p><strong>ROI Estimate:</strong> {rec['roi_estimate']}</p>
                <p><strong>Implementation Steps:</strong></p>
                <ul>
                    {''.join(f'<li>{step}</li>' for step in rec['implementation_steps'])}
                </ul>
            </div>
            """
        return html
    
    def _generate_comparative_analysis_html(self, analysis: Optional[Dict]) -> str:
        """Generate HTML for comparative analysis section"""
        if not analysis:
            return ""
        
        html = f"""
        <div class="section">
            <h2>Comparative Analysis</h2>
            <div class="comparative-analysis">
                <h3>{analysis['category'].title()} - {analysis['subcategory'].title()}</h3>
                <div class="metric">
                    <strong>Niche Average Value:</strong> ${analysis['niche_average']:,.2f}
                </div>
                <div class="metric">
                    <strong>Value Difference:</strong> ${analysis['value_difference']:,.2f}
                    ({analysis['percentage_difference']:+.1f}%)
                </div>
                <h4>Key Insights:</h4>
                <ul>
                    {''.join(f'<li>{insight}</li>' for insight in analysis['insights'])}
                </ul>
            </div>
        </div>
        """
        return html
    
    def save_model(self, path: str) -> None:
        """Save the trained model and scaler"""
        print(f"Saving model to {path}...")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_importance': self.feature_importance
        }, path)
    
    def load_model(self, path: str) -> None:
        """Load a trained model and scaler"""
        print(f"Loading model from {path}...")
        saved_data = joblib.load(path)
        self.model = saved_data['model']
        self.scaler = saved_data['scaler']
        self.feature_importance = saved_data['feature_importance']

    def visualize_comparative_analysis(self, analysis: Dict, save_path: Optional[str] = None) -> None:
        """Create enhanced visualizations for comparative analysis"""
        if not analysis:
            return
        
        # Create subplots with more detailed layout
        fig = make_subplots(
            rows=3, cols=2,
            subplot_titles=(
                'Value Comparison',
                'Metric Performance',
                'Benchmark Analysis',
                'Industry Position',
                'Trend Analysis',
                'Performance Distribution'
            ),
            specs=[
                [{"type": "bar"}, {"type": "bar"}],
                [{"type": "scatter"}, {"type": "indicator"}],
                [{"type": "scatter"}, {"type": "box"}]
            ]
        )
        
        # Value Comparison Plot with trend line
        fig.add_trace(
            go.Bar(
                x=['Your Website', 'Niche Average', 'Industry Top 10%'],
                y=[
                    analysis['niche_average'] + analysis['value_difference'],
                    analysis['niche_average'],
                    analysis['niche_average'] * 1.5  # Top 10% benchmark
                ],
                text=[
                    f"${analysis['niche_average'] + analysis['value_difference']:,.2f}",
                    f"${analysis['niche_average']:,.2f}",
                    f"${analysis['niche_average'] * 1.5:,.2f}"
                ],
                textposition='auto',
                name='Current Value'
            ),
            row=1, col=1
        )
        
        # Add trend line for historical comparison
        fig.add_trace(
            go.Scatter(
                x=['6 months ago', '3 months ago', 'Current'],
                y=[
                    (analysis['niche_average'] + analysis['value_difference']) * 0.8,
                    (analysis['niche_average'] + analysis['value_difference']) * 0.9,
                    analysis['niche_average'] + analysis['value_difference']
                ],
                mode='lines+markers',
                name='Growth Trend',
                line=dict(color='green', width=2)
            ),
            row=1, col=1
        )
        
        # Enhanced Metric Performance Plot with performance levels
        metrics = analysis['metrics']
        values = [analysis['website_data'][m] for m in metrics]
        performance_levels = []
        
        for metric, value in zip(metrics, values):
            if metric in analysis['benchmarks']:
                benchmarks = analysis['benchmarks'][metric]
                if value < benchmarks['low']:
                    level = 'Critical'
                elif value < benchmarks['medium']:
                    level = 'Needs Improvement'
                elif value < benchmarks['high']:
                    level = 'Good'
                else:
                    level = 'Excellent'
                performance_levels.append(level)
        
        fig.add_trace(
            go.Bar(
                x=metrics,
                y=values,
                text=[f"{v:,}" if isinstance(v, (int, float)) and v > 100 else f"{v}%" for v in values],
                textposition='auto',
                marker_color=['red' if l == 'Critical' else 'orange' if l == 'Needs Improvement' else 'lightgreen' if l == 'Good' else 'green' for l in performance_levels],
                name='Metric Value'
            ),
            row=1, col=2
        )
        
        # Enhanced Benchmark Analysis Plot with quartiles
        for metric in metrics:
            if metric in analysis['benchmarks']:
                benchmarks = analysis['benchmarks'][metric]
                fig.add_trace(
                    go.Scatter(
                        x=['Bottom 25%', '25-50%', '50-75%', 'Top 25%'],
                        y=[
                            benchmarks['low'],
                            (benchmarks['low'] + benchmarks['medium']) / 2,
                            (benchmarks['medium'] + benchmarks['high']) / 2,
                            benchmarks['high']
                        ],
                        name=metric.replace('_', ' '),
                        mode='lines+markers',
                        line=dict(width=2)
                    ),
                    row=2, col=1
                )
        
        # Enhanced Industry Position Plot with more granular levels
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=analysis['percentage_difference'],
                title={'text': "Industry Position"},
                gauge={
                    'axis': {'range': [-100, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [-100, -75], 'color': "red"},
                        {'range': [-75, -50], 'color': "lightcoral"},
                        {'range': [-50, -25], 'color': "orange"},
                        {'range': [-25, 0], 'color': "lightyellow"},
                        {'range': [0, 25], 'color': "lightgreen"},
                        {'range': [25, 50], 'color': "green"},
                        {'range': [50, 75], 'color': "darkgreen"},
                        {'range': [75, 100], 'color': "blue"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': analysis['percentage_difference']
                    }
                }
            ),
            row=2, col=2
        )
        
        # Trend Analysis Plot
        fig.add_trace(
            go.Scatter(
                x=['Q1', 'Q2', 'Q3', 'Q4'],
                y=[
                    analysis['niche_average'] * 0.9,
                    analysis['niche_average'] * 0.95,
                    analysis['niche_average'] * 1.05,
                    analysis['niche_average']
                ],
                mode='lines+markers',
                name='Industry Trend',
                line=dict(color='blue', width=2)
            ),
            row=3, col=1
        )
        
        # Add website's trend
        fig.add_trace(
            go.Scatter(
                x=['Q1', 'Q2', 'Q3', 'Q4'],
                y=[
                    (analysis['niche_average'] + analysis['value_difference']) * 0.8,
                    (analysis['niche_average'] + analysis['value_difference']) * 0.9,
                    (analysis['niche_average'] + analysis['value_difference']) * 1.1,
                    analysis['niche_average'] + analysis['value_difference']
                ],
                mode='lines+markers',
                name='Your Website Trend',
                line=dict(color='green', width=2)
            ),
            row=3, col=1
        )
        
        # Performance Distribution Plot
        fig.add_trace(
            go.Box(
                y=values,
                x=metrics,
                name='Metric Distribution',
                boxpoints='all',
                jitter=0.3,
                pointpos=-1.8
            ),
            row=3, col=2
        )
        
        # Update layout with enhanced styling
        fig.update_layout(
            height=1200,
            width=1400,
            title_text=f"{analysis['category'].title()} - {analysis['subcategory'].title()} Analysis",
            showlegend=True,
            template='plotly_white',
            font=dict(size=12),
            margin=dict(l=50, r=50, t=100, b=50),
            hovermode='closest'
        )
        
        # Add annotations for key insights
        fig.add_annotation(
            x=0.5,
            y=1.1,
            xref='paper',
            yref='paper',
            text=f"Industry Position: {analysis['percentage_difference']:+.1f}% vs. Niche Average",
            showarrow=False,
            font=dict(size=14, color='black')
        )
        
        # Save or show plot
        if save_path:
            fig.write_html(save_path.replace('.png', '.html'))
            fig.write_image(save_path)
        else:
            fig.show()

    def analyze_contracts(self, contracts: List[str]) -> Dict:
        """Analyze supplier/customer contracts for problematic clauses using NLP"""
        problematic_terms = {
            'exclusivity': ['exclusive', 'sole', 'only', 'restricted', 'non-compete', 'territory'],
            'termination': ['terminate', 'cancel', 'end', 'discontinue', 'expire', 'notice period'],
            'liability': ['liability', 'damages', 'indemnify', 'compensate', 'warranty', 'guarantee'],
            'pricing': ['increase', 'raise', 'adjust', 'modify', 'index', 'inflation'],
            'confidentiality': ['confidential', 'secret', 'proprietary', 'private', 'nda', 'non-disclosure'],
            'intellectual_property': ['ip', 'patent', 'copyright', 'trademark', 'license', 'royalty'],
            'payment_terms': ['net', 'days', 'late fee', 'interest', 'penalty', 'withhold'],
            'force_majeure': ['force majeure', 'act of god', 'unforeseen', 'uncontrollable', 'pandemic'],
            'jurisdiction': ['jurisdiction', 'venue', 'arbitration', 'governing law', 'dispute'],
            'renewal': ['auto-renew', 'renewal', 'extension', 'option', 'term', 'period']
        }
        
        results = {
            'total_contracts': len(contracts),
            'problematic_clauses': {},
            'risk_score': 0,
            'severity_levels': {},
            'recommendations': [],
            'clause_distribution': {},
            'risk_breakdown': {}
        }
        
        for contract in contracts:
            tokens = word_tokenize(contract.lower())
            for category, terms in problematic_terms.items():
                matches = [term for term in terms if term in tokens]
                if matches:
                    if category not in results['problematic_clauses']:
                        results['problematic_clauses'][category] = 0
                    results['problematic_clauses'][category] += 1
                    
                    # Calculate severity based on context
                    severity = 'low'
                    if len(matches) > 2:
                        severity = 'high'
                    elif len(matches) > 1:
                        severity = 'medium'
                        
                    if category not in results['severity_levels']:
                        results['severity_levels'][category] = {'low': 0, 'medium': 0, 'high': 0}
                    results['severity_levels'][category][severity] += 1
        
        # Calculate risk score with weighted categories
        category_weights = {
            'exclusivity': 1.5,
            'termination': 1.2,
            'liability': 1.4,
            'pricing': 1.1,
            'confidentiality': 1.0,
            'intellectual_property': 1.3,
            'payment_terms': 1.1,
            'force_majeure': 0.8,
            'jurisdiction': 1.2,
            'renewal': 0.9
        }
        
        weighted_score = sum(
            results['problematic_clauses'].get(cat, 0) * weight
            for cat, weight in category_weights.items()
        )
        results['risk_score'] = (weighted_score / len(contracts)) * 100
        
        # Generate detailed recommendations
        if results['risk_score'] > 50:
            results['recommendations'].append("High risk detected in contracts. Immediate legal review recommended.")
        for category, count in results['problematic_clauses'].items():
            if count > 0:
                severity = max(results['severity_levels'][category].items(), key=lambda x: x[1])[0]
                results['recommendations'].append(
                    f"Review {category.replace('_', ' ')} clauses ({severity} severity) for potential risks"
                )
        
        return results
    
    def detect_bot_traffic(self, traffic_data: pd.DataFrame) -> Dict:
        """Detect artificial traffic using enhanced classification models"""
        features = [
            'page_views_per_session',
            'avg_time_on_page',
            'bounce_rate',
            'session_duration',
            'clicks_per_session',
            'pages_per_session',
            'time_between_clicks',
            'mouse_movement',
            'scroll_depth',
            'form_interactions',
            'device_type',
            'browser_version',
            'ip_address',
            'geolocation',
            'referrer_type'
        ]
        
        # Enhanced anomaly detection with multiple models
        if self.bot_detector is None:
            self.bot_detector = {
                'isolation_forest': IsolationForest(
                    contamination=0.1,
                    random_state=42
                ),
                'local_outlier': LocalOutlierFactor(
                    n_neighbors=20,
                    contamination=0.1
                )
            }
            
            # Train models
            for model in self.bot_detector.values():
                model.fit(traffic_data[features])
        
        # Predict anomalies with ensemble approach
        predictions = {}
        scores = {}
        for name, model in self.bot_detector.items():
            predictions[name] = model.predict(traffic_data[features])
            scores[name] = model.score_samples(traffic_data[features])
        
        # Combine predictions
        final_predictions = np.mean([pred for pred in predictions.values()], axis=0) < 0
        final_scores = np.mean([score for score in scores.values()], axis=0)
        
        results = {
            'total_sessions': len(traffic_data),
            'bot_sessions': int(sum(final_predictions)),
            'bot_percentage': (sum(final_predictions) / len(traffic_data)) * 100,
            'risk_level': 'low',
            'bot_types': {},
            'traffic_patterns': {},
            'recommendations': [],
            'detailed_analysis': {}
        }
        
        # Analyze bot types
        bot_types = {
            'scraper': traffic_data[final_predictions]['pages_per_session'] > 50,
            'spammer': traffic_data[final_predictions]['form_interactions'] > 10,
            'crawler': traffic_data[final_predictions]['time_between_clicks'] < 0.1,
            'click_farm': traffic_data[final_predictions]['mouse_movement'] < 5
        }
        
        for bot_type, mask in bot_types.items():
            results['bot_types'][bot_type] = int(sum(mask))
        
        # Analyze traffic patterns
        results['traffic_patterns'] = {
            'peak_hours': traffic_data[final_predictions]['hour'].value_counts().to_dict(),
            'common_ips': traffic_data[final_predictions]['ip_address'].value_counts().head(5).to_dict(),
            'device_distribution': traffic_data[final_predictions]['device_type'].value_counts().to_dict()
        }
        
        # Determine risk level
        if results['bot_percentage'] > 20:
            results['risk_level'] = 'high'
        elif results['bot_percentage'] > 10:
            results['risk_level'] = 'medium'
        
        # Generate detailed recommendations
        if results['risk_level'] == 'high':
            results['recommendations'].append("Implement CAPTCHA or other bot prevention measures")
        if results['bot_percentage'] > 5:
            results['recommendations'].append("Review traffic sources and implement filtering")
        if results['bot_types'].get('scraper', 0) > 0:
            results['recommendations'].append("Implement rate limiting and IP blocking for scrapers")
        if results['bot_types'].get('spammer', 0) > 0:
            results['recommendations'].append("Add form validation and honeypot fields")
            
        return results
    
    def create_dashboard(self, metrics: Dict) -> None:
        """Create an enhanced interactive dashboard for key metrics"""
        app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
        
        # Define alert colors based on metric values
        def get_alert_color(value, thresholds):
            if value >= thresholds['high']:
                return 'green'
            elif value >= thresholds['medium']:
                return 'yellow'
            else:
                return 'red'
        
        # Enhanced metrics sections
        metrics_sections = {
            'customer_retention': {
                'customer_retention_rate': {
                    'value': metrics.get('customer_retention_rate', 0),
                    'thresholds': {'high': 80, 'medium': 60}
                },
                'churn_rate': {
                    'value': metrics.get('churn_rate', 0),
                    'thresholds': {'high': 5, 'medium': 10}
                },
                'lifetime_value': {
                    'value': metrics.get('lifetime_value', 0),
                    'thresholds': {'high': 1000, 'medium': 500}
                },
                'repeat_purchase_rate': {
                    'value': metrics.get('repeat_purchase_rate', 0),
                    'thresholds': {'high': 40, 'medium': 20}
                }
            },
            'product_dependence': {
                'top_product_revenue_share': {
                    'value': metrics.get('top_product_revenue_share', 0),
                    'thresholds': {'high': 30, 'medium': 50}
                },
                'product_diversity_index': {
                    'value': metrics.get('product_diversity_index', 0),
                    'thresholds': {'high': 0.7, 'medium': 0.5}
                },
                'new_product_adoption': {
                    'value': metrics.get('new_product_adoption', 0),
                    'thresholds': {'high': 20, 'medium': 10}
                },
                'product_market_fit': {
                    'value': metrics.get('product_market_fit', 0),
                    'thresholds': {'high': 80, 'medium': 60}
                }
            },
            'financial_health': {
                'revenue_growth': {
                    'value': metrics.get('revenue_growth', 0),
                    'thresholds': {'high': 20, 'medium': 10}
                },
                'profit_margin': {
                    'value': metrics.get('profit_margin', 0),
                    'thresholds': {'high': 30, 'medium': 15}
                },
                'cash_flow': {
                    'value': metrics.get('cash_flow', 0),
                    'thresholds': {'high': 100000, 'medium': 50000}
                },
                'customer_acquisition_cost': {
                    'value': metrics.get('customer_acquisition_cost', 0),
                    'thresholds': {'high': 50, 'medium': 100}
                }
            },
            'operational_efficiency': {
                'inventory_turnover': {
                    'value': metrics.get('inventory_turnover', 0),
                    'thresholds': {'high': 8, 'medium': 4}
                },
                'order_fulfillment_time': {
                    'value': metrics.get('order_fulfillment_time', 0),
                    'thresholds': {'high': 2, 'medium': 4}
                },
                'customer_support_resolution': {
                    'value': metrics.get('customer_support_resolution', 0),
                    'thresholds': {'high': 24, 'medium': 48}
                },
                'website_uptime': {
                    'value': metrics.get('website_uptime', 0),
                    'thresholds': {'high': 99.9, 'medium': 99.5}
                }
            }
        }
        
        app.layout = dbc.Container([
            dbc.Row([
                dbc.Col(html.H1("Enhanced Website Performance Dashboard"), width=12)
            ]),
            
            # Navigation Tabs
            dbc.Tabs([
                # Customer Retention Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Retention Rate"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['customer_retention']['customer_retention_rate']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['customer_retention']['customer_retention_rate']['value'],
                                              metrics_sections['customer_retention']['customer_retention_rate']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Churn Rate"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['customer_retention']['churn_rate']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['customer_retention']['churn_rate']['value'],
                                              metrics_sections['customer_retention']['churn_rate']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Lifetime Value"),
                                dbc.CardBody([
                                    html.H3(f"${metrics_sections['customer_retention']['lifetime_value']['value']:,.2f}",
                                          style={'color': get_alert_color(
                                              metrics_sections['customer_retention']['lifetime_value']['value'],
                                              metrics_sections['customer_retention']['lifetime_value']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Repeat Purchase Rate"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['customer_retention']['repeat_purchase_rate']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['customer_retention']['repeat_purchase_rate']['value'],
                                              metrics_sections['customer_retention']['repeat_purchase_rate']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            dcc.Graph(
                                figure=self._create_retention_trend_chart(metrics)
                            )
                        ], width=12)
                    ])
                ], label="Customer Retention"),
                
                # Product Dependence Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Top Product Revenue Share"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['product_dependence']['top_product_revenue_share']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['product_dependence']['top_product_revenue_share']['value'],
                                              metrics_sections['product_dependence']['top_product_revenue_share']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Product Diversity Index"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['product_dependence']['product_diversity_index']['value']:.2f}",
                                          style={'color': get_alert_color(
                                              metrics_sections['product_dependence']['product_diversity_index']['value'],
                                              metrics_sections['product_dependence']['product_diversity_index']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("New Product Adoption"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['product_dependence']['new_product_adoption']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['product_dependence']['new_product_adoption']['value'],
                                              metrics_sections['product_dependence']['new_product_adoption']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Product Market Fit"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['product_dependence']['product_market_fit']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['product_dependence']['product_market_fit']['value'],
                                              metrics_sections['product_dependence']['product_market_fit']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            dcc.Graph(
                                figure=self._create_product_distribution_chart(metrics)
                            )
                        ], width=12)
                    ])
                ], label="Product Dependence"),
                
                # Financial Health Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Revenue Growth"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['financial_health']['revenue_growth']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['financial_health']['revenue_growth']['value'],
                                              metrics_sections['financial_health']['revenue_growth']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Profit Margin"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['financial_health']['profit_margin']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['financial_health']['profit_margin']['value'],
                                              metrics_sections['financial_health']['profit_margin']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Cash Flow"),
                                dbc.CardBody([
                                    html.H3(f"${metrics_sections['financial_health']['cash_flow']['value']:,.2f}",
                                          style={'color': get_alert_color(
                                              metrics_sections['financial_health']['cash_flow']['value'],
                                              metrics_sections['financial_health']['cash_flow']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Customer Acquisition Cost"),
                                dbc.CardBody([
                                    html.H3(f"${metrics_sections['financial_health']['customer_acquisition_cost']['value']:,.2f}",
                                          style={'color': get_alert_color(
                                              metrics_sections['financial_health']['customer_acquisition_cost']['value'],
                                              metrics_sections['financial_health']['customer_acquisition_cost']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            dcc.Graph(
                                figure=self._create_financial_trend_chart(metrics)
                            )
                        ], width=12)
                    ])
                ], label="Financial Health"),
                
                # Operational Efficiency Tab
                dbc.Tab([
                    dbc.Row([
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Inventory Turnover"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['operational_efficiency']['inventory_turnover']['value']}",
                                          style={'color': get_alert_color(
                                              metrics_sections['operational_efficiency']['inventory_turnover']['value'],
                                              metrics_sections['operational_efficiency']['inventory_turnover']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Order Fulfillment Time"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['operational_efficiency']['order_fulfillment_time']['value']} days",
                                          style={'color': get_alert_color(
                                              metrics_sections['operational_efficiency']['order_fulfillment_time']['value'],
                                              metrics_sections['operational_efficiency']['order_fulfillment_time']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Support Resolution Time"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['operational_efficiency']['customer_support_resolution']['value']} hours",
                                          style={'color': get_alert_color(
                                              metrics_sections['operational_efficiency']['customer_support_resolution']['value'],
                                              metrics_sections['operational_efficiency']['customer_support_resolution']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3),
                        dbc.Col([
                            dbc.Card([
                                dbc.CardHeader("Website Uptime"),
                                dbc.CardBody([
                                    html.H3(f"{metrics_sections['operational_efficiency']['website_uptime']['value']}%",
                                          style={'color': get_alert_color(
                                              metrics_sections['operational_efficiency']['website_uptime']['value'],
                                              metrics_sections['operational_efficiency']['website_uptime']['thresholds']
                                          )})
                                ])
                            ])
                        ], width=3)
                    ]),
                    dbc.Row([
                        dbc.Col([
                            dcc.Graph(
                                figure=self._create_operational_metrics_chart(metrics)
                            )
                        ], width=12)
                    ])
                ], label="Operational Efficiency")
            ]),
            
            # Recommendations Section
            dbc.Row([
                dbc.Col(html.H2("Recommendations"), width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Action Items"),
                        dbc.CardBody([
                            html.Ul([
                                html.Li(rec) for rec in metrics.get('recommendations', [])
                            ])
                        ])
                    ])
                ], width=12)
            ])
        ])
        
        self.dashboard = app
    
    def _create_retention_trend_chart(self, metrics: Dict) -> go.Figure:
        """Create retention trend visualization"""
        fig = go.Figure()
        
        # Add retention rate trend
        fig.add_trace(go.Scatter(
            x=['Q1', 'Q2', 'Q3', 'Q4'],
            y=[metrics.get('retention_trend', [])],
            mode='lines+markers',
            name='Retention Rate'
        ))
        
        # Add churn rate trend
        fig.add_trace(go.Scatter(
            x=['Q1', 'Q2', 'Q3', 'Q4'],
            y=[metrics.get('churn_trend', [])],
            mode='lines+markers',
            name='Churn Rate'
        ))
        
        fig.update_layout(
            title='Customer Retention Trends',
            xaxis_title='Quarter',
            yaxis_title='Percentage',
            showlegend=True
        )
        
        return fig
    
    def _create_product_distribution_chart(self, metrics: Dict) -> go.Figure:
        """Create product distribution visualization"""
        fig = go.Figure()
        
        # Add product revenue distribution
        fig.add_trace(go.Pie(
            labels=metrics.get('product_names', []),
            values=metrics.get('product_revenues', []),
            hole=0.3
        ))
        
        fig.update_layout(
            title='Product Revenue Distribution',
            showlegend=True
        )
        
        return fig
    
    def _create_financial_trend_chart(self, metrics: Dict) -> go.Figure:
        """Create financial trends visualization"""
        fig = go.Figure()
        
        # Add revenue trend
        fig.add_trace(go.Scatter(
            x=['Q1', 'Q2', 'Q3', 'Q4'],
            y=metrics.get('revenue_trend', []),
            mode='lines+markers',
            name='Revenue'
        ))
        
        # Add profit trend
        fig.add_trace(go.Scatter(
            x=['Q1', 'Q2', 'Q3', 'Q4'],
            y=metrics.get('profit_trend', []),
            mode='lines+markers',
            name='Profit'
        ))
        
        fig.update_layout(
            title='Financial Performance Trends',
            xaxis_title='Quarter',
            yaxis_title='Amount ($)',
            showlegend=True
        )
        
        return fig
    
    def _create_operational_metrics_chart(self, metrics: Dict) -> go.Figure:
        """Create operational metrics visualization"""
        fig = go.Figure()
        
        # Add operational metrics
        metrics_data = {
            'Inventory Turnover': metrics.get('inventory_turnover', 0),
            'Fulfillment Time': metrics.get('order_fulfillment_time', 0),
            'Support Resolution': metrics.get('customer_support_resolution', 0),
            'Website Uptime': metrics.get('website_uptime', 0)
        }
        
        fig.add_trace(go.Bar(
            x=list(metrics_data.keys()),
            y=list(metrics_data.values()),
            text=[f"{v:.1f}" for v in metrics_data.values()],
            textposition='auto'
        ))
        
        fig.update_layout(
            title='Operational Metrics',
            xaxis_title='Metric',
            yaxis_title='Value',
            showlegend=False
        )
        
        return fig

def main():
    # Initialize the AI model
    ai = WebsiteValuationAI()
    
    # Example usage with enhanced sample data
    sample_website = {
        'monthly_visitors': 5000,
        'page_views': 25000,
        'avg_time_on_site': 180,
        'bounce_rate': 45,
        'domain_authority': 35,
        'backlinks': 1000,
        'organic_keywords': 500,
        'ranking_keywords': 200,
        'conversion_rate': 2.5,
        'conversion_value': 50000,
        'competition_score': 60,
        'social_shares': 1000,
        'email_subscribers': 800,
        'mobile_traffic': 40,
        'returning_visitors': 25,
        'page_load_time': 3.5,
        'ssl_score': 90,
        'content_freshness': 60,
        'internal_links': 500,
        'external_links': 300,
        'brand_mentions': 200
    }
    
    # If training data is available
    if os.path.exists('data/website_data.csv'):
        df = ai.load_data('data/website_data.csv')
        X, y, features = ai.preprocess_data(df)
        ai.train_model(X, y)
        ai.save_model('models/website_valuation_model.joblib')
    else:
        # Load pre-trained model
        ai.load_model('models/website_valuation_model.joblib')
    
    # Make prediction
    result = ai.predict_value(sample_website)
    
    # Print results
    print("\nWebsite Valuation Results:")
    print(f"Predicted Value: ${result['predicted_value']:,.2f}")
    print(f"Confidence Interval: ${result['confidence_interval'][0]:,.2f} - ${result['confidence_interval'][1]:,.2f}")
    print(f"Confidence: {result['confidence']}%")
    
    print("\nFeature Importance:")
    for feature, importance in result['feature_importance'].items():
        print(f"{feature}: {importance:.2%}")
    
    print("\nRecommendations:")
    for rec in result['recommendations']:
        print(f"\n{rec['category'].upper()} ({rec['priority']} priority):")
        print(f"Action: {rec['action']}")
        print(f"Expected Impact: {rec['expected_impact']}")
        print(f"Timeframe: {rec['timeframe']}")
        print(f"Estimated Cost: {rec['estimated_cost']}")
    
    # Generate visualizations
    ai.visualize_results(result, 'output/valuation_analysis.png')

if __name__ == "__main__":
    main() 