var http = require("http").createServer(handler); // handler za delo z aplikacijo
var io = require("socket.io").listen(http); // socket.io za trajno povezavo med strež. in klient.
var fs = require("fs"); // spremenljivka za "file system", t.j. fs
var firmata = require("firmata"); // da so pini na Arduinu dostopni preko USB

function handler(req, res) {
    fs.readFile(__dirname + "/primer09.html",
    function (err, data){
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani");
        }
    res.writeHead(200);
    res.end(data);
    })
}

var želenaVrednost = 0; // nastavimo želeno vrednost na 0
var dejanskaVrednost = 0; // spremenljivka za dejansko vrednost
var faktor = 0.1; // faktor, ki dololoča hitrost doseganja žel. stan.

http.listen(8080); // določimo na katerih vratih bomo poslušali

console.log("Zagon sistema"); // v konzolo zapišemo sporočilo (v terminal)

var board = new firmata.Board("/dev/ttyACM0", function() {
    console.log("Priključitev na Arduino");
    board.pinMode(0, board.MODES.ANALOG); // analogni pin 0
    board.pinMode(1, board.MODES.ANALOG); // analogni pin 1
    board.pinMode(2, board.MODES.OUTPUT); // smer DC motorja
    board.pinMode(3, board.MODES.PWM); // PWM motorja oz. hitrost
});

board.on("ready", function() { 

console.log("Plošča pripravljena.");

board.analogRead(0, function(value) {
    želenaVrednost = value; // neprekinjeno branje pina A0
});

board.analogRead(1, function(value) {
    dejanskaVrednost = value; // neprekinjeno branje pina A1
});

startKontrolniAlgoritem(); // poženemo kontrolni algoritem

io.sockets.on("connection", function(socket) {
    socket.emit("sporociloKlientu", "Strežnik povezan.");
    
    setInterval(pošljiVrednosti, 40, socket); // na 40ms pošljemo vrednost klientu

});
    
});

function kontrolniAlgoritem () {
    pwm = faktor*(želenaVrednost-dejanskaVrednost);
    if (pwm > 0) {board.digitalWrite(2,0)}; // določimo smer če je > 0
    if (pwm < 0) {board.digitalWrite(2,1)}; // določimo smer če je < 0
    board.analogWrite(3, Math.abs(pwm));
};

function startKontrolniAlgoritem () {
    setInterval(function() {kontrolniAlgoritem(); }, 30); // na 30ms klic
    console.log("Start kontrolni algoritem")
};

function pošljiVrednosti (socket) {
    socket.emit("klientBeriVrednosti",
    {
    "želenaVrednost": želenaVrednost,
    "dejanskaVrednost": dejanskaVrednost
    });
};
