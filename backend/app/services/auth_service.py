from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission


def get_user_by_id(
    db: Session,
    user_id: int
) -> User | None:
    """
    Retrieve a user by their database ID.
    """
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_role(
    db: Session,
    user_id: int
) -> Role | None:
    """
    Retrieve the role assigned to a user.
    """
    user = get_user_by_id(db, user_id)

    if not user:
        return None

    return user.role


def get_user_permissions(
    db: Session,
    user_id: int
) -> list[Permission]:
    """
    Retrieve all permissions assigned to a user's role.
    """
    role = get_user_role(db, user_id)

    if not role:
        return []

    return (
        db.query(Permission)
        .filter(Permission.role_id == role.id)
        .all()
    )


def has_permission(
    db: Session,
    user_id: int,
    action: str,
    resource_type: str
) -> bool:
    """
    Check whether a user has permission to perform
    an action on a specific resource type.
    """

    permissions = get_user_permissions(
        db,
        user_id
    )

    for permission in permissions:
        if (
            permission.action.lower() == action.lower()
            and
            permission.resource_type.lower() == resource_type.lower()
        ):
            return True

    return False