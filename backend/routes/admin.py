from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from models import AdminLogin, AdminResponse, ChangePasswordRequest, VenueSettingsUpdate
from database import db
from auth import verify_admin, get_admin_password
import os
import httpx

router = APIRouter(prefix="/api")

# Download files config - update these URLs when moving to GitHub Releases
DOWNLOAD_FILES = {
    "windows": {
        "url": os.environ.get("WINDOWS_DOWNLOAD_URL", "https://github.com/abrahame4111/QueueIt-Repository/releases/download/v1.0.0/QueueIt.Setup.v1.0.0.exe"),
        "filename": "queueit_setup.exe",
        "content_type": "application/octet-stream",
    },
    "mac": {
        "url": os.environ.get("MAC_DOWNLOAD_URL", "https://github.com/abrahame4111/QueueIt-Repository/releases/download/v1.0.0/QueueIt.Setup.v1.0.0.dmg"),
        "filename": "queueit_setup.dmg",
        "content_type": "application/octet-stream",
    },
}


@router.get("/download/{platform}")
async def download_installer(platform: str):
    file_info = DOWNLOAD_FILES.get(platform)
    if not file_info:
        raise HTTPException(status_code=404, detail="Platform not found. Use 'windows' or 'mac'.")

    async def stream_file():
        async with httpx.AsyncClient(follow_redirects=True, timeout=httpx.Timeout(60.0, connect=30.0)) as client:
            async with client.stream("GET", file_info["url"]) as response:
                if response.status_code != 200:
                    raise HTTPException(status_code=502, detail="Failed to fetch installer from source")
                async for chunk in response.aiter_bytes(chunk_size=65536):
                    yield chunk

    try:
        return StreamingResponse(
            stream_file(),
            media_type=file_info["content_type"],
            headers={
                "Content-Disposition": f'attachment; filename="{file_info["filename"]}"',
                "Cache-Control": "public, max-age=86400",
            },
        )
    except Exception:
        raise HTTPException(status_code=502, detail="Download failed. Please try again.")


@router.post("/admin/login", response_model=AdminResponse)
async def admin_login(credentials: AdminLogin):
    admin_password = await get_admin_password()
    if credentials.password == admin_password:
        return AdminResponse(success=True, token=admin_password)
    else:
        raise HTTPException(status_code=401, detail="Invalid password")


@router.post("/admin/change-password")
async def change_password(req: ChangePasswordRequest, admin: bool = Depends(verify_admin)):
    current_pw = await get_admin_password()
    if req.current_password != current_pw:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.settings.update_one(
        {"key": "admin_password"},
        {"$set": {"key": "admin_password", "value": req.new_password}},
        upsert=True
    )
    return {"success": True, "token": req.new_password}


@router.get("/admin/settings")
async def get_settings(admin: bool = Depends(verify_admin)):
    venue = await db.settings.find_one({"key": "venue_name"})
    return {
        "venue_name": venue["value"] if venue else "",
        "version": "1.0.0"
    }


@router.put("/admin/settings")
async def update_settings(req: VenueSettingsUpdate, admin: bool = Depends(verify_admin)):
    if req.venue_name is not None:
        await db.settings.update_one(
            {"key": "venue_name"},
            {"$set": {"key": "venue_name", "value": req.venue_name}},
            upsert=True
        )
    return {"success": True}
