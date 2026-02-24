"""FastAPI auth dependencies."""

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import decode_access_token
from src.database.connection import get_db_session
from src.database.models import User

security = HTTPBearer(auto_error=False)
AUTH_COOKIE_KEY = "sds_at"


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: AsyncSession = Depends(get_db_session),
) -> User:
    """Return current user by bearer token or auth cookie."""
    candidate_tokens: list[str] = []

    if credentials and credentials.credentials:
        candidate_tokens.append(credentials.credentials.strip())

    cookie_token = (request.cookies.get(AUTH_COOKIE_KEY) or "").strip()
    if cookie_token:
        candidate_tokens.append(cookie_token)

    payload = None
    for token in candidate_tokens:
        if not token:
            continue
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            break

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    login = payload["sub"]
    result = await session.execute(select(User).where(User.login == login))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.status and user.status.lower() != "активен":
        raise HTTPException(status_code=403, detail="User is not active")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if (user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
