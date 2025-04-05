from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path
import logging
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class MarketDataCollector:
    def __init__(self, data_dir: str = "data/market_transactions"):
        """Initialize the Market Data Collector."""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.logger = self._setup_logging()
        
        # Configure headless browser
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger("MarketDataCollector")
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    async def collect_market_data(self, country: str = "Portugal", sector: str = "B2B SaaS") -> List[Dict[str, Any]]:
        """Collect market transaction data from various sources."""
        transactions = []
        
        # Collect data from different sources
        try:
            # Collect from business marketplaces
            marketplace_data = await self._collect_marketplace_data(country, sector)
            transactions.extend(marketplace_data)
            
            # Collect from news sources
            news_data = await self._collect_news_data(country, sector)
            transactions.extend(news_data)
            
            # Collect from company registries
            registry_data = await self._collect_registry_data(country, sector)
            transactions.extend(registry_data)
            
            # Save collected data
            self._save_transactions(transactions)
            
            return transactions
            
        except Exception as e:
            self.logger.error(f"Error collecting market data: {str(e)}")
            raise

    async def _collect_marketplace_data(self, country: str, sector: str) -> List[Dict[str, Any]]:
        """Collect data from business marketplaces."""
        transactions = []
        
        # List of marketplace sources to check
        marketplaces = [
            {
                "name": "MicroAcquire",
                "url": "https://microacquire.com/marketplace",
                "requires_auth": True
            },
            {
                "name": "Flippa",
                "url": "https://flippa.com/search",
                "requires_auth": False
            },
            {
                "name": "Empire Flippers",
                "url": "https://empireflippers.com/marketplace",
                "requires_auth": True
            }
        ]
        
        for marketplace in marketplaces:
            try:
                # Initialize headless browser
                driver = webdriver.Chrome(options=self.chrome_options)
                
                # Handle authentication if required
                if marketplace["requires_auth"]:
                    await self._authenticate_marketplace(driver, marketplace["name"])
                
                # Navigate to marketplace
                driver.get(marketplace["url"])
                
                # Apply filters for country and sector
                await self._apply_marketplace_filters(driver, marketplace["name"], country, sector)
                
                # Extract listing data
                listings = await self._extract_marketplace_listings(driver, marketplace["name"])
                transactions.extend(listings)
                
                driver.quit()
                
            except Exception as e:
                self.logger.error(f"Error collecting data from {marketplace['name']}: {str(e)}")
                continue
        
        return transactions

    async def _collect_news_data(self, country: str, sector: str) -> List[Dict[str, Any]]:
        """Collect transaction data from news sources."""
        transactions = []
        
        # News sources to monitor
        news_sources = [
            "https://www.dinheirovivo.pt",
            "https://eco.sapo.pt",
            "https://observador.pt",
            "https://www.jornaldenegocios.pt"
        ]
        
        for source in news_sources:
            try:
                # Fetch news articles
                articles = await self._fetch_news_articles(source, country, sector)
                
                # Extract transaction data from articles
                for article in articles:
                    transaction = await self._extract_transaction_from_article(article)
                    if transaction:
                        transactions.append(transaction)
                        
            except Exception as e:
                self.logger.error(f"Error collecting data from {source}: {str(e)}")
                continue
        
        return transactions

    async def _collect_registry_data(self, country: str, sector: str) -> List[Dict[str, Any]]:
        """Collect data from company registries."""
        transactions = []
        
        try:
            # Connect to Portuguese company registry
            registry_url = "https://eportugal.gov.pt/empresas"
            
            # Initialize headless browser
            driver = webdriver.Chrome(options=self.chrome_options)
            driver.get(registry_url)
            
            # Search for companies in sector
            search_box = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "search-company"))
            )
            search_box.send_keys(sector)
            search_box.submit()
            
            # Extract company data
            companies = await self._extract_registry_companies(driver)
            
            # Analyze financial statements
            for company in companies:
                transaction = await self._analyze_company_financials(company)
                if transaction:
                    transactions.append(transaction)
            
            driver.quit()
            
        except Exception as e:
            self.logger.error(f"Error collecting registry data: {str(e)}")
            raise
        
        return transactions

    async def _authenticate_marketplace(self, driver: webdriver.Chrome, marketplace: str):
        """Handle authentication for marketplaces requiring login."""
        # Implementation depends on specific marketplace requirements
        pass

    async def _apply_marketplace_filters(self, driver: webdriver.Chrome, marketplace: str, country: str, sector: str):
        """Apply filters for country and sector on marketplace."""
        try:
            if marketplace == "MicroAcquire":
                # Apply MicroAcquire filters
                filters_button = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "filters-button"))
                )
                filters_button.click()
                
                # Set location filter
                location_input = driver.find_element(By.ID, "location-filter")
                location_input.send_keys(country)
                
                # Set industry filter
                industry_input = driver.find_element(By.ID, "industry-filter")
                industry_input.send_keys(sector)
                
            elif marketplace == "Flippa":
                # Apply Flippa filters
                # Implementation for Flippa-specific filter application
                pass
                
            elif marketplace == "Empire Flippers":
                # Apply Empire Flippers filters
                # Implementation for Empire Flippers-specific filter application
                pass
                
        except Exception as e:
            self.logger.error(f"Error applying filters for {marketplace}: {str(e)}")
            raise

    async def _extract_marketplace_listings(self, driver: webdriver.Chrome, marketplace: str) -> List[Dict[str, Any]]:
        """Extract listing data from marketplace."""
        listings = []
        
        try:
            # Wait for listings to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "listing-card"))
            )
            
            # Extract listing data
            listing_elements = driver.find_elements(By.CLASS_NAME, "listing-card")
            
            for element in listing_elements:
                listing = {
                    "source": marketplace,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "company_name": element.find_element(By.CLASS_NAME, "company-name").text,
                    "valuation": self._extract_valuation(element.find_element(By.CLASS_NAME, "price").text),
                    "revenue": self._extract_revenue(element.find_element(By.CLASS_NAME, "revenue").text),
                    "growth_rate": self._extract_growth_rate(element.find_element(By.CLASS_NAME, "growth").text),
                    "metrics": self._extract_additional_metrics(element)
                }
                
                listings.append(listing)
                
        except Exception as e:
            self.logger.error(f"Error extracting listings from {marketplace}: {str(e)}")
            raise
            
        return listings

    async def _fetch_news_articles(self, source: str, country: str, sector: str) -> List[Dict[str, Any]]:
        """Fetch relevant news articles from a source."""
        articles = []
        
        try:
            # Fetch website content
            response = requests.get(source)
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Find relevant articles
            for article in soup.find_all("article"):
                # Check if article is about acquisitions/investments
                if self._is_relevant_article(article.text, country, sector):
                    articles.append({
                        "title": article.find("h2").text,
                        "url": article.find("a")["href"],
                        "date": self._extract_article_date(article),
                        "content": article.text
                    })
                    
        except Exception as e:
            self.logger.error(f"Error fetching articles from {source}: {str(e)}")
            raise
            
        return articles

    def _is_relevant_article(self, text: str, country: str, sector: str) -> bool:
        """Check if article is relevant for transaction data."""
        keywords = [
            "acquisition", "aquisição", "compra",
            "investment", "investimento",
            "valuation", "avaliação",
            "exit", "saída",
            "merger", "fusão"
        ]
        
        return any(keyword.lower() in text.lower() for keyword in keywords)

    async def _extract_transaction_from_article(self, article: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extract transaction data from news article."""
        try:
            # Extract transaction details using NLP/regex
            valuation = self._extract_valuation(article["content"])
            company_name = self._extract_company_name(article["content"])
            metrics = self._extract_metrics_from_text(article["content"])
            
            if valuation and company_name:
                return {
                    "source": "news",
                    "date": article["date"],
                    "company_name": company_name,
                    "valuation": valuation,
                    "metrics": metrics,
                    "url": article["url"]
                }
                
        except Exception as e:
            self.logger.error(f"Error extracting transaction from article: {str(e)}")
            
        return None

    def _extract_valuation(self, text: str) -> Optional[float]:
        """Extract valuation amount from text."""
        try:
            # Pattern for currency amounts (€/EUR)
            pattern = r'(?:€|EUR)\s*(\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*[mMbB](?:il(?:lion|hões)?)?)?)'
            match = re.search(pattern, text)
            
            if match:
                amount_str = match.group(1)
                # Convert to standard format
                amount_str = amount_str.replace(",", "")
                amount = float(amount_str)
                
                # Handle millions/billions
                if "m" in text.lower():
                    amount *= 1_000_000
                elif "b" in text.lower():
                    amount *= 1_000_000_000
                    
                return amount
                
        except Exception as e:
            self.logger.error(f"Error extracting valuation: {str(e)}")
            
        return None

    def _extract_metrics_from_text(self, text: str) -> Dict[str, Any]:
        """Extract various metrics from text."""
        metrics = {}
        
        try:
            # Extract revenue
            revenue_pattern = r'revenue.*?(\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*[mMbB](?:il(?:lion|hões)?)?)?)'
            revenue_match = re.search(revenue_pattern, text, re.IGNORECASE)
            if revenue_match:
                metrics["revenue"] = self._parse_amount(revenue_match.group(1))
            
            # Extract growth rate
            growth_pattern = r'growth.*?(\d+(?:\.\d+)?)\s*%'
            growth_match = re.search(growth_pattern, text, re.IGNORECASE)
            if growth_match:
                metrics["growth_rate"] = float(growth_match.group(1)) / 100
            
            # Extract other relevant metrics
            metrics.update(self._extract_additional_metrics_from_text(text))
            
        except Exception as e:
            self.logger.error(f"Error extracting metrics: {str(e)}")
            
        return metrics

    def _save_transactions(self, transactions: List[Dict[str, Any]]):
        """Save transaction data to files."""
        try:
            for transaction in transactions:
                # Generate filename
                filename = f"{transaction['date']}_{transaction['company_name'].lower().replace(' ', '_')}.json"
                file_path = self.data_dir / filename
                
                # Save transaction data
                with open(file_path, "w") as f:
                    json.dump(transaction, f, indent=2, default=str)
                    
            self.logger.info(f"Saved {len(transactions)} transactions to {self.data_dir}")
            
        except Exception as e:
            self.logger.error(f"Error saving transactions: {str(e)}")
            raise

    def _parse_amount(self, amount_str: str) -> float:
        """Parse amount string to float."""
        try:
            # Remove currency symbols and commas
            amount_str = re.sub(r'[€$,]', '', amount_str)
            amount = float(amount_str)
            
            # Handle multipliers
            if 'm' in amount_str.lower():
                amount *= 1_000_000
            elif 'b' in amount_str.lower():
                amount *= 1_000_000_000
                
            return amount
            
        except Exception as e:
            self.logger.error(f"Error parsing amount {amount_str}: {str(e)}")
            raise 