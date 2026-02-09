"""
Зависимости FastAPI: текущий пользователь из JWT, проверка роли admin.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import User
from src.core.security import decode_access_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: AsyncSession = Depends(get_db_session),
) -> User:
    """Текущий пользователь из Bearer JWT. Иначе 401."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
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
    """Только роль admin. Иначе 403."""
    if (user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
