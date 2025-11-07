import openapi_client
from openapi_client.api.users_api import UsersApi
from openapi_client.api.flights_api import FlightsApi
from openapi_client.api.bookings_api import BookingsApi
from openapi_client.models.user_create import UserCreate
from openapi_client.models.flight_create import FlightCreate
from openapi_client.models.booking_create import BookingCreate
from openapi_client.api_client import ApiClient
from openapi_client.exceptions import ApiException 
from datetime import datetime, timedelta, UTC
import httpx 
import time

# --- Script Configuration ---
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = f"admin_sdk_{int(time.time())}@example.com"
ADMIN_PASSWORD = "sdk_admin_password_123"
ADMIN_SECRET = "caliber@1" # Must match your auth.py

# 1. Configure the base API client
configuration = openapi_client.Configuration(
    host=BASE_URL
)

print("🚀 Starting Admin SDK Demo...")

try:
    # 2. Register a new Admin User
    with ApiClient(configuration) as api_client:
        users_api = UsersApi(api_client)
        admin_user_data = UserCreate(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            admin_secret=ADMIN_SECRET
        )
        try:
            new_admin = users_api.register_user_users_register_post(user_create=admin_user_data)
            print(f"\n✅ 1. Admin user '{new_admin.email}' registered successfully.")
        except ApiException as e:
            if "already registered" in str(e.body):
                print(f"\n✅ 1. Admin user '{ADMIN_EMAIL}' already exists. Skipping registration.")
            else:
                print(f"❌ Could not register admin: {e.body}")
                raise

    # 3. Log in as Admin to get Token
    print(f"\n✅ 2. Logging in as '{ADMIN_EMAIL}'...")
    login_data = {
        'username': ADMIN_EMAIL, # 'username' is the email
        'password': ADMIN_PASSWORD
    }
    response = httpx.post(f"{BASE_URL}/users/login", data=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.json()}")
        raise Exception("Login failed")
        
    token_data = response.json()
    access_token = token_data['access_token']
    print("   ...Login successful. Token received.")

    # 4. Configure the main SDK client with the Auth Token
    configuration.access_token = access_token

    # 5. Run authenticated admin operations
    with ApiClient(configuration) as admin_client:
        flights_api = FlightsApi(admin_client)
        bookings_api = BookingsApi(admin_client) # <-- NEW: Init Bookings API
        
        # --- Add a Flight (Admin Only) ---
        print("\n✅ 3. (Admin) Adding a new flight...")
        
        # --- MODIFIED: Added arrival_time ---
        departure_dt = datetime.now(UTC) + timedelta(days=1)
        arrival_dt = departure_dt + timedelta(hours=3)
        
        new_flight_data = FlightCreate(
            flight_number="SDK999",
            airline="SDK Air",
            departure="SDK",
            destination="API",
            departure_time=departure_dt,
            arrival_time=arrival_dt,  # <-- NEWLY ADDED
            total_seats=50
        )
        added_flight = flights_api.add_flight_flights_post(flight_create=new_flight_data)
        flight_id = added_flight.id
        print(f"   ...Flight {added_flight.flight_number} (ID: {flight_id}) added.")

        # --- NEW: Book a ticket ---
        print(f"\n✅ 4. (Admin) Booking a ticket on flight {flight_id}...")
        
        # --- MODIFIED: Use valid passport number ---
        booking_details = BookingCreate(
            passenger_name="SDK User",
            passport_number="P12345678"  # <-- VALID PASSPORT
        )
        
        new_booking = bookings_api.book_ticket_flights_flight_id_book_post(
            flight_id=flight_id,
            booking_create=booking_details
        )
        print(f"   ...Booking confirmed! ID: {new_booking.id}. (Check admin email for confirmation).")

        # --- Delete a Flight (Admin Only) ---
        print(f"\n✅ 5. (Admin) Deleting flight {flight_id}...")
        flights_api.delete_flight_flights_flight_id_delete(flight_id=flight_id)
        print("   ...Flight deleted successfully.")

    print("\n🎉 Admin SDK Demo Completed Successfully!")

except Exception as e:
    print(f"\n❌ ERROR in SDK Demo: {e}")