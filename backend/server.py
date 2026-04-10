from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from database import client
from routes import admin, queue, songs, spotify, analytics
import os
import logging

app = FastAPI()

# Include route modules
app.include_router(admin.router)
app.include_router(queue.router)
app.include_router(songs.router)
app.include_router(spotify.router)
app.include_router(analytics.router)


@app.get("/api/")
async def root():
    return {"message": "QueueIt API"}


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
