from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String, unique=True, index=True, nullable=False)
    airline = Column(String, nullable=False)
    departure = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)  # <-- NEW
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)

    bookings = relationship("Booking", back_populates="flight", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    passenger_name = Column(String, nullable=False)
    passport_number = Column(String, nullable=False, index=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    status = Column(String, default="Booked", nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight = relationship("Flight", back_populates="bookings")
    owner = relationship("User", back_populates="bookings")
    __table_args__ = (
        UniqueConstraint('passport_number', 'flight_id', name='_passport_flight_uc'),
    )

# --- User Model (Modified) ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # --- NEW FIELD ---
    is_admin = Column(Boolean, default=False, nullable=False)

    bookings = relationship("Booking", back_populates="owner")