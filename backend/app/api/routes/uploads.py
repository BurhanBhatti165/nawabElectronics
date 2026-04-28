from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
import cloudinary
import cloudinary.uploader
from urllib.parse import urlparse
from app.core.auth import require_manager_or_admin
from app.core.config import get_settings

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image")
async def upload_product_image(
    file: UploadFile = File(...),
    _: str = Depends(require_manager_or_admin),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    settings = get_settings()
    cloud_name = settings.cloudinary_cloud_name
    api_key = settings.cloudinary_api_key
    api_secret = settings.cloudinary_api_secret

    if settings.cloudinary_url:
        parsed_url = urlparse(settings.cloudinary_url)
        # cloudinary://api_key:api_secret@cloud_name
        cloud_name = parsed_url.hostname or cloud_name
        api_key = parsed_url.username or api_key
        api_secret = parsed_url.password or api_secret

    if not cloud_name or not api_key or not api_secret:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary configuration is missing on server",
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )

    try:
        content = await file.read()
        upload_result = cloudinary.uploader.upload(
            content,
            folder=settings.cloudinary_folder,
            resource_type="image",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(exc)}") from exc
    finally:
        await file.close()

    image_url = upload_result.get("secure_url")
    if not image_url:
        raise HTTPException(status_code=500, detail="Cloudinary did not return image URL")
    return {"url": image_url}
