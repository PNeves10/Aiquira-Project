from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
from ..services.asset_analysis import (
    AssetDetails,
    AssetAnalysisService,
    AIAnalysis,
    Document,
    DocumentAnalysis
)
from ..config import get_settings
from ..dependencies import get_asset_analysis_service

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.post("/{asset_id}/analyze", response_model=AIAnalysis)
async def analyze_asset(
    asset_id: int,
    asset: AssetDetails,
    service: AssetAnalysisService = Depends(get_asset_analysis_service)
):
    """
    Analyze an asset using AI to provide valuation, risk assessment, and opportunities.
    """
    try:
        analysis = service.analyze_asset(asset)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{asset_id}/documents/analyze", response_model=List[DocumentAnalysis])
async def analyze_documents(
    asset_id: int,
    documents: List[Document],
    service: AssetAnalysisService = Depends(get_asset_analysis_service)
):
    """
    Analyze documents related to an asset.
    """
    try:
        analyses = service.analyze_documents(documents)
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{asset_id}/documents/upload")
async def upload_document(
    asset_id: int,
    file: UploadFile = File(...),
    service: AssetAnalysisService = Depends(get_asset_analysis_service)
):
    """
    Upload and analyze a document for an asset.
    """
    try:
        content = await file.read()
        doc = Document(
            id=f"{asset_id}_{file.filename}",
            name=file.filename,
            type=file.content_type,
            url=f"/api/assets/{asset_id}/documents/{file.filename}",
            content=content.decode()
        )
        analysis = service.analyze_documents([doc])[0]
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{asset_id}/report")
async def get_valuation_report(
    asset_id: int,
    asset: AssetDetails,
    analysis: AIAnalysis,
    service: AssetAnalysisService = Depends(get_asset_analysis_service)
):
    """
    Generate a detailed valuation report for an asset.
    """
    try:
        report = service.generate_valuation_report(asset, analysis)
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 