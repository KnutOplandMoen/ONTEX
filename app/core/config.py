import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "password"
    ENVIRONMENT: str = "local"  # local, staging, production

    model_config = SettingsConfigDict(
        env_file=get_env_file(),
        env_ignore_empty=True, 
        extra="ignore"
    )

def get_env_file() -> str:
    """Determine which .env file to load based on environment"""
    env = os.getenv("ENVIRONMENT", "local")
    
    if env == "railway" or env == "production":
        return ".env.railway"
    return ".env.local"

settings = Settings()

