from pydantic import BaseModel, ConfigDict


class PermissionBase(BaseModel):
    name: str
    action: str
    resource_type: str
    role_id: int


class PermissionCreate(PermissionBase):
    pass


class PermissionResponse(PermissionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)