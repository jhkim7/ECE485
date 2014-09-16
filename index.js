//var five = require("johnny-five"),
//    // or "./lib/johnny-five" when running from the source
//    board = new five.Board();
//
//board.on("ready", function() {
//
//	console.log("The board is ready");
//
//  // Create an Led on pin 13 and strobe it on/off
//  // Optionally set the speed; defaults to 100ms
//  (new five.Led(13)).strobe();
//
//});
console.log("Waiting for the board to connect");

var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame;

board.on('ready', function() {
    console.log("The board is ready");
    led = new five.Led(13);
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
//        console.log(frame);
//        console.log("Number of hands: "+ frame.hands.length);
        if (frame.hands && frame.hands.length >= 1) {
            led.on();
            console.log("There is a hand!");
        }
        else {
            led.off();
        }
    });
});

