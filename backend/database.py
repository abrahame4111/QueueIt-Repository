from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def save_spotify_token(admin_token, token_data):
    await db.spotify_tokens.update_one(
        {"admin_token": admin_token},
        {"$set": {
            "admin_token": admin_token,
            "access_token": token_data['access_token'],
            "refresh_token": token_data.get('refresh_token'),
            "expires_at": token_data['expires_at'],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )


async def get_spotify_token(admin_token):
    token_doc = await db.spotify_tokens.find_one({"admin_token": admin_token})
    if token_doc:
        return {
            'access_token': token_doc['access_token'],
            'refresh_token': token_doc.get('refresh_token'),
            'expires_at': token_doc['expires_at']
        }
    return None
