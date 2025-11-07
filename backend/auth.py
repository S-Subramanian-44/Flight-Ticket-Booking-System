import models
import schemas
import database
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta, UTC
import bcrypt

# --- Configuration (Modified) ---
SECRET_KEY = "T[~B7$8hcrHZ>~]k$;uQK'{*AzCdm=["
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# --- NEW ---
# Change this to a complex, random string in a real environment
ADMIN_REGISTRATION_SECRET = "caliber@1" 

# ... (Password hashing functions are unchanged) ...
def verify_password(plain_password, hashed_password):
    try:
        plain_password_bytes = plain_password.encode('utf-8')
        hashed_password_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception:
        return False

def get_password_hash(password):
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password.decode('utf-8')

# --- JWT Creation (Modified) ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- OAuth2 Scheme (Unchanged) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- Dependency to get user (Modified) ---
def get_user(db: Session, email: str):
    """Helper function to get user from database."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Decodes the token, validates credentials, and fetches the user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id") # <-- Get user_id from token
        if email is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch user by ID from token instead of email
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# --- NEW Admin-only Dependency ---
def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    """
    A dependency that checks if the current user is an admin.
    If not, it raises a 403 Forbidden error.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized: Requires admin privileges"
        )
    return current_user