var http = require("http").createServer(handler); // handler za delo z aplikacijo
var io = require("socket.io").listen(http); // socket.io za trajno povezavo med strež. in klient.
var fs = require("fs"); // spremenljivka za "file system", t.j. fs
var firmata = require("firmata"); // da so pini na Arduinu dostopni preko USB

function handler(req, res) {
    fs.readFile(__dirname + "/primer06.html",
    function (err, data){
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani");
        }
    res.writeHead(200);
    res.end(data);
    })
}

http.listen(8080); // določimo na katerih vratih bomo poslušali

console.log("Zagon sistema"); // v konzolo zapišemo sporočilo (v terminal)

var board = new firmata.Board("/dev/ttyACM0", function() {
    console.log("Priključitev na Arduino");
    board.pinMode(2, board.MODES.OUTPUT); // pin za smer na H-mostu (H-bridge)
    board.pinMode(3, board.MODES.PWM); // hitrost Pulse Width Modulation
});

io.sockets.on("connection", function(socket) {
    socket.emit("sporociloKlientu", "Strežnik povezan.");
    
    socket.on("posljiPWM", function(pwm){
        board.analogWrite(3,pwm);
        socket.emit("sporociloKlientu", "PWM nastavljen na: " + pwm);        
    });
    
    socket.on("levo", function(vrednost){
        board.digitalWrite(2,vrednost);
        socket.emit("sporociloKlientu", "Smer: levo");
    });
    
    socket.on("desno", function(vrednost){
        board.digitalWrite(2,vrednost);
        socket.emit("sporociloKlientu", "Smer: desno");
    });
    
   socket.on("stop", function(vrednost){
        board.analogWrite(3,vrednost);
        socket.emit("sporociloKlientu", "STOP");
    });    
    
});