from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"
    chroma_persist_dir: str = str(BASE_DIR / "storage" / "chroma_db")
    parent_store_path: str = str(BASE_DIR / "storage" / "docstore" / "parents.json")
    pdf_path: str = str(BASE_DIR / "data" / "raw" / "니이하마.pdf")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
