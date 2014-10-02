//
// The main Javascript file for this project.
// Created 9/27/2014
// Created by Jeffrey Kim
// Team 4 Vehicle Gesture Control
//


// Initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
    , five = require("johnny-five"),
    board, servo, led, sensor;

board = new five.Board();

// On board ready
// Init a led on pin 13, strobe every 1000ms
board.on("ready", function () {
    led = new five.Led(13);
    led.off();
    console.log("The Board is ready.");
});

// Make web server listen on port 80
app.listen(80);

// Handle web server
function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}

// On a socket connection
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });

    // If led message received
    socket.on('gesture', function (data) {
        if (board.isReady) {
            if(data.grabStrength){
                led.on();
            } else led.off();
        }
    });

});
