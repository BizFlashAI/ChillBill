import logging

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

# Initialize Firebase Admin with just the project ID (no service account needed
# for token verification — it downloads Google's public keys automatically)
if not firebase_admin._apps:
    firebase_admin.initialize_app(
        options={"projectId": "chillbill-d6cb2"}
    )

security = HTTPBearer(auto_error=False)


async def get_current_user(
    cred: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Verify Firebase ID token and return the decoded claims."""
    if cred is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )

    try:
        decoded = auth.verify_id_token(cred.credentials)
        return decoded
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as e:
        logger.error("Token verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )


async def get_optional_user(
    cred: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """Optionally verify Firebase ID token. Returns None if no token provided."""
    if cred is None:
        return None
    try:
        return auth.verify_id_token(cred.credentials)
    except Exception:
        return None
