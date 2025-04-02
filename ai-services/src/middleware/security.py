from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Dict, List
import time
from datetime import datetime, timedelta
import re
from .auth import verify_token
from ..utils.logger import log_error

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        burst_size: int = 10,
        excluded_paths: List[str] = None
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.excluded_paths = excluded_paths or []
        self.requests: Dict[str, List[datetime]] = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        path = request.url.path

        # Skip rate limiting for excluded paths
        if any(re.match(pattern, path) for pattern in self.excluded_paths):
            return await call_next(request)

        # Clean up old requests
        self._cleanup_old_requests(client_ip)

        # Check rate limit
        if len(self.requests.get(client_ip, [])) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )

        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(datetime.now())

        return await call_next(request)

    def _cleanup_old_requests(self, client_ip: str):
        if client_ip in self.requests:
            cutoff = datetime.now() - timedelta(minutes=1)
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if req_time > cutoff
            ]

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        return response

class InputValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Validate content type
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not content_type.startswith("application/json"):
                raise HTTPException(
                    status_code=415,
                    detail="Unsupported media type. Use application/json"
                )

        # Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=413,
                detail="Request too large"
            )

        return await call_next(request)

class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for public endpoints
        if request.url.path in ["/", "/api/auth/login", "/api/auth/register"]:
            return await call_next(request)

        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Missing or invalid authentication token"
            )

        token = auth_header.split(" ")[1]
        try:
            # Verify token and add user to request state
            user = verify_token(token)
            request.state.user = user
        except Exception as e:
            log_error(e, {"path": request.url.path})
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return await call_next(request)

def setup_security_middleware(app):
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Frontend URL
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    # Add security headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Add rate limiting
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=60,
        burst_size=10,
        excluded_paths=["/health", "/metrics"]
    )

    # Add input validation
    app.add_middleware(InputValidationMiddleware)

    # Add authentication
    app.add_middleware(AuthenticationMiddleware) 