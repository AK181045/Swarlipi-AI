"""
SwarLipi AI — Pydantic Schemas for User & Auth
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import SubscriptionTier


class UserCreate(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str | None = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Request body for local login."""

    email: EmailStr
    password: str


class SSOCallbackData(BaseModel):
    """Data received from SSO provider callback."""

    provider: str  # "google" | "github"
    provider_user_id: str
    email: str
    display_name: str | None = None
    avatar_url: str | None = None


class UserResponse(BaseModel):
    """Serialized user for API responses."""

    id: uuid.UUID
    email: str
    display_name: str | None = None
    avatar_url: str | None = None
    subscription_tier: SubscriptionTier
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Expiration time in seconds")
    user: UserResponse
