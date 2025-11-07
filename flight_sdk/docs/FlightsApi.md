# openapi_client.FlightsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**add_flight_flights_post**](FlightsApi.md#add_flight_flights_post) | **POST** /flights/ | Add Flight
[**delete_flight_flights_flight_id_delete**](FlightsApi.md#delete_flight_flights_flight_id_delete) | **DELETE** /flights/{flight_id} | Delete Flight
[**get_flight_details_flights_flight_id_get**](FlightsApi.md#get_flight_details_flights_flight_id_get) | **GET** /flights/{flight_id} | Get Flight Details
[**list_flights_flights_get**](FlightsApi.md#list_flights_flights_get) | **GET** /flights/ | List Flights


# **add_flight_flights_post**
> FlightResponse add_flight_flights_post(flight_create)

Add Flight

Add a new flight to the system. **Admin only.**

### Example

* OAuth Authentication (OAuth2PasswordBearer):

```python
import openapi_client
from openapi_client.models.flight_create import FlightCreate
from openapi_client.models.flight_response import FlightResponse
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

configuration.access_token = os.environ["ACCESS_TOKEN"]

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.FlightsApi(api_client)
    flight_create = openapi_client.FlightCreate() # FlightCreate | 

    try:
        # Add Flight
        api_response = api_instance.add_flight_flights_post(flight_create)
        print("The response of FlightsApi->add_flight_flights_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling FlightsApi->add_flight_flights_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **flight_create** | [**FlightCreate**](FlightCreate.md)|  | 

### Return type

[**FlightResponse**](FlightResponse.md)

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_flight_flights_flight_id_delete**
> delete_flight_flights_flight_id_delete(flight_id)

Delete Flight

Delete a flight from the system. **Admin only.**
This will also automatically delete all existing bookings for this flight
due to the cascade rule.

### Example

* OAuth Authentication (OAuth2PasswordBearer):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

configuration.access_token = os.environ["ACCESS_TOKEN"]

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.FlightsApi(api_client)
    flight_id = 56 # int | 

    try:
        # Delete Flight
        api_instance.delete_flight_flights_flight_id_delete(flight_id)
    except Exception as e:
        print("Exception when calling FlightsApi->delete_flight_flights_flight_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **flight_id** | **int**|  | 

### Return type

void (empty response body)

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**204** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_flight_details_flights_flight_id_get**
> FlightResponse get_flight_details_flights_flight_id_get(flight_id)

Get Flight Details

### Example


```python
import openapi_client
from openapi_client.models.flight_response import FlightResponse
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
    api_instance = openapi_client.FlightsApi(api_client)
    flight_id = 56 # int | 

    try:
        # Get Flight Details
        api_response = api_instance.get_flight_details_flights_flight_id_get(flight_id)
        print("The response of FlightsApi->get_flight_details_flights_flight_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling FlightsApi->get_flight_details_flights_flight_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **flight_id** | **int**|  | 

### Return type

[**FlightResponse**](FlightResponse.md)

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

# **list_flights_flights_get**
> List[FlightResponse] list_flights_flights_get(skip=skip, limit=limit)

List Flights

### Example


```python
import openapi_client
from openapi_client.models.flight_response import FlightResponse
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
    api_instance = openapi_client.FlightsApi(api_client)
    skip = 0 # int |  (optional) (default to 0)
    limit = 100 # int |  (optional) (default to 100)

    try:
        # List Flights
        api_response = api_instance.list_flights_flights_get(skip=skip, limit=limit)
        print("The response of FlightsApi->list_flights_flights_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling FlightsApi->list_flights_flights_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **skip** | **int**|  | [optional] [default to 0]
 **limit** | **int**|  | [optional] [default to 100]

### Return type

[**List[FlightResponse]**](FlightResponse.md)

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

