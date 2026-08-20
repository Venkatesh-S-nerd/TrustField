from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentBase(BaseModel):
    title: str
    description: str | None = None
    severity: str = "LOW"
    status: str = "OPEN"
    user_id: int | None = None


class IncidentCreate(IncidentBase):
    log_id: int | None = None


class IncidentResponse(IncidentBase):
    id: int
    log_id: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)