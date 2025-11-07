from pydantic import BaseModel, ConfigDict, field_validator, EmailStr, Field
from datetime import datetime
from typing import Optional
import re # <-- Import re for regex

# Passport regex (example: 1-3 letters followed by 6-9 numbers)
PASSPORT_REGEX = r"^[A-Za-z]{1,3}[0-9]{6,9}$"

# --- Flight Schemas (Modified) ---
class FlightBase(BaseModel):
    flight_number: str
    airline: str
    departure: str
    destination: str
    departure_time: datetime
    arrival_time: datetime  # <-- NEW
    total_seats: int

class FlightCreate(FlightBase):
    @field_validator('total_seats')
    def validate_total_seats(cls, v):
        if v <= 0:
            raise ValueError('Total seats must be greater than 0')
        return v
    
    @field_validator('arrival_time')
    def validate_arrival_time(cls, v, values):
        # Use .get() to safely access departure_time
        if 'departure_time' in values.data and v <= values.data['departure_time']:
            raise ValueError('Arrival time must be after departure time')
        return v

class FlightResponse(FlightBase):
    id: int
    available_seats: int
    model_config = ConfigDict(from_attributes=True)

# --- Booking Schemas (Modified) ---
class BookingBase(BaseModel):
    passenger_name: str
    # --- NEW: Passport validation ---
    passport_number: str = Field(..., pattern=PASSPORT_REGEX)

class BookingCreate(BookingBase):
    pass

# ... (Rest of schemas are unchanged) ...
class BookingResponse(BookingBase):
    id: int
    flight_id: int
    status: str
    user_id: int
    flight: FlightResponse
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    admin_secret: Optional[str] = None 

class UserResponse(UserBase):
    id: int
    is_admin: bool
    bookings: list[BookingResponse] = []
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    is_admin: Optional[bool] = False