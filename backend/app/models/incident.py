from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="LOW"
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="OPEN"
    )

    user_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    log_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )