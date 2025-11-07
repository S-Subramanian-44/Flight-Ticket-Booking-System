# FlightResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**flight_number** | **str** |  | 
**airline** | **str** |  | 
**departure** | **str** |  | 
**destination** | **str** |  | 
**departure_time** | **datetime** |  | 
**arrival_time** | **datetime** |  | 
**total_seats** | **int** |  | 
**id** | **int** |  | 
**available_seats** | **int** |  | 

## Example

```python
from openapi_client.models.flight_response import FlightResponse

# TODO update the JSON string below
json = "{}"
# create an instance of FlightResponse from a JSON string
flight_response_instance = FlightResponse.from_json(json)
# print the JSON string representation of the object
print(FlightResponse.to_json())

# convert the object into a dict
flight_response_dict = flight_response_instance.to_dict()
# create an instance of FlightResponse from a dict
flight_response_from_dict = FlightResponse.from_dict(flight_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


