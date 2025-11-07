# Corrected imports: 'flight_sdk' is changed to 'openapi_client'
import openapi_client
from openapi_client.api.flights_api import FlightsApi
from openapi_client.api.bookings_api import BookingsApi
from openapi_client.models.flight_create import FlightCreate
from openapi_client.models.booking_create import BookingCreate
from openapi_client.api_client import ApiClient, ApiException
from datetime import datetime

# Configure the API client to point to our running backend
configuration = openapi_client.Configuration(
    host="http://localhost:8000"
)

# --- Main Demo Logic ---
print("🚀 Starting Flight Booking SDK Demo...")

with ApiClient(configuration) as api_client:
    # Create API instances
    flights_api = FlightsApi(api_client)
    bookings_api = BookingsApi(api_client)

    try:
        # 1. Add a new flight
        print("\n1. Adding new flight 'SD100'...")
        new_flight = FlightCreate(
            flight_number="SD100",
            airline="SDK Demo Air",
            departure="DEV",
            destination="OPS",
            departure_time=datetime.now(),
            total_seats=50
        )
        added_flight = flights_api.add_flight_flights_post(flight_create=new_flight)
        print(f"✅ Success! Added Flight ID: {added_flight.id}, Seats: {added_flight.available_seats}")
        flight_id = added_flight.id

        # 2. List all flights
        print("\n2. Listing all flights...")
        all_flights = flights_api.list_flights_flights_get()
        print(f"✅ Success! Found {len(all_flights)} flights.")
        for f in all_flights:
            print(f"   - [ID: {f.id}] {f.flight_number} ({f.airline}) - {f.available_seats} seats left")
        
        # 3. Book a ticket
        print(f"\n3. Booking a ticket on flight {flight_id}...")
        booking_details = BookingCreate(
            passenger_name="SDK User",
            passport_number="SDK12345"
        )
        new_booking = bookings_api.book_ticket_flights_flight_id_book_post(
            flight_id=flight_id,
            booking_create=booking_details
        )
        booking_id = new_booking.id
        print(f"✅ Success! Booking confirmed. Booking ID: {booking_id}")
        
        # 4. Check available seats (should be 49)
        flight_details = flights_api.get_flight_details_flights_flight_id_get(flight_id=flight_id)
        print(f"   -> Seats remaining on flight {flight_id}: {flight_details.available_seats}")
        assert flight_details.available_seats == 49

        # 5. Cancel the booking
        print(f"\n4. Canceling booking {booking_id}...")
        canceled_booking = bookings_api.cancel_booking_bookings_booking_id_delete(booking_id=booking_id)
        print(f"✅ Success! Booking status: {canceled_booking.status}")

        # 6. Check available seats again (should be 50)
        flight_details = flights_api.get_flight_details_flights_flight_id_get(flight_id=flight_id)
        print(f"   -> Seats remaining on flight {flight_id}: {flight_details.available_seats}")
        assert flight_details.available_seats == 50
        
        print("\n🎉 SDK Demo Completed Successfully!")

    except ApiException as e:
        print(f"\n❌ ERROR in SDK Demo: {e.status} {e.reason}")
        print(f"   Body: {e.body}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")