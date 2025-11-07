import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, UTC # <-- UPDATED for warnings

# --- Imports: Now they will work! ---
from main import app, get_db
from database import Base
import models
# ------------------------------------

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the `get_db` dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Fixture to create a new database for each test function
@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine) # Drop tables first
    Base.metadata.create_all(bind=engine) # Create tables
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fixture for the test client
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Test Cases ---

def test_add_flight(client, db_session):
    """Test adding a new flight."""
    flight_data = {
        "flight_number": "BA249",
        "airline": "British Airways",
        "departure": "LHR",
        "destination": "JFK",
        "departure_time": datetime.now(UTC).isoformat(), # <-- UPDATED for warnings
        "total_seats": 100
    }
    response = client.post("/flights/", json=flight_data)
    assert response.status_code == 201
    data = response.json()
    assert data["flight_number"] == "BA249"
    assert data["available_seats"] == 100
    assert data["total_seats"] == 100

def test_add_flight_invalid_seats(client):
    """Test adding a flight with 0 seats."""
    flight_data = {
        "flight_number": "AF006",
        "airline": "Air France",
        "departure": "CDG",
        "destination": "SFO",
        "departure_time": datetime.now(UTC).isoformat(), # <-- UPDATED for warnings
        "total_seats": 0  # Invalid
    }
    response = client.post("/flights/", json=flight_data)
    assert response.status_code == 422 # Pydantic validation error

def test_book_ticket(client, db_session):
    """Test successfully booking a ticket."""
    # 1. Add a flight
    flight = models.Flight(
        flight_number="LH456", airline="Lufthansa", departure="FRA", destination="LAX",
        departure_time=datetime.now(UTC), total_seats=5, available_seats=5 # <-- UPDATED for warnings
    )
    db_session.add(flight)
    db_session.commit()
    db_session.refresh(flight)

    # 2. Book a ticket
    booking_data = {"passenger_name": "Test User", "passport_number": "X12345"}
    response = client.post(f"/flights/{flight.id}/book", json=booking_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["passenger_name"] == "Test User"
    assert data["status"] == "Booked"
    
    # 3. Verify available seats decreased
    db_flight = db_session.query(models.Flight).filter(models.Flight.id == flight.id).first()
    
    # --- THIS IS THE FIX ---
    # Force the session to read the changes from the DB file
    db_session.refresh(db_flight)
    # -----------------------
    
    assert db_flight.available_seats == 4

def test_prevent_overbooking(client, db_session):
    """Test that booking fails when no seats are available."""
    # 1. Add a flight with 0 available seats
    flight = models.Flight(
        flight_number="UA101", airline="United", departure="EWR", destination="SFO",
        departure_time=datetime.now(UTC), total_seats=1, available_seats=0 # <-- UPDATED for warnings
    )
    db_session.add(flight)
    db_session.commit()
    db_session.refresh(flight)

    # 2. Attempt to book
    booking_data = {"passenger_name": "Late Comer", "passport_number": "Y98765"}
    response = client.post(f"/flights/{flight.id}/book", json=booking_data)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "No available seats on this flight"

def test_prevent_duplicate_passport(client, db_session):
    """Test that a passport can't be used twice for the *same* flight."""
    # 1. Add flight
    flight = models.Flight(
        flight_number="EK201", airline="Emirates", departure="DXB", destination="JFK",
        departure_time=datetime.now(UTC), total_seats=10, available_seats=10 # <-- UPDATED for warnings
    )
    db_session.add(flight)
    db_session.commit()
    db_session.refresh(flight)

    # 2. First booking
    booking_data = {"passenger_name": "John Doe", "passport_number": "Z55555"}
    response1 = client.post(f"/flights/{flight.id}/book", json=booking_data)
    assert response1.status_code == 201

    # 3. Second booking with same passport
    booking_data_dup = {"passenger_name": "John Doe", "passport_number": "Z55555"}
    response2 = client.post(f"/flights/{flight.id}/book", json=booking_data_dup)
    
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Passport number already registered for this flight"

def test_cancel_booking(client, db_session):
    """Test canceling a booking and verifying seat increment."""
    # 1. Add flight and booking
    flight = models.Flight(
        flight_number="SQ33", airline="Singapore Airlines", departure="SIN", destination="LAX",
        departure_time=datetime.now(UTC), total_seats=2, available_seats=1 # <-- UPDATED for warnings
    )
    booking = models.Booking(
        passenger_name="Cancel User", passport_number="C4433", flight=flight, status="Booked"
    )
    db_session.add(flight)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(flight)
    db_session.refresh(booking)

    assert flight.available_seats == 1

    # 2. Cancel the booking
    response = client.delete(f"/bookings/{booking.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Canceled"
    
    # 3. Verify seat count is restored
    db_flight = db_session.query(models.Flight).filter(models.Flight.id == flight.id).first()
    
    # --- THIS IS THE FIX ---
    # Force the session to read the changes from the DB file
    db_session.refresh(db_flight)
    # -----------------------
    
    assert db_flight.available_seats == 2