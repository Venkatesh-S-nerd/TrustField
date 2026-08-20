from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleResponse
from app.routes.users import get_current_user
from app.services.log_service import create_log


router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


# ============================================================
# CREATE ROLE
# ============================================================

@router.post(
    "/",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new role.
    """

    existing_role = (
        db.query(Role)
        .filter(Role.name == role_data.name)
        .first()
    )

    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists"
        )

    new_role = Role(
        name=role_data.name,
        description=role_data.description
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return new_role


# ============================================================
# GET ALL ROLES
# ============================================================

@router.get(
    "/",
    response_model=list[RoleResponse]
)
def get_roles(
    db: Session = Depends(get_db)
):
    """
    Retrieve all roles.
    """

    return db.query(Role).all()


# ============================================================
# GET SINGLE ROLE
# ============================================================

@router.get(
    "/{role_id}",
    response_model=RoleResponse
)
def get_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a role by ID.
    """

    role = (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    return role


# ============================================================
# ASSIGN ROLE TO USER
# ============================================================

@router.patch(
    "/users/{user_id}/role"
)
def assign_role_to_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign a role to a user.

    Only an active administrator can perform this operation.
    Every role change is recorded as a security log.
    """

    # --------------------------------------------------------
    # Verify current user is an administrator
    # --------------------------------------------------------

    if not current_user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user has no assigned role"
        )

    if current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can change user roles"
        )

    # --------------------------------------------------------
    # Find target user
    # --------------------------------------------------------

    target_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )

    # --------------------------------------------------------
    # Find new role
    # --------------------------------------------------------

    new_role = (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )

    if not new_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    # --------------------------------------------------------
    # Capture old role
    # --------------------------------------------------------

    old_role = target_user.role

    old_role_name = (
        old_role.name
        if old_role
        else "None"
    )

    # --------------------------------------------------------
    # Prevent unnecessary role changes
    # --------------------------------------------------------

    if target_user.role_id == new_role.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )

    # --------------------------------------------------------
    # Change role
    # --------------------------------------------------------

    target_user.role_id = new_role.id

    db.commit()
    db.refresh(target_user)

    # --------------------------------------------------------
    # Create security log
    # --------------------------------------------------------

    create_log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="CHANGE_ROLE",
        resource_type="roles",
        resource_id=str(target_user.id),
        status="success",
        details=(
            f"Admin changed user '{target_user.username}' "
            f"role from '{old_role_name}' "
            f"to '{new_role.name}'"
        )
    )

    return {
        "message": "User role changed successfully",
        "target_user": target_user.username,
        "old_role": old_role_name,
        "new_role": new_role.name,
        "changed_by": current_user.username
    }


# ============================================================
# DELETE ROLE
# ============================================================

@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a role.
    """

    role = (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    db.delete(role)
    db.commit()

    return None