# Steelcase - Intelligent Packaging Sensor System
By Southern Solutions

## Steps
1. "git clone https://github.com/alvinsi/steelcase-dashboard.git" at your designated directory
2. "npm install" to install module dependencies
3. "node server.js" or  "npm start" or "nodemon server.js" to start
4. "http://localhost:3000/"

## Integrating Live Feed with Arduino
```
PUT /tickets/:id (lastSeenLat, lastSeenLng) {  // To update current location
     if (package is damaged) {
          POST /damaged (latitude, longitude, ticketId, damageSize) // Add Damaged Package Info from Arduino
     }
}
```