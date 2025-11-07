from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

import models
import schemas
import database
import auth

app = FastAPI(
    title="Flight Booking API",
    description="API for booking and managing flight tickets.",
    version="1.0.0"
)

get_db = database.get_db

# --- 👤 User and Auth Endpoints (Modified) ---

@app.post("/users/register", response_model=schemas.UserResponse, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    If a valid 'admin_secret' is provided, the user is created as an admin.
    """
    db_user = auth.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if admin secret is correct
    is_admin = False
    if user.admin_secret:
        if user.admin_secret == auth.ADMIN_REGISTRATION_SECRET:
            is_admin = True
        else:
            # Don't let them know the secret is just wrong, just fail
            raise HTTPException(status_code=400, detail="Invalid admin secret")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password, 
        is_admin=is_admin # <-- Set admin status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/users/login", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Log in a user and return a JWT access token and their admin status.
    """
    user = auth.get_user(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    # --- Add user_id and is_admin to the token ---
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id, "is_admin": user.is_admin}, 
        expires_delta=access_token_expires
    )
    # --- Return admin status to the frontend ---
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin}

@app.get("/users/me", response_model=schemas.UserResponse, tags=["Users"])
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- ✈️ Flight Endpoints (Modified) ---

@app.post("/flights/", response_model=schemas.FlightResponse, status_code=status.HTTP_201_CREATED, tags=["Flights"])
def add_flight(
    flight: schemas.FlightCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user) # <-- ADMIN ONLY
):
    """
    Add a new flight to the system. **Admin only.**
    """
    db_flight = models.Flight(
        **flight.model_dump(),
        available_seats=flight.total_seats
    )
    db.add(db_flight)
    db.commit()
    db.refresh(db_flight)
    return db_flight

# --- (GET /flights/ and GET /flights/{id} are public, so no change) ---
@app.get("/flights/", response_model=List[schemas.FlightResponse], tags=["Flights"])
def list_flights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # ... unchanged
    flights = db.query(models.Flight).offset(skip).limit(limit).all()
    return flights

@app.get("/flights/{flight_id}", response_model=schemas.FlightResponse, tags=["Flights"])
def get_flight_details(flight_id: int, db: Session = Depends(get_db)):
    # ... unchanged
    flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if flight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    return flight

# --- NEW: Admin-only endpoint to cancel a flight ---
@app.delete("/flights/{flight_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Flights"])
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user) # <-- ADMIN ONLY
):
    """
    Delete a flight from the system. **Admin only.**
    This will also automatically delete all existing bookings for this flight
    due to the cascade rule.
    """
    db_flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if not db_flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")

    # --- THIS IS THE NEW LOGIC ---
    # With the cascade rule on the model, we just delete the flight.
    # SQLAlchemy will automatically delete all associated bookings first.
    db.delete(db_flight)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- 🎟️ Booking Endpoints (Modified) ---

# (POST /flights/{flight_id}/book is unchanged. Admins are users, so they can book.)
@app.post("/flights/{flight_id}/book", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
def book_ticket(
    flight_id: int, 
    booking: schemas.BookingCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # <-- Stays the same
):
    # ... (all logic is the same) ...
    db_flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if not db_flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    if db_flight.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No available seats")
    # ... etc ...
    db_booking = models.Booking(
        **booking.model_dump(),
        flight_id=flight_id,
        user_id=current_user.id,
        status="Booked"
    )
    db_flight.available_seats -= 1
    db.add(db_booking)
    db.add(db_flight)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.delete("/bookings/{booking_id}", response_model=schemas.BookingResponse, tags=["Bookings"])
def cancel_booking(
    booking_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Cancel an existing booking.
    A user can cancel their own booking.
    An admin can cancel *any* booking.
    """
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not db_booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # --- MODIFIED Authorization Check ---
    if db_booking.user_id != current_user.id and not current_user.is_admin:
        # Deny if you are not the owner AND you are not an admin
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this booking")

    if db_booking.status == "Canceled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is already canceled")

    # ... (rest of the logic is the same) ...
    db_flight = db.query(models.Flight).filter(models.Flight.id == db_booking.flight_id).first()
    if db_flight: # Check if flight still exists
        db_flight.available_seats += 1
        db.add(db_flight)

    db_booking.status = "Canceled"
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

# (GET /bookings/me is unchanged. It just shows the logged-in user's bookings)
@app.get("/bookings/me", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()
    return bookings