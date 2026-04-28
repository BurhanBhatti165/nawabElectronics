import uvicorn
from app.core.config import get_settings

settings = get_settings()

if __name__ == "__main__":
    print(f"🚀 Starting {settings.app_name} on http://0.0.0.0:8000")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.app_env == "development" else False
    )
