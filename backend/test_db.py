from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("\n================================")
        print("DATABASE CONNECTION SUCCESSFUL")
        print("================================")
        print(result.fetchone()[0])

except Exception as e:
    print("\n================================")
    print("DATABASE CONNECTION FAILED")
    print("================================")
    print(e)