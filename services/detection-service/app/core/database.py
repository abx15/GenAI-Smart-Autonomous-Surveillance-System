import motor.motor_asyncio
import dns.resolver
import os
from app.core.logger import logger

# Override DNS for MongoDB Atlas
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

_client = None

def get_db_client():
    global _client
    if _client is None:
        uri = os.getenv('MONGODB_URI')
        _client = motor.motor_asyncio.AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=10000,
            socketTimeoutMS=45000,
        )
        logger.info("MongoDB motor client initialized")
    return _client

def get_db():
    client = get_db_client()
    return client['sass_db']
