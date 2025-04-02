import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import Request
from sentry_sdk import capture_exception, capture_message

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
            
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Console handler with JSON formatting
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    return logger

def log_request(request: Request, response: Any, duration: float) -> None:
    log_data = {
        'method': request.method,
        'url': str(request.url),
        'status_code': response.status_code,
        'duration_ms': round(duration * 1000, 2),
        'client_ip': request.client.host if request.client else None,
        'user_agent': request.headers.get('user-agent'),
    }
    
    logger = logging.getLogger('api')
    logger.info('Request completed', extra=log_data)
    
    # Log to Sentry if there's an error
    if response.status_code >= 400:
        capture_message(
            f"API Error: {request.method} {request.url}",
            level='error',
            extra=log_data
        )

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    logger = logging.getLogger('api')
    error_data = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        **(context or {})
    }
    logger.error('Error occurred', extra=error_data)
    capture_exception(error, extra=context)

def log_performance(metric: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
    logger = logging.getLogger('performance')
    log_data = {
        'metric': metric,
        'value': value,
        **(tags or {})
    }
    logger.info('Performance metric', extra=log_data)
    capture_message(
        f"Performance: {metric}",
        level='info',
        extra=log_data
    ) 