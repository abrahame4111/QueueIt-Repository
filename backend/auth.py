from fastapi import Header, HTTPException
from typing import Optional
from database import db
import os


async def get_admin_password():
    settings = await db.settings.find_one({"key": "admin_password"})
    if settings:
        return settings["value"]
    return os.environ.get('ADMIN_PASSWORD', 'hostel2024')


async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    admin_password = await get_admin_password()
    if token != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True
