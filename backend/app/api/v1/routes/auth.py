"""
SwarLipi AI — Auth API Route
User registration, login, and SSO callback handling.
"""

import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models import User
from app.schemas.user import (
    SSOCallbackData,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Register a new user with email/password."""
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=user_data.email,
        display_name=user_data.display_name or user_data.email.split("@")[0],
        hashed_password=hash_password(user_data.password),
        auth_provider="local",
    )
    db.add(user)
    await db.commit()

    # Generate token
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        settings=settings,
    )

    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email/password",
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Authenticate with email and password."""
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        settings=settings,
    )

    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/sso/callback",
    response_model=TokenResponse,
    summary="SSO callback handler",
)
async def sso_callback(
    sso_data: SSOCallbackData,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Handle SSO provider callback (Google/GitHub).

    Creates user if not exists, otherwise logs them in.
    """
    # Look for existing user by provider ID or email
    result = await db.execute(
        select(User).where(
            (User.auth_provider == sso_data.provider)
            & (User.auth_provider_id == sso_data.provider_user_id)
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # Check by email
        result = await db.execute(
            select(User).where(User.email == sso_data.email)
        )
        user = result.scalar_one_or_none()

    if not user:
        # Create new user from SSO
        user = User(
            email=sso_data.email,
            display_name=sso_data.display_name or sso_data.email.split("@")[0],
            avatar_url=sso_data.avatar_url,
            auth_provider=sso_data.provider,
            auth_provider_id=sso_data.provider_user_id,
        )
        db.add(user)
        await db.commit()
    else:
        # Update existing user with SSO info
        user.auth_provider = sso_data.provider
        user.auth_provider_id = sso_data.provider_user_id
        if sso_data.avatar_url:
            user.avatar_url = sso_data.avatar_url
        await db.commit()

    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        settings=settings,
    )

    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )
