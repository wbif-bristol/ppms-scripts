# PPMS scripts

## Requirements
- Scripts require [Node](https://nodejs.org/en) to be installed
- PPMS API access requires an API2 key, which should be listed at the bottom of the PPMS "Profile" page.  This will only allow as much access as the user's normal account.


## Running scripts
Run scripts with commands of the following form
```
node [script] [API2 key]
```

For example, where 'ABCDE12345' is a valid API2 key
```
node .\get_todays_bookings.js ABCDE12345
```