import os
from pathlib import Path

from dotenv import load_dotenv


# Path to the backend directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Explicitly load backend/.env
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE, override=True)


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    AWS_REGION = os.getenv("AWS_REGION")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


settings = Settings()