import sys
import os
# Add the parent directory (project root) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from backend.models import MarketplaceItem

# Create the table
print("Migrating marketplace_items table...")
Base.metadata.create_all(bind=engine)
print("Migration complete!")
