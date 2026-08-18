from fastapi import APIRouter, HTTPException

from app.core.vectorstore import ParentStore
from app.models.schemas import SourceDetail

router = APIRouter()


@router.get("/sources/{parent_id}", response_model=SourceDetail)
def get_source(parent_id: str) -> SourceDetail:
    parent = ParentStore().get(parent_id)
    if parent is None:
        raise HTTPException(status_code=404, detail="source not found")
    return SourceDetail(
        parent_id=parent_id,
        category=parent.get("category"),
        heading=parent["heading"],
        text=parent["text"],
        page_start=parent["page_start"],
        page_end=parent["page_end"],
    )
