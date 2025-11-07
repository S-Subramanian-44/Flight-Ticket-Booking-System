import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, UTC, timedelta

# --- Imports ---
from main import app, get_db
from database import Base
import models
import auth 

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the `get_db` dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# --- Fixtures ---

@pytest.fixture(scope="session")
def client():
    """A TestClient that runs once for the whole session."""
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def db_session():
    """A clean database session for each test function."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def test_user(db_session):
    """Creates and returns a standard user."""
    user = models.User(
        email="testuser@example.com",
        hashed_password=auth.get_password_hash("password123"),
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def admin_user(db_session):
    """Creates and returns an admin user."""
    user = models.User(
        email="admin@example.com",
        hashed_password=auth.get_password_hash("adminpass123"),
        is_admin=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def get_auth_headers(client, email, password):
    """Helper function to log in and get auth headers."""
    response = client.post("/users/login", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# --- Test Cases ---

# --- User & Auth Tests (Unchanged) ---
def test_register_user(client, db_session):
    response = client.post("/users/register", json={
        "email": "newuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["is_admin"] == False

def test_register_admin_user(client, db_session):
    response = client.post("/users/register", json={
        "email": "newadmin@example.com",
        "password": "password123",
        "admin_secret": auth.ADMIN_REGISTRATION_SECRET
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newadmin@example.com"
    assert data["is_admin"] == True

def test_register_admin_user_wrong_secret(client, db_session):
    response = client.post("/users/register", json={
        "email": "fakeadmin@example.com",
        "password": "password123",
        "admin_secret": "wrong-secret"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid admin secret"

def test_login(client, test_user):
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    assert headers["Authorization"] is not None

def test_get_users_me(client, test_user):
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

# --- Flight Tests (MODIFIED) ---
def test_add_flight_admin(client, admin_user):
    headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    
    # --- MODIFIED: Added arrival_time ---
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time + timedelta(hours=3)
    
    flight_data = {
        "flight_number": "BA249", "airline": "British Airways", "departure": "LHR",
        "destination": "JFK", "departure_time": dep_time.isoformat(), 
        "arrival_time": arr_time.isoformat(), "total_seats": 100
    }
    response = client.post("/flights/", json=flight_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["flight_number"] == "BA249"

def test_add_flight_invalid_arrival_time(client, admin_user):
    """ NEW: Test that arrival time must be after departure time. """
    headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time - timedelta(hours=3) # <-- Invalid (before departure)
    
    flight_data = {
        "flight_number": "ERR001", "airline": "Error Air", "departure": "A",
        "destination": "B", "departure_time": dep_time.isoformat(), 
        "arrival_time": arr_time.isoformat(), "total_seats": 100
    }
    response = client.post("/flights/", json=flight_data, headers=headers)
    assert response.status_code == 422 # Validation Error
    assert "Arrival time must be after departure time" in response.json()["detail"][0]["msg"]


def test_add_flight_user_unauthorized(client, test_user):
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    
    # --- MODIFIED: Added arrival_time ---
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time + timedelta(hours=3)

    flight_data = {
        "flight_number": "BA249", "airline": "British Airways", "departure": "LHR",
        "destination": "JFK", "departure_time": dep_time.isoformat(), 
        "arrival_time": arr_time.isoformat(), "total_seats": 100
    }
    response = client.post("/flights/", json=flight_data, headers=headers)
    assert response.status_code == 403 # 403 Forbidden

def test_delete_flight_admin(client, admin_user, db_session):
    # 1. Admin adds a flight
    admin_headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    
    # --- MODIFIED: Added arrival_time ---
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time + timedelta(hours=3)
    
    flight_data = {
        "flight_number": "DEL123", "airline": "To Delete", "departure": "A",
        "destination": "B", "departure_time": dep_time.isoformat(), 
        "arrival_time": arr_time.isoformat(), "total_seats": 1
    }
    response = client.post("/flights/", json=flight_data, headers=admin_headers)
    flight_id = response.json()["id"]
    
    # 2. Admin deletes it
    response = client.delete(f"/flights/{flight_id}", headers=admin_headers)
    assert response.status_code == 204
    
    # 3. Verify it's gone
    db_flight = db_session.query(models.Flight).filter(models.Flight.id == flight_id).first()
    assert db_flight is None

def test_delete_flight_user_unauthorized(client, test_user, db_session, admin_user):
    # 1. Admin adds a flight
    admin_headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    
    # --- MODIFIED: Added arrival_time ---
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time + timedelta(hours=3)
    
    flight_data = {
        "flight_number": "DEL123", "airline": "To Delete", "departure": "A",
        "destination": "B", "departure_time": dep_time.isoformat(), 
        "arrival_time": arr_time.isoformat(), "total_seats": 1
    }
    response = client.post("/flights/", json=flight_data, headers=admin_headers)
    flight_id = response.json()["id"]

    # 2. Regular user tries to delete it
    user_headers = get_auth_headers(client, "testuser@example.com", "password123")
    response = client.delete(f"/flights/{flight_id}", headers=user_headers)
    assert response.status_code == 403

# --- Booking Tests (MODIFIED) ---

@pytest.fixture(scope="function")
def test_flight(db_session):
    """Creates a flight for booking tests."""
    dep_time = datetime.now(UTC) + timedelta(days=1)
    arr_time = dep_time + timedelta(hours=3)
    
    flight = models.Flight(
        flight_number="LH456", airline="Lufthansa", departure="FRA", destination="LAX",
        departure_time=dep_time, 
        arrival_time=arr_time, # <-- MODIFIED
        total_seats=5, available_seats=5
    )
    db_session.add(flight)
    db_session.commit()
    db_session.refresh(flight)
    return flight

def test_user_book_ticket(client, test_user, test_flight):
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    
    # --- MODIFIED: Use valid passport number ---
    booking_data = {"passenger_name": "Test User", "passport_number": "P123456"}
    
    response = client.post(f"/flights/{test_flight.id}/book", json=booking_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["passenger_name"] == "Test User"
    assert data["user_id"] == test_user.id

def test_book_ticket_invalid_passport(client, test_user, test_flight):
    """ NEW: Test passport regex validation. """
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    
    # --- MODIFIED: Use *invalid* passport number ---
    booking_data = {"passenger_name": "Test User", "passport_number": "123456"} # Fails regex
    
    response = client.post(f"/flights/{test_flight.id}/book", json=booking_data, headers=headers)
    assert response.status_code == 422 # Validation Error
    assert "String should match pattern" in response.json()["detail"][0]["msg"]

def test_user_cancel_own_booking(client, test_user, test_flight, db_session):
    headers = get_auth_headers(client, "testuser@example.com", "password123")
    
    # 1. Book the ticket
    # --- MODIFIED: Use valid passport number ---
    booking_data = {"passenger_name": "Test User", "passport_number": "P123456"}
    response = client.post(f"/flights/{test_flight.id}/book", json=booking_data, headers=headers)
    booking_id = response.json()["id"]
    
    # 2. Cancel the ticket
    response = client.delete(f"/bookings/{booking_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Canceled"

def test_user_cancel_other_booking_unauthorized(client, test_user, admin_user, test_flight, db_session):
    # 1. Admin books a ticket
    admin_headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    # --- MODIFIED: Use valid passport number ---
    booking_data = {"passenger_name": "Admin User", "passport_number": "A123456"}
    response = client.post(f"/flights/{test_flight.id}/book", json=booking_data, headers=admin_headers)
    booking_id = response.json()["id"]
    
    # 2. Regular user tries to cancel it
    user_headers = get_auth_headers(client, "testuser@example.com", "password123")
    response = client.delete(f"/bookings/{booking_id}", headers=user_headers)
    assert response.status_code == 403 # Forbidden

def test_admin_cancel_other_booking_authorized(client, test_user, admin_user, test_flight, db_session):
    # 1. Regular user books a ticket
    user_headers = get_auth_headers(client, "testuser@example.com", "password123")
    # --- MODIFIED: Use valid passport number ---
    booking_data = {"passenger_name": "Test User", "passport_number": "P123456"}
    response = client.post(f"/flights/{test_flight.id}/book", json=booking_data, headers=user_headers)
    booking_id = response.json()["id"]
    
    # 2. Admin user cancels it
    admin_headers = get_auth_headers(client, "admin@example.com", "adminpass123")
    response = client.delete(f"/bookings/{booking_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Canceled"