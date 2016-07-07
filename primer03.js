var http = require("http").createServer(handler); // handler za delo z aplikacijo
var io = require("socket.io").listen(http); // socket.io za trajno povezavo med strež. in klient.
var fs = require("fs"); // spremenljivka za "file system", t.j. fs
var firmata = require("firmata"); // da so pini na Arduinu dostopni preko USB

function handler(req, res) {
    fs.readFile(__dirname + "/primer03.html",
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
    console.log("Omogočimo pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
});

io.sockets.on("connection", function(socket) {
    socket.emit("sporociloKlientu", "Strežnik povezan.");
    socket.on("ukazArduinu", function(stevilkaUkaza){
        if (stevilkaUkaza == "1") {
            board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo 1
        }
        else if (stevilkaUkaza == 0) {
            board.digitalWrite(13, board.LOW); // na pinu 13 zapišemo 0
        }
    });
});