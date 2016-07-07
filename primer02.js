var http = require("http");

var firmata = require("firmata");
console.log("Priklop");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Priklop na Arduino");
    console.log("Aktiviramo pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
    console.log("Aktiviramo pin 8");
    board.pinMode(8, board.MODES.OUTPUT);
    
    
    
    http.createServer(function(req, res){
        var parts = req.url.split("/"),
        operator = parseInt(parts[1],10);
        
        if (operator == 0) {
            console.log("Izključevanje LED");
            board.digitalWrite(13, board.LOW);
        }
        if (operator == 1) {
            console.log("Vključevanje LED");
            board.digitalWrite(13, board.HIGH);
        }
        
        if (operator == 2) {
            console.log("Izključevanje LED");
            board.digitalWrite(8, board.LOW);
        }
        
        if (operator == 3) {
            console.log("Vključevanje LED");
            board.digitalWrite(8, board.HIGH);
        }                
        
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Za test vpišite kot naslov: \nhttp://192.168.254.128:8080/1\nin pritisnite ENTER \n");
        res.end("Vrednost vnešenega operatorja je: " + operator);
    }).listen(8080, "192.168.254.128");
});