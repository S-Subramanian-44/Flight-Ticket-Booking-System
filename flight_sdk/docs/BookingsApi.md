# openapi_client.BookingsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**book_ticket_flights_flight_id_book_post**](BookingsApi.md#book_ticket_flights_flight_id_book_post) | **POST** /flights/{flight_id}/book | Book Ticket
[**cancel_booking_bookings_booking_id_delete**](BookingsApi.md#cancel_booking_bookings_booking_id_delete) | **DELETE** /bookings/{booking_id} | Cancel Booking


# **book_ticket_flights_flight_id_book_post**
> BookingResponse book_ticket_flights_flight_id_book_post(flight_id, booking_create)

Book Ticket

Book a ticket for a specific flight.

### Example


```python
import openapi_client
from openapi_client.models.booking_create import BookingCreate
from openapi_client.models.booking_response import BookingResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.BookingsApi(api_client)
    flight_id = 56 # int | 
    booking_create = openapi_client.BookingCreate() # BookingCreate | 

    try:
        # Book Ticket
        api_response = api_instance.book_ticket_flights_flight_id_book_post(flight_id, booking_create)
        print("The response of BookingsApi->book_ticket_flights_flight_id_book_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BookingsApi->book_ticket_flights_flight_id_book_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **flight_id** | **int**|  | 
 **booking_create** | [**BookingCreate**](BookingCreate.md)|  | 

### Return type

[**BookingResponse**](BookingResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cancel_booking_bookings_booking_id_delete**
> BookingResponse cancel_booking_bookings_booking_id_delete(booking_id)

Cancel Booking

Cancel an existing booking by its ID.
This changes the status to "Canceled" and increments the flight's available seats.

### Example


```python
import openapi_client
from openapi_client.models.booking_response import BookingResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.BookingsApi(api_client)
    booking_id = 56 # int | 

    try:
        # Cancel Booking
        api_response = api_instance.cancel_booking_bookings_booking_id_delete(booking_id)
        print("The response of BookingsApi->cancel_booking_bookings_booking_id_delete:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling BookingsApi->cancel_booking_bookings_booking_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **booking_id** | **int**|  | 

### Return type

[**BookingResponse**](BookingResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

