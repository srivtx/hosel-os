import sys
import os
sys.path.append(os.getcwd())

from backend.database import engine, Base
from backend.models import MarketplaceItem

# Create the table
print("Migrating marketplace_items table...")
Base.metadata.create_all(bind=engine)
print("Migration complete!")
