"""
Script to create name_change_requests table.

Run this script to add the name change requests table to the database.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from backend.models.user import User
from backend.models.report import Report
from backend.models.name_change_request import NameChangeRequest

def create_tables():
    """Create all tables in the database."""
    print("Creating name_change_requests table...")
    Base.metadata.create_all(bind=engine)
    print("Table created successfully!")

if __name__ == "__main__":
    create_tables()
