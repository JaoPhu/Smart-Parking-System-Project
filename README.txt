Test In Postman
get : http://localhost:5000/api/slots //check slots
post : http://localhost:5000/api/slots → body → raw { "slotNumber": 1 } //create slot
post : http://localhost:5000/api/slots/reset //reset slots

put : http://localhost:5000/api/slots/1 → body → raw { "action": "reserve" } //reserve
put : http://localhost:5000/api/slots/1 → body → raw { "action": "park" } //park
put : http://localhost:5000/api/slots/1 → body → raw { "action": "leave" } //leave parking


