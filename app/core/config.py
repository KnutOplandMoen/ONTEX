from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str = "sk-proj-1234567890"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "password"

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_ignore_empty=True, 
        extra="ignore"
    )

settings = Settings()

