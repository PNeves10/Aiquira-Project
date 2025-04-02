from fastapi import Depends
from .config import get_settings
from .services.asset_analysis import AssetAnalysisService

def get_asset_analysis_service(settings = Depends(get_settings)) -> AssetAnalysisService:
    """
    Dependency to get the AssetAnalysisService instance.
    """
    return AssetAnalysisService(openai_api_key=settings.openai_api_key) 