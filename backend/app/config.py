import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finora Personal Finance API"
    VERSION: str = "1.2.1"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL connection string
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/finora_db"
    )
    
    # Mandatory JWT Secret Key (no hardcoded fallback)
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    DEFAULT_CURRENCY: str = "INR"
    
    # Explicit Allowed CORS Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://usefinora.netlify.app"
    ]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("FATAL STARTUP ERROR: JWT_SECRET environment variable is empty. A valid secret key is required.")
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

try:
    settings = Settings()
except Exception as err:
    raise RuntimeError(
        "FATAL STARTUP ERROR: Mandatory environment variable 'JWT_SECRET' is missing or unconfigured. "
        "The application cannot start without JWT_SECRET set in the environment or .env file."
    ) from err
