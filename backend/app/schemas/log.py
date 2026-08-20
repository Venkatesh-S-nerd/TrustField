from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LogBase(BaseModel):
    event_type: str
    username: str | None = None
    resource: str | None = None
    action: str | None = None
    timestamp: datetime


class LogCreate(LogBase):
    pass


class LogResponse(LogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)