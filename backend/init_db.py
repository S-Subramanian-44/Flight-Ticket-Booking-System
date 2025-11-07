from database import engine, Base

# --- IMPORT ALL MODELS HERE ---
# This is the crucial step. By importing the models,
# we ensure they register themselves with the 'Base' metadata.
import models 

print("Initializing database...")
try:
    # This will now create all tables, including 'users'
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
except Exception as e:
    print(f"An error occurred: {e}")