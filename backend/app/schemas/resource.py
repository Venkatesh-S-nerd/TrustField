from pydantic import BaseModel, ConfigDict


class ResourceBase(BaseModel):
    name: str
    resource_type: str
    provider: str
    external_id: str | None = None


class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)