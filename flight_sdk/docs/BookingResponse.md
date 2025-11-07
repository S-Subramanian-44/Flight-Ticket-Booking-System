# BookingResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**passenger_name** | **str** |  | 
**passport_number** | **str** |  | 
**id** | **int** |  | 
**flight_id** | **int** |  | 
**status** | **str** |  | 
**user_id** | **int** |  | 
**flight** | [**FlightResponse**](FlightResponse.md) |  | 

## Example

```python
from openapi_client.models.booking_response import BookingResponse

# TODO update the JSON string below
json = "{}"
# create an instance of BookingResponse from a JSON string
booking_response_instance = BookingResponse.from_json(json)
# print the JSON string representation of the object
print(BookingResponse.to_json())

# convert the object into a dict
booking_response_dict = booking_response_instance.to_dict()
# create an instance of BookingResponse from a dict
booking_response_from_dict = BookingResponse.from_dict(booking_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


