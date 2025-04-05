import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import pytesseract
from pdf2image import convert_from_path
import spacy
from transformers import pipeline
import numpy as np
import pandas as pd
from PIL import Image
import re
import fitz  # PyMuPDF
import logging
from pathlib import Path
from sector_benchmarking import SectorBenchmarking, BenchmarkMetric

@dataclass
class FinancialMetric:
    name: str
    value: float
    date: datetime
    confidence: float
    source_page: int
    context: str

@dataclass
class ContractClause:
    text: str
    category: str
    risk_level: str
    confidence: float
    page_number: int
    context: str
    recommendations: List[str]

@dataclass
class DebtItem:
    description: str
    amount: float
    creditor: str
    due_date: Optional[datetime]
    interest_rate: Optional[float]
    is_hidden: bool
    confidence: float
    evidence: str
    page_reference: int

class DocumentAnalyzer:
    def __init__(self, model_path: str = None):
        """Initialize the document analyzer with necessary models and configurations."""
        self.nlp = spacy.load("en_core_web_trf")
        self.ner_pipeline = pipeline("ner", model="jean-baptiste/camembert-ner-with-dates")
        self.zero_shot_classifier = pipeline("zero-shot-classification")
        self.logger = self._setup_logging()
        self.sector_benchmarking = SectorBenchmarking()
        
        # Custom patterns for financial data extraction
        self.financial_patterns = [
            {"label": "DEBT", "pattern": [{"LOWER": {"IN": ["debt", "loan", "liability", "borrowing"]}},
                                        {"LIKE_NUM": True}]},
            {"label": "AMOUNT", "pattern": [{"LIKE_NUM": True}, 
                                          {"LOWER": {"IN": ["eur", "euro", "euros", "€"]}}]},
            {"label": "DATE", "pattern": [{"LIKE_NUM": True}, 
                                        {"LOWER": {"IN": ["january", "february", "march", "april", "may", "june", 
                                                        "july", "august", "september", "october", "november", "december"]}}]}
        ]
        
        # Add custom patterns to spaCy
        ruler = self.nlp.add_pipe("entity_ruler", before="ner")
        ruler.add_patterns(self.financial_patterns)

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger("DocumentAnalyzer")
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def analyze_document(self, file_path: str, sector: str = None, country: str = None) -> Dict[str, Any]:
        """Main method to analyze a document and extract all relevant information."""
        try:
            self.logger.info(f"Starting analysis of document: {file_path}")
            
            # Extract text using OCR
            text_by_page = self._extract_text_from_pdf(file_path)
            
            # Analyze different aspects
            hidden_debts = self._identify_hidden_debts(text_by_page)
            problematic_clauses = self._identify_problematic_clauses(text_by_page)
            financial_metrics = self._extract_financial_metrics(text_by_page)
            
            # Perform sector benchmarking if sector and country are provided
            sector_analysis = None
            if sector and country:
                # Convert financial metrics to format expected by sector benchmarking
                metrics_for_benchmarking = self._prepare_metrics_for_benchmarking(financial_metrics)
                sector_analysis = self.sector_benchmarking.analyze_sector_performance(
                    metrics_for_benchmarking,
                    sector,
                    country
                )
            
            return {
                "hidden_debts": hidden_debts,
                "problematic_clauses": problematic_clauses,
                "financial_metrics": financial_metrics,
                "sector_analysis": sector_analysis,
                "analysis_timestamp": datetime.now().isoformat(),
                "document_path": file_path
            }
        except Exception as e:
            self.logger.error(f"Error analyzing document {file_path}: {str(e)}")
            raise

    def _extract_text_from_pdf(self, file_path: str) -> Dict[int, str]:
        """Extract text from PDF using both PDF parsing and OCR for images."""
        text_by_page = {}
        
        try:
            # First try direct PDF text extraction
            pdf_document = fitz.open(file_path)
            
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                text = page.get_text()
                
                # If page has little or no text, try OCR
                if len(text.strip()) < 100:
                    # Convert PDF page to image
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Perform OCR
                    ocr_text = pytesseract.image_to_string(img, lang='eng+por')
                    text = ocr_text if len(ocr_text.strip()) > len(text.strip()) else text
                
                text_by_page[page_num + 1] = text
                
            return text_by_page
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def _identify_hidden_debts(self, text_by_page: Dict[int, str]) -> List[DebtItem]:
        """Identify potential hidden debts in the document."""
        hidden_debts = []
        
        debt_keywords = [
            "contingent liability", "off-balance sheet", "guarantee", "warranty",
            "pending litigation", "legal proceedings", "potential claim",
            "undisclosed obligation", "future commitment", "lease obligation"
        ]
        
        for page_num, text in text_by_page.items():
            doc = self.nlp(text)
            
            # Look for amounts near debt-related terms
            for sent in doc.sents:
                sent_text = sent.text.lower()
                
                # Check if sentence contains debt-related keywords
                if any(keyword in sent_text for keyword in debt_keywords):
                    # Extract amounts
                    amounts = self._extract_amounts(sent_text)
                    
                    # Extract dates
                    dates = self._extract_dates(sent_text)
                    
                    # Extract creditor information
                    creditor = self._extract_creditor(sent)
                    
                    if amounts:
                        for amount in amounts:
                            debt_item = DebtItem(
                                description=sent.text,
                                amount=amount,
                                creditor=creditor,
                                due_date=dates[0] if dates else None,
                                interest_rate=self._extract_interest_rate(sent_text),
                                is_hidden=True,
                                confidence=0.85,  # Confidence score based on context
                                evidence=sent.text,
                                page_reference=page_num
                            )
                            hidden_debts.append(debt_item)
        
        return hidden_debts

    def _identify_problematic_clauses(self, text_by_page: Dict[int, str]) -> List[ContractClause]:
        """Identify potentially problematic clauses in contracts."""
        problematic_clauses = []
        
        # Define categories of problematic clauses
        clause_categories = {
            "exclusivity": [
                "exclusive", "sole provider", "sole supplier", "exclusively",
                "may not engage", "shall not contract", "prohibited from"
            ],
            "termination": [
                "termination fee", "early termination", "break fee",
                "cancellation penalty", "termination penalty"
            ],
            "liability": [
                "unlimited liability", "full responsibility", "indemnify",
                "hold harmless", "waive all rights"
            ],
            "change_control": [
                "change of control", "ownership change", "transfer of shares",
                "merger", "acquisition"
            ],
            "non_compete": [
                "non-compete", "not compete", "competitive activity",
                "similar business", "competing business"
            ]
        }
        
        for page_num, text in text_by_page.items():
            # Split text into paragraphs
            paragraphs = text.split('\n\n')
            
            for paragraph in paragraphs:
                # Check each category
                for category, keywords in clause_categories.items():
                    if any(keyword.lower() in paragraph.lower() for keyword in keywords):
                        # Analyze the risk level
                        risk_level = self._assess_clause_risk(paragraph, category)
                        
                        # Get recommendations
                        recommendations = self._generate_clause_recommendations(paragraph, category, risk_level)
                        
                        clause = ContractClause(
                            text=paragraph,
                            category=category,
                            risk_level=risk_level,
                            confidence=0.9,  # Confidence score based on keyword matches
                            page_number=page_num,
                            context=self._get_surrounding_context(text_by_page[page_num], paragraph),
                            recommendations=recommendations
                        )
                        problematic_clauses.append(clause)
        
        return problematic_clauses

    def _extract_financial_metrics(self, text_by_page: Dict[int, str]) -> List[FinancialMetric]:
        """Extract key financial metrics from the document."""
        metrics = []
        
        # Enhanced patterns for financial metrics
        metric_patterns = {
            "revenue": r"(?i)revenue[s]?\s*:?\s*([\d,.]+)",
            "net_profit": r"(?i)net\s+profit\s*:?\s*([\d,.]+)",
            "gross_profit": r"(?i)gross\s+profit\s*:?\s*([\d,.]+)",
            "operating_profit": r"(?i)operating\s+profit\s*:?\s*([\d,.]+)",
            "ebitda": r"(?i)ebitda\s*:?\s*([\d,.]+)",
            "total_assets": r"(?i)total\s+assets\s*:?\s*([\d,.]+)",
            "total_liabilities": r"(?i)total\s+liabilities\s*:?\s*([\d,.]+)",
            "inventory": r"(?i)inventory\s*:?\s*([\d,.]+)",
            "accounts_receivable": r"(?i)accounts?\s+receivable\s*:?\s*([\d,.]+)",
            "accounts_payable": r"(?i)accounts?\s+payable\s*:?\s*([\d,.]+)"
        }
        
        for page_num, text in text_by_page.items():
            for metric_name, pattern in metric_patterns.items():
                matches = re.finditer(pattern, text)
                
                for match in matches:
                    # Extract the value and clean it
                    value_str = match.group(1)
                    value = float(re.sub(r'[^\d.]', '', value_str))
                    
                    # Extract date context
                    date = self._extract_date_context(text, match.start())
                    
                    metric = FinancialMetric(
                        name=metric_name,
                        value=value,
                        date=date,
                        confidence=0.95,
                        source_page=page_num,
                        context=text[max(0, match.start()-100):match.end()+100]
                    )
                    metrics.append(metric)
        
        return metrics

    def _extract_amounts(self, text: str) -> List[float]:
        """Extract monetary amounts from text."""
        # Pattern for monetary amounts (handles different formats)
        amount_pattern = r'(?:€|EUR|EURO)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:€|EUR|EURO)?'
        amounts = []
        
        matches = re.finditer(amount_pattern, text)
        for match in matches:
            try:
                # Clean and convert to float
                amount_str = match.group(1).replace(',', '')
                amount = float(amount_str)
                amounts.append(amount)
            except ValueError:
                continue
        
        return amounts

    def _extract_dates(self, text: str) -> List[datetime]:
        """Extract dates from text."""
        # Use the NER pipeline to extract dates
        entities = self.ner_pipeline(text)
        dates = []
        
        for entity in entities:
            if entity['entity'] == 'DATE':
                try:
                    # Parse date string to datetime
                    date_str = entity['word']
                    # Add your date parsing logic here
                    # This is a simplified example
                    date = pd.to_datetime(date_str)
                    dates.append(date)
                except ValueError:
                    continue
        
        return dates

    def _extract_creditor(self, span: spacy.tokens.Span) -> str:
        """Extract creditor information from a text span."""
        # Look for organization entities
        orgs = [ent.text for ent in span.ents if ent.label_ == "ORG"]
        return orgs[0] if orgs else ""

    def _extract_interest_rate(self, text: str) -> Optional[float]:
        """Extract interest rate from text."""
        # Pattern for interest rate mentions
        rate_pattern = r'(\d+(?:\.\d+)?)\s*%\s*(?:interest|rate|p\.a\.|per annum)'
        match = re.search(rate_pattern, text.lower())
        
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        return None

    def _assess_clause_risk(self, clause_text: str, category: str) -> str:
        """Assess the risk level of a contract clause."""
        # Use zero-shot classification to assess risk
        candidate_labels = ["high risk", "medium risk", "low risk"]
        result = self.zero_shot_classifier(clause_text, candidate_labels)
        
        # Get the highest probability classification
        risk_level = result['labels'][0]
        return risk_level.split()[0]  # Returns 'high', 'medium', or 'low'

    def _generate_clause_recommendations(self, clause_text: str, category: str, risk_level: str) -> List[str]:
        """Generate recommendations for handling problematic clauses."""
        recommendations = []
        
        if category == "exclusivity":
            recommendations.extend([
                "Negotiate time limitation for exclusivity clause",
                "Add specific performance metrics as conditions",
                "Include early termination options"
            ])
        elif category == "termination":
            recommendations.extend([
                "Review and potentially cap termination fees",
                "Add mutual termination rights",
                "Include force majeure clauses"
            ])
        elif category == "liability":
            recommendations.extend([
                "Add liability caps",
                "Specify excluded damages",
                "Include insurance requirements"
            ])
        
        return recommendations

    def _get_surrounding_context(self, page_text: str, target_text: str, context_chars: int = 200) -> str:
        """Get surrounding context for a piece of text."""
        start_pos = page_text.find(target_text)
        if start_pos == -1:
            return target_text
            
        context_start = max(0, start_pos - context_chars)
        context_end = min(len(page_text), start_pos + len(target_text) + context_chars)
        
        return page_text[context_start:context_end]

    def _extract_date_context(self, text: str, position: int, window_size: int = 200) -> Optional[datetime]:
        """Extract date context from surrounding text."""
        # Get surrounding context
        start = max(0, position - window_size)
        end = min(len(text), position + window_size)
        context = text[start:end]
        
        # Extract dates from context
        dates = self._extract_dates(context)
        return dates[0] if dates else None

    def _prepare_metrics_for_benchmarking(self, financial_metrics: List[FinancialMetric]) -> Dict[str, float]:
        """Convert financial metrics to format needed for sector benchmarking."""
        metrics_dict = {}
        
        # Create a mapping of metric names to standardized names
        metric_mapping = {
            "net_profit": "net_margin",
            "gross_profit": "gross_margin",
            "operating_profit": "operating_margin",
            "ebitda": "ebitda_margin",
            "revenue": "revenue",
            "total_assets": "total_assets",
            "total_liabilities": "total_liabilities"
        }
        
        # Group metrics by date to get the most recent values
        metrics_by_date = {}
        for metric in financial_metrics:
            if metric.date not in metrics_by_date:
                metrics_by_date[metric.date] = {}
            metrics_by_date[metric.date][metric.name] = metric.value
        
        # Get the most recent date
        if metrics_by_date:
            most_recent_date = max(metrics_by_date.keys())
            recent_metrics = metrics_by_date[most_recent_date]
            
            # Calculate ratios and margins
            if "revenue" in recent_metrics:
                revenue = recent_metrics["revenue"]
                
                # Calculate margins
                if "net_profit" in recent_metrics:
                    metrics_dict["net_margin"] = recent_metrics["net_profit"] / revenue
                if "gross_profit" in recent_metrics:
                    metrics_dict["gross_margin"] = recent_metrics["gross_profit"] / revenue
                if "operating_profit" in recent_metrics:
                    metrics_dict["operating_margin"] = recent_metrics["operating_profit"] / revenue
                if "ebitda" in recent_metrics:
                    metrics_dict["ebitda_margin"] = recent_metrics["ebitda"] / revenue
            
            # Calculate other ratios
            if "total_assets" in recent_metrics and "total_liabilities" in recent_metrics:
                metrics_dict["debt_to_equity"] = recent_metrics["total_liabilities"] / recent_metrics["total_assets"]
        
        return metrics_dict 