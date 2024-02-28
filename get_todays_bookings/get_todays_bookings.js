const http = require("http");
const fs = require("fs").promises

const host = '0.0.0.0';
const port = 8000;

const ppms_url = 'https://ppms.eu/bristol/API2/'
const core_id = 2
const api_key = process.argv[2]

var get_sessions_list_items = {
    'action': 'GetSessionsList',
    'date': '0000-00-00',
    'filter': 'day',
    'coreid': core_id,
    'systemid': 0,
    'apikey': api_key
};

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html;charset=UTF-8");
    res.writeHead(200);

    system_id = req.url.substring(1);
    if (system_id === 'favicon.ico') {
        return;
    }

    // For debugging, seeing IP of incoming request
    console.log("On "+new Date().toUTCString()+" request from "+req.connection.remoteAddress+" for system_id "+system_id);
    
    get_sessions_list_items['date'] = getDateString();

    sessions = getSessions(system_id)
        .then((sessions) => {
            var booking_map = new Map();
            
            if (sessions == undefined) {
                booking_map.set(0,"");
            } else {
                for (var session_idx in sessions) {
                    var booking = sessions[session_idx];
                    
                    var cancelled = booking.cancelled;
                    if (cancelled)
                        continue;

                    var start_time = new Date(0, 0, 0, booking.hour / 4, 15*(booking.hour % 4));
                    var start_time_ms = start_time.getTime();
                    var booked_time_ms = booking.hoursBooked * 60 * 60 * 1000;
                    var end_time = new Date(start_time_ms + booked_time_ms);

                    booking_map.set(-start_time_ms,getBookingString(start_time, end_time, booking.userName));

                }
            }

            if (booking_map.size == 0)
                booking_map.set(0,"");

            var html = indexFile;
            html = updatePageTitle(html, sessions);
            html = updateBookings(html, booking_map);

            res.end(html);

        });

};

function getDateString() {
    var date = new Date();
    var str = "";
    str = str + String(date.getFullYear()).padStart(4, '0');
    str = str + "-";
    str = str + String(date.getMonth()+1).padStart(2, '0');
    str = str + "-";
    str = str + String(date.getDate()).padStart(2, '0');
    
    return str;

}

async function getSessions(system_id) {
    get_sessions_list_items['systemid'] = system_id;

    var formBody = [];
    for (var property in get_sessions_list_items) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(get_sessions_list_items[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    body = formBody.join('&')

    let sessions = await fetch(ppms_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body
    })
        .then((response) => {
            if (response.status != 200)
                return undefined;

            return response.json()
        })
        .then((data) => {            
            return data;
        })
        .catch(err => {
            console.log(err);
        });

    return sessions;

}

function updatePageTitle(html, sessions) {
    if (sessions == undefined) {
        return html.replace("Today's bookings for {SYSTEM}", "No bookings found for today");
    } else {
        return html.replace("{SYSTEM}", sessions[0].systemName);
    }
}

function updateBookings(html, booking_map) {
    var sorted_booking_map =  [...booking_map].sort((a, b) => b[0] - a[0]);

    var str = "";
    for (var idx in sorted_booking_map)
        str = str + sorted_booking_map[idx][1];
    
    return html.replace("{BOOKINGS}", str);

}

function getBookingString(start_date, end_date, username) {
    var start_date
    var str = "<p>";
    str = str + String(start_date.getHours()).padStart(2, '0');
    str = str + ":";
    str = str + String(start_date.getMinutes()).padStart(2, '0');
    str = str + " - ";
    str = str + String(end_date.getHours()).padStart(2, '0');
    str = str + ":";
    str = str + String(end_date.getMinutes()).padStart(2, '0');
    str = str + " (";
    str = str + username;
    str = str + ")";
    str = str + "</p>";

    return str;

}

const server = http.createServer(requestListener);

fs.readFile(__dirname + "/index.html", "utf8")
    .then(contents => {
        indexFile = contents;
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });
