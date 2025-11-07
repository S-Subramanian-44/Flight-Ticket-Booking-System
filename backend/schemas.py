from pydantic import BaseModel, ConfigDict, field_validator, EmailStr, Field
from datetime import datetime
from typing import Optional

# --- Flight Schemas (Unchanged) ---
class FlightBase(BaseModel):
    flight_number: str
    airline: str
    departure: str
    destination: str
    departure_time: datetime
    total_seats: int

class FlightCreate(FlightBase):
    @field_validator('total_seats')
    def validate_total_seats(cls, v):
        if v <= 0:
            raise ValueError('Total seats must be greater than 0')
        return v

class FlightResponse(FlightBase):
    id: int
    available_seats: int
    model_config = ConfigDict(from_attributes=True)

# --- Booking Schemas (Modified) ---
class BookingBase(BaseModel):
    passenger_name: str
    passport_number: str

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    flight_id: int
    status: str
    user_id: int  # <-- Add this
    flight: FlightResponse
    model_config = ConfigDict(from_attributes=True)


# --- NEW User and Auth Schemas ---

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    # --- NEW FIELD ---
    # This secret will be checked on the backend to grant admin rights
    admin_secret: Optional[str] = None 

class UserResponse(UserBase):
    id: int
    is_admin: bool  # <-- Add this
    bookings: list[BookingResponse] = []
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool  # <-- Add this (tells the frontend what role logged in)

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None # <-- Add this
    is_admin: Optional[bool] = False # <-- Add this