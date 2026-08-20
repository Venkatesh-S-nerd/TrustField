from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status
)
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.auth_service import has_permission
from app.services.log_service import create_log


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

security = HTTPBearer()


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get the currently authenticated user from the JWT token.
    """

    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


# ============================================================
# PERMISSION CHECK
# ============================================================

def require_permission(
    action: str,
    resource_type: str
):
    """
    Create a dependency that checks whether the current user
    has a specific permission.

    Every permission attempt is recorded in the activity log.
    """

    def permission_checker(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        allowed = has_permission(
            db,
            current_user.id,
            action,
            resource_type
        )

        # Get client IP address
        ip_address = None

        if request.client:
            ip_address = request.client.host

        # ----------------------------------------------------
        # PERMISSION DENIED
        # ----------------------------------------------------

        if not allowed:

            create_log(
                db=db,
                user_id=current_user.id,
                username=current_user.username,
                action=action.upper(),
                resource_type=resource_type,
                status="denied",
                ip_address=ip_address,
                details=(
                    f"Permission denied for "
                    f"{action} access to {resource_type}"
                )
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Permission denied: "
                    f"{action} access to {resource_type}"
                )
            )

        # ----------------------------------------------------
        # PERMISSION GRANTED
        # ----------------------------------------------------

        create_log(
            db=db,
            user_id=current_user.id,
            username=current_user.username,
            action=action.upper(),
            resource_type=resource_type,
            status="success",
            ip_address=ip_address,
            details=(
                f"User accessed "
                f"{resource_type} using {action} permission"
            )
        )

        return current_user

    return permission_checker


# ============================================================
# USER PROFILE
# ============================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Return the profile of the currently authenticated user.
    """

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "role_id": current_user.role_id
    }


# ============================================================
# TEST PERMISSION
# ============================================================

@router.get("/test-read")
def test_read_users_permission(
    current_user: User = Depends(
        require_permission("read", "users")
    )
):
    """
    Test endpoint for the 'read users' permission.
    """

    return {
        "message": "Access granted",
        "user": current_user.username,
        "permission": "read users"
    }
    
@router.get("/")
def get_all_users(
    db: Session = Depends(get_db)
):
    """
    Retrieve all users with their roles.
    """

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "role_id": user.role_id
        }
        for user in users
    ]   
# ============================================================
# CHANGE USER ROLE
# ============================================================

@router.patch("/{user_id}/role")
def change_user_role(
    user_id: int,
    role_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change the role of another user.

    The current user must have the change_role permission.
    Every successful role change is recorded in the audit log.
    """

    # --------------------------------------------------------
    # Check permission
    # --------------------------------------------------------

    allowed = has_permission(
        db,
        current_user.id,
        "change_role",
        "users"
    )

    ip_address = None

    if request.client:
        ip_address = request.client.host

    if not allowed:

        create_log(
            db=db,
            user_id=current_user.id,
            username=current_user.username,
            action="CHANGE_ROLE",
            resource_type="users",
            status="denied",
            ip_address=ip_address,
            details=(
                f"User attempted to change the role of "
                f"user ID {user_id}"
            )
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to change user roles"
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
    # Find target role
    # --------------------------------------------------------

    from app.models.role import Role

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
    # Prevent unnecessary change
    # --------------------------------------------------------

    if target_user.role_id == role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )

    # --------------------------------------------------------
    # Change role
    # --------------------------------------------------------

    target_user.role_id = role_id

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
        ip_address=ip_address,
        details=(
            f"User '{current_user.username}' changed "
            f"user '{target_user.username}' role "
            f"from '{old_role_name}' "
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