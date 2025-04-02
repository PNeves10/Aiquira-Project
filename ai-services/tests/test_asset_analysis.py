import pytest
from unittest.mock import Mock, patch
from ..src.services.asset_analysis import (
    AssetAnalysisService,
    AssetDetails,
    FinancialMetrics,
    Document,
    AIAnalysis,
    ValuationAnalysis,
    RiskAnalysis,
    DocumentAnalysis
)

@pytest.fixture
def mock_openai():
    with patch('openai.ChatCompletion.create') as mock:
        yield mock

@pytest.fixture
def service():
    return AssetAnalysisService(openai_api_key="test_key")

@pytest.fixture
def sample_asset():
    return AssetDetails(
        id=1,
        title="Test Asset",
        type="Business",
        price="€1M",
        status="Available",
        description="Test business asset",
        location="Test Location",
        financials=FinancialMetrics(
            revenue=1000000.0,
            profit=200000.0,
            employees=50,
            year_founded=2020
        ),
        documents=[]
    )

@pytest.fixture
def sample_document():
    return Document(
        id="test_doc",
        name="test.pdf",
        type="application/pdf",
        url="http://test.com/test.pdf",
        content="Test document content"
    )

def test_analyze_asset(service, mock_openai, sample_asset):
    # Mock OpenAI response
    mock_openai.return_value.choices = [Mock(
        message=Mock(
            content='''
            {
                "valuation": {
                    "value": "€1.2M",
                    "confidence": 0.85,
                    "factors": ["Factor 1", "Factor 2"]
                },
                "risks": {
                    "level": "medium",
                    "items": ["Risk 1", "Risk 2"]
                },
                "opportunities": ["Opportunity 1", "Opportunity 2"],
                "market_trends": ["Trend 1", "Trend 2"],
                "competitor_analysis": {
                    "competitors": ["Competitor 1"],
                    "market_position": ["Position 1"],
                    "advantages": ["Advantage 1"],
                    "disadvantages": ["Disadvantage 1"]
                }
            }
            '''
        )
    )]

    # Test analysis
    analysis = service.analyze_asset(sample_asset)

    # Verify results
    assert isinstance(analysis, AIAnalysis)
    assert analysis.valuation.value == "€1.2M"
    assert analysis.valuation.confidence == 0.85
    assert len(analysis.valuation.factors) == 2
    assert analysis.risks.level == "medium"
    assert len(analysis.risks.items) == 2
    assert len(analysis.opportunities) == 2
    assert len(analysis.market_trends) == 2
    assert analysis.competitor_analysis is not None

def test_analyze_documents(service, mock_openai, sample_document):
    # Mock OpenAI response
    mock_openai.return_value.choices = [Mock(
        message=Mock(
            content='''
            {
                "summary": "Test summary",
                "key_findings": ["Finding 1", "Finding 2"],
                "risk_factors": [
                    {"category": "Financial", "severity": "High", "description": "Risk 1"}
                ],
                "recommendations": ["Recommendation 1"],
                "financial_metrics": {"revenue": 1000000.0},
                "legal_issues": ["Issue 1"],
                "market_insights": ["Insight 1"]
            }
            '''
        )
    )]

    # Test document analysis
    analyses = service.analyze_documents([sample_document])

    # Verify results
    assert len(analyses) == 1
    analysis = analyses[0]
    assert isinstance(analysis, DocumentAnalysis)
    assert analysis.summary == "Test summary"
    assert len(analysis.key_findings) == 2
    assert len(analysis.risk_factors) == 1
    assert len(analysis.recommendations) == 1
    assert analysis.financial_metrics is not None
    assert len(analysis.legal_issues) == 1
    assert len(analysis.market_insights) == 1

def test_generate_valuation_report(service, sample_asset):
    analysis = AIAnalysis(
        valuation=ValuationAnalysis(
            value="€1.2M",
            confidence=0.85,
            factors=["Factor 1", "Factor 2"]
        ),
        risks=RiskAnalysis(
            level="medium",
            items=["Risk 1", "Risk 2"]
        ),
        opportunities=["Opportunity 1", "Opportunity 2"],
        market_trends=["Trend 1", "Trend 2"],
        competitor_analysis={
            "competitors": ["Competitor 1"],
            "market_position": ["Position 1"],
            "advantages": ["Advantage 1"],
            "disadvantages": ["Disadvantage 1"]
        }
    )

    report = service.generate_valuation_report(sample_asset, analysis)
    
    assert isinstance(report, str)
    assert "Valuation Report for Test Asset" in report
    assert "€1.2M" in report
    assert "85%" in report
    assert "Factor 1" in report
    assert "Risk 1" in report
    assert "Opportunity 1" in report
    assert "Trend 1" in report
    assert "Competitor 1" in report

def test_extract_document_content(service, sample_document):
    # Test PDF content extraction
    pdf_content = service._extract_document_content(sample_document)
    assert isinstance(pdf_content, str)
    assert "Test document content" in pdf_content

    # Test DOCX content extraction
    docx_doc = Document(
        id="test_docx",
        name="test.docx",
        type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url="http://test.com/test.docx",
        content="Test document content"
    )
    docx_content = service._extract_document_content(docx_doc)
    assert isinstance(docx_content, str)
    assert "Test document content" in docx_content 