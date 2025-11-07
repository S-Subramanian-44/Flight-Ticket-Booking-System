# FlightCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**flight_number** | **str** |  | 
**airline** | **str** |  | 
**departure** | **str** |  | 
**destination** | **str** |  | 
**departure_time** | **datetime** |  | 
**total_seats** | **int** |  | 

## Example

```python
from openapi_client.models.flight_create import FlightCreate

# TODO update the JSON string below
json = "{}"
# create an instance of FlightCreate from a JSON string
flight_create_instance = FlightCreate.from_json(json)
# print the JSON string representation of the object
print(FlightCreate.to_json())

# convert the object into a dict
flight_create_dict = flight_create_instance.to_dict()
# create an instance of FlightCreate from a dict
flight_create_from_dict = FlightCreate.from_dict(flight_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


