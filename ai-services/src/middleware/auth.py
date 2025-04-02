from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException
from ..config import get_settings

settings = get_settings()

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token and return the decoded payload.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def get_current_user(request) -> Dict[str, Any]:
    """
    Get the current user from the request state.
    """
    if not hasattr(request.state, "user"):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    return request.state.user 