# Steelcase - Intelligent Packaging Sensor System
By Southern Solutions

## Steps
1. "git clone https://github.com/alvinsi/steelcase-dashboard.git" at your designated directory
2. "npm install" to install module dependencies
3. "node server.js" or  "npm start" or "nodemon server.js" to start
4. "http://localhost:3000/"

## Arduino to Database
```
PUT /tickets/:id (lastSeenLat, lastSeenLng) {  // To update current location
     // Live Feed on Situation
     if (package is damaged) {
          // Add Damaged Package Info from Arduino
          POST /damaged (latitude, longitude, ticketId, damageSize)
     }
}
```