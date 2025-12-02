from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.config import settings

# Async MongoDB client for FastAPI
motor_client = None
database = None


async def connect_to_mongo():
    global motor_client, database
    motor_client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = motor_client[settings.DATABASE_NAME]

    # Create indexes
    await database.articles.create_index("article_id", unique=True)
    await database.articles.create_index("keywords")
    await database.jobs.create_index("job_id", unique=True)

    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    global motor_client
    if motor_client:
        motor_client.close()
        print("MongoDB connection closed")


def get_database():
    return database
