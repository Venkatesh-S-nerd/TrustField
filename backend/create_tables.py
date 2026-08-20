from app.core.database import engine, Base

# Import all models so SQLAlchemy knows about every table
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.resource import Resource
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.log import Log


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")