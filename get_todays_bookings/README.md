# Get today's sessions
Creates a web server that shows the current day's bookings for a specific system.  

## Usage 
This page can be viewed by accessing addresses of the form
```
http://[IP address]:[Port]/[System ID]
```
Where _IP address_ is the IP of the server, _Port_ is the port (set on line 5 of the script; default = 8000) and _System ID_ is the ID of the system for which bookings are being requested.  For example:

```
http://192.168.0.1:8000/42
```