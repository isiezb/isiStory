from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers import story # Import the story router
from routers import config  # Import the new config router
import uvicorn
import logging
import os # Import os for environment variables
from dotenv import load_dotenv # Import dotenv
import pathlib # To work with paths

# Load .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define the path to the public directory (assuming main.py is in the root)
PUBLIC_DIR = pathlib.Path(__file__).parent / "public"
INDEX_HTML = PUBLIC_DIR / "index.html"

app = FastAPI(
    title="EasyStory API & Frontend",
    description="API for generating educational stories using OpenRouter and serving the frontend",
    version="1.0.0",
)

# Configure CORS (Might still be needed if testing locally with different ports, less critical if served from same origin)
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:8080,https://easystory.onrender.com") # Keep frontend URL just in case
origins = [origin.strip() for origin in allowed_origins_str.split(',') if origin.strip()]

logger.info(f"Configuring CORS for origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- API Routers --- 
# API routers should be included BEFORE static files/catch-all
app.include_router(story.router) # Handles /stories/generate
app.include_router(config.router)  # Add the config router

@app.get("/status", tags=["health"])
async def read_status():
    """Check API status"""
    logger.info("Status check requested")
    return {"status": "ok", "message": "API is running"}

# --- Static Files --- 
# Mount the entire public directory to be served at the root
# This will automatically handle requests for /js/app.js, /css/styles.css, etc.
app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="static-root")

# --- Catch-all for SPA --- 
# This should come AFTER API routes and specific static file mounts (if any)
# The StaticFiles mount with html=True might handle this, but adding explicitly for robustness
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_index(full_path: str):
    """Serve index.html for SPA routing"""
    logger.info(f"Catch-all route triggered for path: {full_path}, serving index.html")
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    else:
        # Should not happen if public/index.html exists
        return PlainTextResponse("index.html not found!", status_code=404)

if __name__ == "__main__":
    # Read port from environment variable, default to 8080
    # Render provides PORT, Uvicorn reads it automatically if passed via command line
    port = int(os.getenv("PORT", 8080))
    reload_flag = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    
    logger.info(f"Starting EasyStory combined server on port {port}... Reload: {reload_flag}")
    # Render start command should be: uvicorn main:app --host 0.0.0.0 --port $PORT
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_flag) 