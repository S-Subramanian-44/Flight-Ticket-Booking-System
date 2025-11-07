from fastapi import FastAPI, Depends, HTTPException, status, Response, BackgroundTasks # Make sure BackgroundTasks is imported
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from pydantic import EmailStr
import os
from dotenv import load_dotenv

# --- NEW: Email Imports ---
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

import models
import schemas
import database
import auth

# --- Load .env file for email ---
load_dotenv()

# --- Email Configuration ---
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

app = FastAPI(
    title="Flight Booking API",
    description="API for booking and managing flight tickets.",
    version="1.0.0"
)

get_db = database.get_db

# --- Helper to send confirmation email ---
async def send_booking_confirmation(email_to: EmailStr, booking: models.Booking):
    flight = booking.flight
    html = f"""
    <p>Hi {booking.passenger_name},</p>
    <p>Your flight booking is confirmed!</p>
    <h3>Booking Details</h3>
    <ul>
      <li><b>Booking ID:</b> {booking.id}</li>
      <li><b>Flight:</b> {flight.airline} - {flight.flight_number}</li>
      <li><b>From:</b> {flight.departure}</li>
      <li><b>To:</b> {flight.destination}</li>
      <li><b>Departure Time:</b> {flight.departure_time}</li>
      <li><b>Arrival Time:</b> {flight.arrival_time}</li>
    </ul>
    <p>Safe travels!</p>
    """
    message = MessageSchema(
        subject=f"Flight Booking Confirmed: {flight.flight_number}",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

# --- NEW: Helper to send cancellation email ---
async def send_cancellation_email(email_to: EmailStr, booking: models.Booking):
    """
    Sends a booking cancellation email in the background.
    """
    flight = booking.flight
    html = f"""
    <p>Hi {booking.passenger_name},</p>
    <p>Your booking for flight {flight.flight_number} has been successfully canceled.</p>
    <h3>Canceled Booking Details:</h3>
    <ul>
        <li><b>Booking ID:</b> {booking.id}</li>
        <li><b>Flight:</b> {flight.airline} - {flight.flight_number}</li>
        <li><b>From:</b> {flight.departure}</li>
        <li><b>To:</b> {flight.destination}</li>
    </ul>
    <p>We're sorry to see you go. We hope to see you on another flight soon.</p>
    """
    
    message = MessageSchema(
        subject=f"Booking Canceled: {flight.flight_number}",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)


# --- User and Auth Endpoints (Unchanged) ---
@app.post("/users/register", response_model=schemas.UserResponse, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # ... (code is unchanged)
    db_user = auth.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    is_admin = False
    if user.admin_secret:
        if user.admin_secret == auth.ADMIN_REGISTRATION_SECRET:
            is_admin = True
        else:
            raise HTTPException(status_code=400, detail="Invalid admin secret")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password, 
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/users/login", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # ... (code is unchanged)
    user = auth.get_user(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id, "is_admin": user.is_admin}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin}

@app.get("/users/me", response_model=schemas.UserResponse, tags=["Users"])
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Flight Endpoints (Unchanged) ---
@app.post("/flights/", response_model=schemas.FlightResponse, status_code=status.HTTP_201_CREATED, tags=["Flights"])
def add_flight(
    flight: schemas.FlightCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    # ... (code is unchanged)
    db_flight = models.Flight(
        **flight.model_dump(),
        available_seats=flight.total_seats
    )
    db.add(db_flight)
    db.commit()
    db.refresh(db_flight)
    return db_flight

@app.get("/flights/", response_model=List[schemas.FlightResponse], tags=["Flights"])
def list_flights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # ... (code is unchanged)
    flights = db.query(models.Flight).offset(skip).limit(limit).all()
    return flights

@app.get("/flights/{flight_id}", response_model=schemas.FlightResponse, tags=["Flights"])
def get_flight_details(flight_id: int, db: Session = Depends(get_db)):
    # ... (code is unchanged)
    flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if flight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    return flight

@app.delete("/flights/{flight_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Flights"])
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    # ... (code is unchanged)
    db_flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if not db_flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight not found")
    db.delete(db_flight)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Booking Endpoints ---

@app.post("/flights/{flight_id}/book", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
def book_ticket(
    flight_id: int, 
    booking: schemas.BookingCreate,
    background_tasks: BackgroundTasks, # <-- Inject BackgroundTasks
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # ... (validation logic is unchanged) ...
    db_flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
    if not db_flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    if db_flight.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No available seats")
    
    existing_booking = db.query(models.Booking).filter(
        models.Booking.flight_id == flight_id,
        models.Booking.passport_number == booking.passport_number,
        models.Booking.status == "Booked"
    ).first()
    if existing_booking:
        raise HTTPException(status_code=400, detail="Passport number already registered for this flight")

    db_booking = models.Booking(
        **booking.model_dump(),
        flight_id=flight_id,
        user_id=current_user.id,
        status="Booked"
    )
    db_flight.available_seats -= 1
    
    try:
        db.add(db_booking)
        db.add(db_flight)
        db.commit()
        db.refresh(db_booking)
        
        # --- Schedule confirmation email task ---
        background_tasks.add_task(
            send_booking_confirmation, 
            current_user.email, 
            db_booking
        )
        
        return db_booking
    except Exception as e:
        db.rollback()
        if "passport" in str(e).lower(): 
             raise HTTPException(status_code=422, detail="Invalid passport number format.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred during booking: {e}")

@app.delete("/bookings/{booking_id}", response_model=schemas.BookingResponse, tags=["Bookings"])
def cancel_booking(
    booking_id: int,
    background_tasks: BackgroundTasks, # <-- MODIFIED: Add BackgroundTasks
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

    if db_booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this booking")

    if db_booking.status == "Canceled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is already canceled")

    db_flight = db.query(models.Flight).filter(models.Flight.id == db_booking.flight_id).first()
    
    db_booking.status = "Canceled"
    db.add(db_booking)

    if db_flight: # Check if flight still exists
        db_flight.available_seats += 1
        db.add(db_flight)

    try:
        db.commit()
        db.refresh(db_booking)
        
        # --- NEW: Schedule cancellation email task ---
        # We need the user's email. If admin is canceling, email the owner
        email_to = db_booking.owner.email
        background_tasks.add_task(
            send_cancellation_email, 
            email_to, 
            db_booking
        )
        
        return db_booking
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@app.get("/bookings/me", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()
    return bookings