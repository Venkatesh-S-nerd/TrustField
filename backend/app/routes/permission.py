from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.permission import Permission
from app.models.role import Role
from app.schemas.permission import (
    PermissionCreate,
    PermissionResponse
)


router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"]
)


@router.post(
    "/",
    response_model=PermissionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db)
):
    # Check if role exists
    role = (
        db.query(Role)
        .filter(Role.id == permission_data.role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    # Create permission
    new_permission = Permission(
        name=permission_data.name,
        action=permission_data.action,
        resource_type=permission_data.resource_type,
        role_id=permission_data.role_id
    )

    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)

    return new_permission


@router.get(
    "/",
    response_model=list[PermissionResponse]
)
def get_permissions(
    db: Session = Depends(get_db)
):
    return db.query(Permission).all()


@router.get(
    "/{permission_id}",
    response_model=PermissionResponse
)
def get_permission(
    permission_id: int,
    db: Session = Depends(get_db)
):
    permission = (
        db.query(Permission)
        .filter(Permission.id == permission_id)
        .first()
    )

    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )

    return permission


@router.delete(
    "/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db)
):
    permission = (
        db.query(Permission)
        .filter(Permission.id == permission_id)
        .first()
    )

    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )

    db.delete(permission)
    db.commit()

    return None