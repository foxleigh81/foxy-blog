import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SANITY_PROJECT_ID = os.getenv('SANITY_PROJECT_ID')
    SANITY_DATASET = os.getenv('SANITY_DATASET')