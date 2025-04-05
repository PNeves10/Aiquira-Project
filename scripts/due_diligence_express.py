from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
from pathlib import Path
import logging
import json
from document_analyzer import DocumentAnalyzer
from sector_benchmarking import SectorBenchmarking
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from jinja2 import Environment, FileSystemLoader
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import aiosmtplib
from email.utils import formatdate
import ssl

@dataclass
class EmailConfig:
    smtp_server: str
    smtp_port: int
    username: str
    password: str
    use_tls: bool = True
    sender_email: str = "due.diligence@aiquira.com"
    reply_to: str = "support@aiquira.com"

@dataclass
class AnalysisStatus:
    document_processing: Dict[str, Any]
    financial_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    sector_analysis: Dict[str, Any]
    progress_percentage: float
    eta: datetime

@dataclass
class AnalysisRequest:
    request_id: str
    user_id: str
    company_name: str
    sector: str
    country: str
    documents: List[Dict[str, str]]  # List of {name: path} pairs
    email: str
    submitted_at: datetime
    status: str = "pending"
    completion_deadline: Optional[datetime] = None

@dataclass
class AnalysisReport:
    request_id: str
    company_name: str
    sector: str
    country: str
    executive_summary: Dict[str, Any]
    financial_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    sector_comparison: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    generated_at: datetime
    charts: Dict[str, Any]

class DueDiligenceExpress:
    def __init__(self, output_dir: str = "reports", email_config: Optional[EmailConfig] = None):
        """Initialize the Due Diligence Express system."""
        self.document_analyzer = DocumentAnalyzer()
        self.sector_benchmarking = SectorBenchmarking()
        self.logger = self._setup_logging()
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.email_config = email_config
        
        # Load email templates
        self.template_env = Environment(
            loader=FileSystemLoader("templates"),
            autoescape=True
        )

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger("DueDiligenceExpress")
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    async def submit_analysis_request(self, 
                                    user_id: str,
                                    company_name: str,
                                    sector: str,
                                    country: str,
                                    documents: List[Dict[str, str]],
                                    email: str) -> AnalysisRequest:
        """Submit a new analysis request."""
        request_id = f"DD{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        request = AnalysisRequest(
            request_id=request_id,
            user_id=user_id,
            company_name=company_name,
            sector=sector,
            country=country,
            documents=documents,
            email=email,
            submitted_at=datetime.now(),
            completion_deadline=datetime.now() + timedelta(hours=24)
        )
        
        # Start analysis process
        asyncio.create_task(self._process_analysis_request(request))
        
        return request

    async def _send_email(self, to_email: str, subject: str, template_name: str, template_data: Dict[str, Any], attachments: List[Dict[str, Any]] = None):
        """Send an email using the specified template."""
        if not self.email_config:
            self.logger.error("Email configuration not provided")
            return

        try:
            msg = MIMEMultipart()
            msg["Subject"] = subject
            msg["From"] = self.email_config.sender_email
            msg["To"] = to_email
            msg["Date"] = formatdate()
            msg["Reply-To"] = self.email_config.reply_to

            # Render template
            template = self.template_env.get_template(template_name)
            html_content = template.render(**template_data)
            msg.attach(MIMEText(html_content, "html"))

            # Add attachments
            if attachments:
                for attachment in attachments:
                    with open(attachment["path"], "rb") as f:
                        part = MIMEApplication(f.read(), _subtype=attachment["type"])
                        part.add_header(
                            "Content-Disposition",
                            "attachment",
                            filename=attachment["filename"]
                        )
                        msg.attach(part)

            # Configure SSL context
            context = ssl.create_default_context()
            
            # Send email using aiosmtplib
            await aiosmtplib.send(
                msg,
                hostname=self.email_config.smtp_server,
                port=self.email_config.smtp_port,
                username=self.email_config.username,
                password=self.email_config.password,
                use_tls=self.email_config.use_tls,
                tls_context=context
            )

            self.logger.info(f"Email sent successfully to {to_email}")

        except Exception as e:
            self.logger.error(f"Error sending email: {str(e)}")
            raise

    async def _update_analysis_status(self, request: AnalysisRequest) -> AnalysisStatus:
        """Update and return the current analysis status."""
        try:
            # Calculate progress for each stage
            doc_processing = self._calculate_document_processing_status(request)
            financial = self._calculate_financial_analysis_status(request)
            risk = self._calculate_risk_assessment_status(request)
            sector = self._calculate_sector_analysis_status(request)

            # Calculate overall progress
            progress = (
                doc_processing["progress"] +
                financial["progress"] +
                risk["progress"] +
                sector["progress"]
            ) / 4

            # Estimate completion time
            remaining_time = self._estimate_remaining_time(progress)
            eta = datetime.now() + remaining_time

            return AnalysisStatus(
                document_processing=doc_processing,
                financial_analysis=financial,
                risk_assessment=risk,
                sector_analysis=sector,
                progress_percentage=progress * 100,
                eta=eta
            )

        except Exception as e:
            self.logger.error(f"Error updating analysis status: {str(e)}")
            raise

    async def _send_status_update(self, request: AnalysisRequest, status: AnalysisStatus):
        """Send a status update email."""
        template_data = {
            "company_name": request.company_name,
            "request_id": request.request_id,
            "submitted_time": request.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
            "progress_percentage": round(status.progress_percentage, 1),
            "eta": status.eta.strftime("%Y-%m-%d %H:%M:%S"),
            "documents_processed": len([d for d in request.documents if d.get("processed", False)]),
            "total_documents": len(request.documents),
            "document_processing_status": self._get_status_class(status.document_processing),
            "document_processing_details": status.document_processing["details"],
            "financial_analysis_status": self._get_status_class(status.financial_analysis),
            "financial_analysis_details": status.financial_analysis["details"],
            "risk_assessment_status": self._get_status_class(status.risk_assessment),
            "risk_assessment_details": status.risk_assessment["details"],
            "sector_analysis_status": self._get_status_class(status.sector_analysis),
            "sector_analysis_details": status.sector_analysis["details"]
        }

        await self._send_email(
            to_email=request.email,
            subject=f"Due Diligence Status Update - {request.company_name}",
            template_name="status_update.html",
            template_data=template_data
        )

    def _get_status_class(self, status_data: Dict[str, Any]) -> str:
        """Convert progress to status class for template."""
        progress = status_data["progress"]
        if progress >= 1.0:
            return "complete"
        elif progress > 0:
            return "in-progress"
        return "pending"

    async def _process_analysis_request(self, request: AnalysisRequest):
        """Process an analysis request asynchronously with status updates."""
        try:
            self.logger.info(f"Starting analysis for request {request.request_id}")
            request.status = "processing"
            
            # Initial status update
            status = await self._update_analysis_status(request)
            await self._send_status_update(request, status)
            
            # Process documents with periodic status updates
            analysis_results = []
            for doc in request.documents:
                doc_path = doc["path"]
                doc_type = doc["type"]
                
                result = self.document_analyzer.analyze_document(
                    file_path=doc_path,
                    sector=request.sector,
                    country=request.country
                )
                analysis_results.append({"type": doc_type, "results": result})
                doc["processed"] = True
                
                # Send status update after each document
                status = await self._update_analysis_status(request)
                await self._send_status_update(request, status)
            
            # Generate report
            report = self._generate_report(request, analysis_results)
            self._save_report(report)
            
            # Send completion notification
            await self._send_completion_notification(request, report)
            
            request.status = "completed"
            self.logger.info(f"Completed analysis for request {request.request_id}")
            
        except Exception as e:
            request.status = "failed"
            self.logger.error(f"Error processing request {request.request_id}: {str(e)}")
            await self._send_error_notification(request, str(e))

    def _generate_report(self, request: AnalysisRequest, analysis_results: List[Dict[str, Any]]) -> AnalysisReport:
        """Generate a comprehensive analysis report."""
        # Extract key findings
        financial_metrics = self._aggregate_financial_metrics(analysis_results)
        hidden_debts = self._aggregate_hidden_debts(analysis_results)
        problematic_clauses = self._aggregate_problematic_clauses(analysis_results)
        sector_analysis = self._get_sector_analysis(analysis_results)
        
        # Generate visualizations
        charts = self._generate_charts(financial_metrics, sector_analysis)
        
        # Create executive summary
        executive_summary = self._generate_executive_summary(
            financial_metrics,
            hidden_debts,
            problematic_clauses,
            sector_analysis
        )
        
        # Generate risk assessment
        risk_assessment = self._assess_risks(
            hidden_debts,
            problematic_clauses,
            financial_metrics,
            sector_analysis
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            risk_assessment,
            sector_analysis
        )
        
        return AnalysisReport(
            request_id=request.request_id,
            company_name=request.company_name,
            sector=request.sector,
            country=request.country,
            executive_summary=executive_summary,
            financial_analysis=financial_metrics,
            risk_assessment=risk_assessment,
            sector_comparison=sector_analysis,
            recommendations=recommendations,
            generated_at=datetime.now(),
            charts=charts
        )

    def _aggregate_financial_metrics(self, analysis_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate financial metrics from all analyzed documents."""
        all_metrics = []
        for result in analysis_results:
            if "financial_metrics" in result["results"]:
                all_metrics.extend(result["results"]["financial_metrics"])
        
        # Group metrics by name and take the most recent value
        metrics_by_name = {}
        for metric in all_metrics:
            if metric.name not in metrics_by_name or metric.date > metrics_by_name[metric.name].date:
                metrics_by_name[metric.name] = metric
        
        return {
            "metrics": metrics_by_name,
            "summary": self._summarize_financial_metrics(metrics_by_name)
        }

    def _aggregate_hidden_debts(self, analysis_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate hidden debts from all analyzed documents."""
        all_debts = []
        total_hidden_debt = 0.0
        
        for result in analysis_results:
            if "hidden_debts" in result["results"]:
                all_debts.extend(result["results"]["hidden_debts"])
                total_hidden_debt += sum(debt.amount for debt in result["results"]["hidden_debts"])
        
        return {
            "items": all_debts,
            "total_amount": total_hidden_debt,
            "summary": self._summarize_hidden_debts(all_debts)
        }

    def _aggregate_problematic_clauses(self, analysis_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate problematic clauses from all analyzed documents."""
        all_clauses = []
        for result in analysis_results:
            if "problematic_clauses" in result["results"]:
                all_clauses.extend(result["results"]["problematic_clauses"])
        
        # Group clauses by risk level
        clauses_by_risk = {
            "high": [],
            "medium": [],
            "low": []
        }
        
        for clause in all_clauses:
            clauses_by_risk[clause.risk_level].append(clause)
        
        return {
            "clauses": all_clauses,
            "by_risk": clauses_by_risk,
            "summary": self._summarize_problematic_clauses(clauses_by_risk)
        }

    def _generate_charts(self, financial_metrics: Dict[str, Any], sector_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate visualizations for the report."""
        charts = {}
        
        # Financial Metrics Comparison Chart
        metrics_comparison = go.Figure()
        for metric_name, metric in financial_metrics["metrics"].items():
            if metric_name in sector_analysis.get("benchmarks", {}):
                benchmark = sector_analysis["benchmarks"][metric_name]
                metrics_comparison.add_trace(go.Bar(
                    name=metric_name,
                    x=["Company", "Sector Average"],
                    y=[metric.value, benchmark["sector_average"]],
                    text=[f"{metric.value:.1%}", f"{benchmark['sector_average']:.1%}"],
                    textposition="auto"
                ))
        
        metrics_comparison.update_layout(
            title="Financial Metrics Comparison",
            barmode="group",
            showlegend=True
        )
        
        charts["metrics_comparison"] = metrics_comparison
        
        # Risk Distribution Chart
        risk_data = self._aggregate_risks(financial_metrics, sector_analysis)
        risk_chart = px.pie(
            values=[len(risks) for risks in risk_data.values()],
            names=list(risk_data.keys()),
            title="Risk Distribution"
        )
        
        charts["risk_distribution"] = risk_chart
        
        return charts

    def _generate_executive_summary(self,
                                  financial_metrics: Dict[str, Any],
                                  hidden_debts: Dict[str, Any],
                                  problematic_clauses: Dict[str, Any],
                                  sector_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an executive summary of the analysis."""
        return {
            "financial_health": self._assess_financial_health(financial_metrics, sector_analysis),
            "key_risks": self._identify_key_risks(hidden_debts, problematic_clauses),
            "sector_position": self._summarize_sector_position(sector_analysis),
            "key_recommendations": self._generate_key_recommendations(
                financial_metrics,
                hidden_debts,
                problematic_clauses,
                sector_analysis
            )
        }

    async def _send_completion_notification(self, request: AnalysisRequest, report: AnalysisReport):
        """Send email notification when analysis is complete."""
        try:
            pdf_path = self.output_dir / f"{report.request_id}.pdf"
            attachments = [{
                "path": str(pdf_path),
                "type": "pdf",
                "filename": f"Due_Diligence_Report_{request.company_name}.pdf"
            }]

            template_data = {
                "company_name": request.company_name,
                "report_id": report.request_id,
                "completion_time": report.generated_at.strftime("%Y-%m-%d %H:%M:%S"),
                "executive_summary": report.executive_summary
            }

            await self._send_email(
                to_email=request.email,
                subject=f"Due Diligence Report Ready - {request.company_name}",
                template_name="report_notification.html",
                template_data=template_data,
                attachments=attachments
            )
            
        except Exception as e:
            self.logger.error(f"Error sending completion notification: {str(e)}")
            raise

    async def _send_error_notification(self, request: AnalysisRequest, error_message: str):
        """Send notification when analysis fails."""
        try:
            template_data = {
                "company_name": request.company_name,
                "request_id": request.request_id,
                "error_message": error_message
            }

            await self._send_email(
                to_email=request.email,
                subject=f"Due Diligence Analysis Failed - {request.company_name}",
                template_name="error_notification.html",
                template_data=template_data
            )
            
        except Exception as e:
            self.logger.error(f"Error sending error notification: {str(e)}")
            raise

    def _save_report(self, report: AnalysisReport):
        """Save the report to disk."""
        try:
            # Save JSON version
            json_path = self.output_dir / f"{report.request_id}.json"
            with open(json_path, "w") as f:
                json.dump(report.__dict__, f, default=str)
            
            # Generate and save PDF version
            pdf_path = self.output_dir / f"{report.request_id}.pdf"
            self._generate_pdf_report(report, pdf_path)
            
            self.logger.info(f"Report saved: {report.request_id}")
            
        except Exception as e:
            self.logger.error(f"Error saving report: {str(e)}")
            raise 