from fastapi import APIRouter

from app.core.categories import list_categories
from app.models.schemas import CategoryItem

router = APIRouter()


@router.get("/categories", response_model=list[CategoryItem])
def get_categories() -> list[CategoryItem]:
    return [CategoryItem(**c) for c in list_categories()]
