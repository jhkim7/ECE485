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
    board, low, volup, high, voldn, dimmer, left, right, trup, trdn, src, kill, led;
var wiper = 128;
var lock = false;
var headlightState = 0;

board = new five.Board();

// On board ready
// Init a led on pin 13, strobe every 1000ms
board.on("ready", function () {
    low = new five.Led(2);
    volup = new five.Led(3);
    high = new five.Led(4);
    voldn = new five.Led(5);
    dimmer = 6;
    this.pinMode(dimmer, five.Pin.PWM);
    left = new five.Led(7);
    right = new five.Led(8);
    trup = new five.Led(9);
    trdn = new five.Led(10);
    src = new five.Led(11);
    kill = new five.Button(12);
    led = new five.Led(13);
    led.off();

    kill.on("release", function () { // Kill Radio pins if necessary.
        lock = true;
        volup.off();
        voldn.off();
        trup.off();
        trdn.off();
        src.off();
        led.off();
        console.log("Button Pressed.");
    });

    kill.on("hit", function () {
        console.log("Button Released.");
        voldn.on();
        led.strobe();
        board.wait(5000, function () {
            lock = false;
            voldn.off();
            led.stop();
            led.off();
        });
        console.log("Routine Finished.");
    });

    console.log("The Board is ready.");
});

// Make web server listen on port 80
app.listen(8080);

// Handle web server
function handler(req, res) {

    if(req.url.indexOf('.html') != -1){ //req.url has the pathname, check if it conatins '.html'
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    } else if (req.url.indexOf('.css') != -1) { //req.url has the pathname, check if it conatins '.css'
        fs.readFile(__dirname + '/' + req.url, function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.write(data);
            res.end();
        });
    } else if (req.url.indexOf('.js') != -1) {
        fs.readFile(__dirname + "/" + req.url, function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.write(data);
            res.end();
        });
    } else if (req.url.indexOf('.wav') != -1) {
        fs.readFile(__dirname + "/" + req.url, function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, { 'Content-Type': 'audio/wav' });
            res.write(data);
            res.end();
        });
    }
}

// On a socket connection
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });

    // When the socket receives the 'gesture' message
    socket.on('gesture', function (data) {
        if (board.isReady) {
            if (!lock) {
                if (data.gestureOff) {
                    led.off();
                    volup.off();
                    voldn.off();
                    trup.off();
                    trdn.off();
                    src.off();
                    console.log("Gesture Off.");
                }
                if (data.swipeRight) { // Process a right swipe
                    console.log("Gesture: Swipe Right.             Function: Track/Seek Up.");
                    trup.on();
                    led.on();
                }
                if (data.swipeLeft) { // Proess a left swipe
                    console.log("Gesture: Swipe Left.              Function: Track/Seek Down.");
                    trdn.on();
                    led.on();
                }
                if (data.swipeUp) { // Process an up swipe
                    if (headlightState < 2) {
                        if (headlightState < 1) {
                            console.log("Gesture: Swipe Up.                Function: Lowbeams On.");
                            low.on();
                            led.on();
                            board.analogWrite(dimmer, wiper);
                            headlightState = 1;
                        } else {
                            console.log("Gesture: Swipe Up.                Function: Highbeams On.");
                            low.off();
                            high.on();
                            led.on();
                            headlightState = 2;
                        }
                    } else console.log("Gesture: Swipe Up.                Function: None.")
                }
                if (data.swipeDown) { // Process a down swipe
                    if (headlightState > 0) {
                        if (headlightState > 1) {
                            console.log("Gesture: Swipe Down.              Function: Highbeams Off.");
                            high.off();
                            low.on();
                            led.on();
                            headlightState = 1;
                        } else {
                            console.log("Gesture: Swipe Down.              Function: Lowbeams Off.");
                            low.off();
                            led.on();
                            board.analogWrite(dimmer, 0);
                            headlightState = 0;
                        }
                    } else console.log("Gesture: Swipe Down.              Function: None.")
                }
                if (data.cwCircle) { // Process a cw circle
                    console.log("Gesture: Clockwise Circle.        Function: Volume Up.");
                    volup.on();
                    led.on();
                }
                if (data.ccwCircle) { // Process a ccw circle
                    console.log("Gesture: Counterclockwise Circle. Function: Volume Down.");
                    voldn.on();
                    led.on();
                }
                if (data.turnLeft) { // Process a left point
                    console.log("Gesture: Pointing Left.           Function: Left Turn Signal.");
                    left.on();
                    left.strobe(700);
                }
                if (data.turnRight) { // Process a right point
                    console.log("Gesture: Pointing Right.          Function: Right Turn Signal.");
                    right.on();
                    right.strobe(700);
                }
                if (data.turnOff) { // Automatically shut off turn signals
                    left.stop();
                    left.off();
                    right.stop();
                    right.off();
                }
                if (data.screenTap) { // Process a screen tap
                    console.log("Gesture: Screen Tap.              Function: Radio Source.");
                    src.on();
                    led.on();
                }
                if (data.keyTap) { //Process a key tap
                    console.log("Gesture: Key Tap.                 Function: Unused.");
                }
            }
        }
    });

    socket.on('dimmer', function (data) {
        if (board.isReady) {
            if (headlightState > 0) {
                //console.log(data);
                var delta = 2 * parseInt(data.dimmerChange);
                wiper += delta;
                //console.log(wiper);
                if (wiper > 255) wiper = 255;
                else if (wiper < 0) wiper = 0;
                board.analogWrite(dimmer, wiper);
            }
        }
    });

    console.log("connected to socket");

});
