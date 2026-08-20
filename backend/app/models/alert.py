from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    log_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    user_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    username: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    resource_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    risk_level: Mapped[str] = mapped_column(
        String(50),
        default="LOW",
        nullable=False
    )

    suspicious: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    reasons: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )

    details: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )