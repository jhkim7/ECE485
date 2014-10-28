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

var seven, eight;

board = new five.Board();

// On board ready
// Init a led on pin 13, strobe every 1000ms
board.on("ready", function () {
    led = new five.Led(13);
    led.off();
    seven = new five.Led(7);
    eight = new five.Led(8);
    console.log("The Board is ready.");
});

// Make web server listen on port 80
app.listen(8080);

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

    // When the socket receives the 'gesture' message
    socket.on('gesture', function (data) {
        if (board.isReady) {
            if(data.grabStrength){
                led.on();
            } else led.off();
        }
        if(board.isReady) {
            if(data.swipeRight) {
                console.log("it came into a swipe right function of the socket");
                led.toggle();
                seven.toggle();
            }
            if(data.swipeLeft) {
                eight.toggle();
                console.log("it came into a swipe left function of the socket");
            }
        }
    });

    console.log("connected to socket");

});
