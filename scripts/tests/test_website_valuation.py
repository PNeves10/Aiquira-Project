import unittest
import pandas as pd
import numpy as np
from website_valuation import WebsiteValuationAI
import os
import shutil
from datetime import datetime

class TestWebsiteValuationAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.ai = WebsiteValuationAI()
        cls.test_data_path = 'data/test_website_data.csv'
        cls.model_path = 'models/test_valuation_model.joblib'
        
        # Create test data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)
        os.makedirs('models', exist_ok=True)
        
        # Create test data
        cls.create_test_data()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_data_path):
            os.remove(cls.test_data_path)
        if os.path.exists(cls.model_path):
            os.remove(cls.model_path)
    
    @classmethod
    def create_test_data(cls):
        """Create test data file with edge cases"""
        data = {
            'monthly_visitors': [10000, 5000, 20000, 100, 1000000],
            'page_views': [50000, 25000, 100000, 500, 5000000],
            'avg_time_on_site': [180, 150, 200, 30, 600],
            'bounce_rate': [45, 50, 40, 90, 10],
            'domain_authority': [45, 35, 55, 10, 90],
            'backlinks': [1000, 800, 2000, 50, 10000],
            'organic_keywords': [500, 400, 800, 10, 5000],
            'ranking_keywords': [200, 150, 400, 5, 2000],
            'conversion_rate': [2.5, 2.0, 3.0, 0.1, 10.0],
            'conversion_value': [50000, 40000, 75000, 1000, 500000],
            'competition_score': [60, 70, 50, 90, 10],
            'social_shares': [1000, 800, 2000, 10, 10000],
            'email_subscribers': [800, 600, 1500, 10, 10000],
            'mobile_traffic': [40, 35, 45, 5, 95],
            'returning_visitors': [25, 20, 30, 5, 80],
            'page_load_time': [3.5, 4.0, 3.0, 8.0, 1.0],
            'ssl_score': [90, 85, 95, 50, 100],
            'content_freshness': [60, 50, 70, 10, 100],
            'internal_links': [500, 400, 800, 10, 5000],
            'external_links': [300, 250, 500, 5, 3000],
            'brand_mentions': [200, 150, 300, 5, 2000],
            'actual_value': [250000, 150000, 400000, 10000, 2000000]
        }
        df = pd.DataFrame(data)
        df.to_csv(cls.test_data_path, index=False)
    
    def test_load_data(self):
        """Test data loading functionality"""
        df = self.ai.load_data(self.test_data_path)
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 5)  # Including edge cases
        self.assertEqual(len(df.columns), 21)
    
    def test_preprocess_data(self):
        """Test data preprocessing"""
        df = self.ai.load_data(self.test_data_path)
        X, y, features = self.ai.preprocess_data(df)
        
        self.assertIsInstance(X, np.ndarray)
        self.assertIsInstance(y, np.ndarray)
        self.assertIsInstance(features, list)
        self.assertEqual(X.shape[0], 5)  # Including edge cases
        self.assertEqual(len(features), 9)
    
    def test_train_model(self):
        """Test model training"""
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        
        self.assertIsNotNone(self.ai.model)
        self.assertIsNotNone(self.ai.feature_importance)
        self.assertEqual(len(self.ai.feature_importance), 9)
    
    def test_predict_value(self):
        """Test value prediction"""
        # Train model first
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        
        # Test prediction with edge cases
        test_websites = [
            {
                'monthly_visitors': 100,  # Very low traffic
                'page_views': 500,
                'avg_time_on_site': 30,
                'bounce_rate': 90,
                'domain_authority': 10,
                'backlinks': 50,
                'organic_keywords': 10,
                'ranking_keywords': 5,
                'conversion_rate': 0.1,
                'conversion_value': 1000,
                'competition_score': 90,
                'social_shares': 10,
                'email_subscribers': 10,
                'mobile_traffic': 5,
                'returning_visitors': 5,
                'page_load_time': 8.0,
                'ssl_score': 50,
                'content_freshness': 10,
                'internal_links': 10,
                'external_links': 5,
                'brand_mentions': 5
            },
            {
                'monthly_visitors': 1000000,  # Very high traffic
                'page_views': 5000000,
                'avg_time_on_site': 600,
                'bounce_rate': 10,
                'domain_authority': 90,
                'backlinks': 10000,
                'organic_keywords': 5000,
                'ranking_keywords': 2000,
                'conversion_rate': 10.0,
                'conversion_value': 500000,
                'competition_score': 10,
                'social_shares': 10000,
                'email_subscribers': 10000,
                'mobile_traffic': 95,
                'returning_visitors': 80,
                'page_load_time': 1.0,
                'ssl_score': 100,
                'content_freshness': 100,
                'internal_links': 5000,
                'external_links': 3000,
                'brand_mentions': 2000
            }
        ]
        
        for website in test_websites:
            result = self.ai.predict_value(website)
            
            self.assertIn('predicted_value', result)
            self.assertIn('confidence_interval', result)
            self.assertIn('confidence', result)
            self.assertIn('feature_importance', result)
            self.assertIn('recommendations', result)
            
            self.assertIsInstance(result['predicted_value'], float)
            self.assertIsInstance(result['confidence_interval'], tuple)
            self.assertIsInstance(result['confidence'], float)
            self.assertIsInstance(result['feature_importance'], dict)
            self.assertIsInstance(result['recommendations'], list)
    
    def test_calculate_confidence(self):
        """Test confidence calculation with edge cases"""
        test_websites = [
            {
                'monthly_visitors': 0,  # Zero values
                'domain_authority': 0,
                'conversion_rate': 0,
                'competition_score': 0,
                'page_load_time': 0,
                'content_freshness': 0,
                'email_subscribers': 0
            },
            {
                'monthly_visitors': None,  # Missing values
                'domain_authority': None,
                'conversion_rate': None,
                'competition_score': None,
                'page_load_time': None,
                'content_freshness': None,
                'email_subscribers': None
            }
        ]
        
        for website in test_websites:
            confidence = self.ai._calculate_confidence(website)
            self.assertIsInstance(confidence, float)
            self.assertGreaterEqual(confidence, 0)
            self.assertLessEqual(confidence, 100)
    
    def test_generate_recommendations(self):
        """Test recommendation generation with edge cases"""
        test_websites = [
            {
                'monthly_visitors': 50,  # Very low metrics
                'domain_authority': 5,
                'page_load_time': 10,
                'content_freshness': 5,
                'email_subscribers': 5,
                'mobile_traffic': 5
            },
            {
                'monthly_visitors': 1000000,  # Very high metrics
                'domain_authority': 95,
                'page_load_time': 0.5,
                'content_freshness': 95,
                'email_subscribers': 10000,
                'mobile_traffic': 95
            }
        ]
        
        for website in test_websites:
            recommendations = self.ai._generate_recommendations(website)
            self.assertIsInstance(recommendations, list)
            
            for rec in recommendations:
                self.assertIn('category', rec)
                self.assertIn('priority', rec)
                self.assertIn('action', rec)
                self.assertIn('expected_impact', rec)
                self.assertIn('timeframe', rec)
                self.assertIn('estimated_cost', rec)
                self.assertIn('metrics_affected', rec)
                self.assertIn('roi_estimate', rec)
                self.assertIn('implementation_steps', rec)
    
    def test_save_load_model(self):
        """Test model saving and loading"""
        # Train and save model
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        self.ai.save_model(self.model_path)
        
        # Create new instance and load model
        new_ai = WebsiteValuationAI()
        new_ai.load_model(self.model_path)
        
        self.assertIsNotNone(new_ai.model)
        self.assertIsNotNone(new_ai.feature_importance)
        self.assertEqual(len(new_ai.feature_importance), 9)
    
    def test_visualize_results(self):
        """Test visualization functionality"""
        # Train model first
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        
        # Test prediction
        test_website = {
            'monthly_visitors': 8000,
            'page_views': 40000,
            'avg_time_on_site': 160,
            'bounce_rate': 48,
            'domain_authority': 40,
            'backlinks': 1200,
            'organic_keywords': 450,
            'ranking_keywords': 180,
            'conversion_rate': 2.2,
            'conversion_value': 45000,
            'competition_score': 65,
            'social_shares': 900,
            'email_subscribers': 700,
            'mobile_traffic': 38,
            'returning_visitors': 22,
            'page_load_time': 3.8,
            'ssl_score': 88,
            'content_freshness': 55,
            'internal_links': 450,
            'external_links': 280,
            'brand_mentions': 180
        }
        
        result = self.ai.predict_value(test_website)
        result['website_data'] = test_website
        
        # Test visualization
        output_path = 'output/test_visualization.png'
        os.makedirs('output', exist_ok=True)
        self.ai.visualize_results(result, output_path)
        
        self.assertTrue(os.path.exists(output_path))
        self.assertTrue(os.path.exists(output_path.replace('.png', '.html')))
        os.remove(output_path)
        os.remove(output_path.replace('.png', '.html'))
    
    def test_generate_report(self):
        """Test report generation"""
        # Train model first
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        
        # Test prediction
        test_website = {
            'monthly_visitors': 8000,
            'page_views': 40000,
            'avg_time_on_site': 160,
            'bounce_rate': 48,
            'domain_authority': 40,
            'backlinks': 1200,
            'organic_keywords': 450,
            'ranking_keywords': 180,
            'conversion_rate': 2.2,
            'conversion_value': 45000,
            'competition_score': 65,
            'social_shares': 900,
            'email_subscribers': 700,
            'mobile_traffic': 38,
            'returning_visitors': 22,
            'page_load_time': 3.8,
            'ssl_score': 88,
            'content_freshness': 55,
            'internal_links': 450,
            'external_links': 280,
            'brand_mentions': 180
        }
        
        result = self.ai.predict_value(test_website)
        result['website_data'] = test_website
        
        # Test report generation
        report_path = 'output/test_report.html'
        os.makedirs('output', exist_ok=True)
        self.ai.generate_report(result, report_path)
        
        self.assertTrue(os.path.exists(report_path))
        os.remove(report_path)

    def test_comparative_analysis(self):
        """Test comparative analysis functionality"""
        # Test with a cosmetics e-commerce website
        cosmetics_website = {
            'monthly_visitors': 50000,
            'page_views': 250000,
            'avg_time_on_site': 180,
            'bounce_rate': 45,
            'domain_authority': 45,
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
        
        # Train model first
        df = self.ai.load_data(self.test_data_path)
        X, y, _ = self.ai.preprocess_data(df)
        self.ai.train_model(X, y)
        
        # Get prediction and comparative analysis
        result = self.ai.predict_value(cosmetics_website)
        analysis = result['comparative_analysis']
        
        # Verify analysis structure
        self.assertIsNotNone(analysis)
        self.assertIn('category', analysis)
        self.assertIn('subcategory', analysis)
        self.assertIn('niche_average', analysis)
        self.assertIn('value_difference', analysis)
        self.assertIn('percentage_difference', analysis)
        self.assertIn('insights', analysis)
        
        # Verify insights format
        self.assertGreater(len(analysis['insights']), 0)
        self.assertTrue(any('%' in insight for insight in analysis['insights']))
        
        # Test with a SaaS marketing website
        saas_website = {
            'monthly_visitors': 30000,
            'page_views': 150000,
            'avg_time_on_site': 240,
            'bounce_rate': 35,
            'domain_authority': 55,
            'backlinks': 2000,
            'organic_keywords': 800,
            'ranking_keywords': 400,
            'conversion_rate': 3.5,
            'conversion_value': 75000,
            'competition_score': 50,
            'social_shares': 2000,
            'email_subscribers': 1500,
            'mobile_traffic': 45,
            'returning_visitors': 30,
            'page_load_time': 3.0,
            'ssl_score': 95,
            'content_freshness': 70,
            'internal_links': 800,
            'external_links': 500,
            'brand_mentions': 300
        }
        
        result = self.ai.predict_value(saas_website)
        analysis = result['comparative_analysis']
        
        # Verify SaaS-specific analysis
        self.assertIsNotNone(analysis)
        self.assertEqual(analysis['category'], 'saas')
        self.assertEqual(analysis['subcategory'], 'marketing')
        
        # Test with edge case (very low metrics)
        low_metrics_website = {
            'monthly_visitors': 100,
            'page_views': 500,
            'avg_time_on_site': 30,
            'bounce_rate': 90,
            'domain_authority': 10,
            'backlinks': 50,
            'organic_keywords': 10,
            'ranking_keywords': 5,
            'conversion_rate': 0.1,
            'conversion_value': 1000,
            'competition_score': 90,
            'social_shares': 10,
            'email_subscribers': 10,
            'mobile_traffic': 5,
            'returning_visitors': 5,
            'page_load_time': 8.0,
            'ssl_score': 50,
            'content_freshness': 10,
            'internal_links': 10,
            'external_links': 5,
            'brand_mentions': 5
        }
        
        result = self.ai.predict_value(low_metrics_website)
        analysis = result['comparative_analysis']
        
        # Verify analysis for low metrics
        self.assertIsNotNone(analysis)
        self.assertTrue(any('less than' in insight for insight in analysis['insights']))

if __name__ == '__main__':
    unittest.main() 