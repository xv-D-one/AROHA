import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    """Centralized configuration pulled from environment variables.

    Keep PHI-related secrets (Mongo/S3/JWT) out of source control. In production
    these should come from your secret manager (AWS Secrets Manager, Vault, etc.).
    """

    # MongoDB / Atlas
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "aroha")

    # AWS S3 / R2
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str | None = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str | None = os.getenv("AWS_SECRET_ACCESS_KEY")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "aroha-reports")
    S3_ENDPOINT_URL: str | None = os.getenv("S3_ENDPOINT_URL")  # allow R2/MinIO

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me")
    JWT_ALG: str = os.getenv("JWT_ALG", "HS256")
    JWT_EXPIRE_SECONDS: int = int(os.getenv("JWT_EXPIRE_SECONDS", "3600"))
    SIGNED_URL_TTL_SECONDS: int = int(os.getenv("SIGNED_URL_TTL_SECONDS", "900"))

    # Queue (optional; Redis URI or similar)
    QUEUE_URL: str | None = os.getenv("QUEUE_URL")


settings = Settings()
