from fastapi import APIRouter, Depends
import os
from pydantic import BaseModel

router = APIRouter(
    prefix="/config",
    tags=["config"],
)

class ClientConfig(BaseModel):
    supabase_url: str
    supabase_key: str

@router.get(
    "/client-env",
    response_model=ClientConfig,
    summary="Get client environment variables",
)
async def get_client_env():
    """
    Returns necessary environment variables for client-side use.
    """
    return ClientConfig(
        supabase_url=os.environ.get("SUPABASE_URL", ""),
        supabase_key=os.environ.get("SUPABASE_KEY", "")
    ) 