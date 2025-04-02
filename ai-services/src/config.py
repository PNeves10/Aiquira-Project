from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    openai_api_key: str
    environment: str = "development"
    debug: bool = False
    api_version: str = "v1"
    cors_origins: list[str] = ["http://localhost:3000"]  # Frontend URL
    sentry_dsn: str = ""
    log_level: str = "INFO"
    
    # JWT Settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = 60
    rate_limit_burst_size: int = 10
    
    # Security
    max_request_size_mb: int = 10
    allowed_content_types: list[str] = ["application/json"]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    """
    return Settings() 