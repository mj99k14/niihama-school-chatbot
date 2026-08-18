from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.config import settings
from app.models.schemas import DocumentInfo

router = APIRouter()


@router.get("/document/info", response_model=DocumentInfo)
def document_info() -> DocumentInfo:
    path = Path(settings.pdf_path)
    updated_at = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).date().isoformat()
    return DocumentInfo(filename=path.name, updated_at=updated_at, download_url="/document/download")


@router.get("/document/download")
def document_download() -> FileResponse:
    path = Path(settings.pdf_path)
    return FileResponse(path, media_type="application/pdf", filename=path.name)
