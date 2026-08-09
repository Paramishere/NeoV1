"""
NEO — Backend Utilities
=========================
Shared helper functions used across the backend.
"""
import uuid
from datetime import datetime
from typing import Any, Dict


def generate_id() -> str:
    """Generate a unique session/correlation ID."""
    return str(uuid.uuid4())


def now_iso() -> str:
    """Return current UTC time as ISO string."""
    return datetime.utcnow().isoformat()


def sanitize_string(value: str, max_length: int = 10000) -> str:
    """Basic input sanitization — truncate and strip."""
    return value.strip()[:max_length]


def safe_dict_get(d: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get a key from a dict."""
    return d.get(key, default)
