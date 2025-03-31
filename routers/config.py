from fastapi import APIRouter, HTTPException
import os
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

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
    # Log environment variable access
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_KEY", "")
    
    # Log what we found (safely)
    if supabase_url:
        logger.info(f"SUPABASE_URL found with length: {len(supabase_url)}")
    else:
        logger.warning("SUPABASE_URL environment variable not found")
        
    if supabase_key:
        logger.info(f"SUPABASE_KEY found with length: {len(supabase_key)}")
    else:
        logger.warning("SUPABASE_KEY environment variable not found")
    
    # Print all environment variables (for debugging)
    logger.debug("Environment variables:")
    for key, value in os.environ.items():
        if key.startswith("SUPABASE"):
            # Safely log only the first few characters of sensitive values
            safe_value = f"{value[:5]}...{len(value)}" if value else "(empty)"
            logger.debug(f"  {key}: {safe_value}")
    
    # Construct response
    config = ClientConfig(
        supabase_url=supabase_url,
        supabase_key=supabase_key
    )
    
    if not supabase_url or not supabase_key:
        logger.error("Missing Supabase credentials. Client will fall back to mock mode.")
    
    return config 