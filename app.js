
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

var players = [];
var levelWidth = 100;
var levelHeight = 100;
//var level = generateLevel();
//fillWithWalls(2, 4, 16, 20);
//fillWithWalls(2, 4, 8, 50);
//fillWithWalls(2, 4, 4, 100);
//fillWithWalls(1, 2, 2, 20);
var level = loadLevel();

io.sockets.on('connection', function (socket) {
    console.log("connected");

    //generate unique id
    var idNr = Math.round(new Date()*Math.random());
    
    console.log("idNr: " + idNr);
    var connectionData = {idNr: idNr, currentPlayers: players, level: level};

    socket.emit('successfullyConnected', connectionData);
    socket.broadcast.emit('newPlayer', idNr);

    players.push({x: 50, y: 50, idNr: idNr});

    socket.on("move", function(data){
        console.log("move");
        console.log(data.x);

        var client;
        for (var i=0; i<players.length; i++){
            if (players[i].idNr === data.idNr) {
                client = players[i];
            }
        }
        client.x = data.x;
        client.y = data.y;


        socket.broadcast.emit('newPosition', data);
    });

    socket.on("droppedNewMessage", function(data){
        level[data.x][data.y].message = data.message;

        console.log("message");

        socket.broadcast.emit('newMessage', data);
    });

    socket.on("disconnect", function(){
        console.log("disconnected client!");
    });

});


// LEVEL GENERATION

function loadLevel(){
     //var test = require('level.txt');
     //var test2 = JSON.parse(test);
     //console.log(test);
    var fs = require('fs');
    var l = fs.readFileSync('level.txt').toString().split("\n");

    return JSON.parse(l);

}

function generateLevel(){
    
    console.log("generate level");
    var l = [];
    for (var i=0; i<levelWidth; i++){
        l[i] = [];
        for (var j=0; j<levelHeight; j++){
            /*if (i === 0 || j === 0 || i === levelWidth-1 || j === levelWidth-1){
                l[i][j] = {background: "wall"};
            } else {
                l[i][j] = {background: "floor"};
            }
             */
            l[i][j] = {players:0};
        }
    }
    console.log(l);
    
    return l;
}

function fillWithWalls(minLength, maxLength, granularity, numWalls){
   for (var i=0; i<numWalls; i++){
        // Startposition bestimmen
        var x = granularity * random(0, (levelWidth-1) / granularity);
        var y = granularity * random(0, (levelHeight-1) / granularity);
        // Richtung bestimmen
        var dir = Math.round(0+(Math.random()*(3-0)));
        // Länge bestimmen
        var length = granularity * Math.round(minLength+(Math.random()*(maxLength-minLength))) +1;
        drawWall(x, y, dir, length);
    }
}

function random(min, max) {
    return Math.round(min+(Math.random()*(max-min)));
}

function drawWall(x, y, dir, length){
    console.log("drawing wall");
    switch (dir){
        case 0:
            //left
           
            for (var i=0; i<length; i++){
                 console.log("LEFT");
                if (level[x-i] && level[x-i][y]) {
                    console.log("setting wall");
                    level[x-i][y].background = "wall";
                    console.log(level[x-i][y]);
                }
            }
            break;
        case 1:
            //right
            for (var i=0; i<length; i++){
                if (level[x+i] && level[x+i][y]) {
                    console.log("setting wall");
                    level[x+i][y].background = "wall";

                }
            }
            break;
        case 2:
            //up
            for (var i=0; i<length; i++){
                if (level[x] && level[x][y-i]) {
                    console.log("setting wall");
                    level[x][y-i].background = "wall";
                }
            }
            break;
        case 3:
            //down
            for (var i=0; i<length; i++){
                if (level[x] && level[x][y+i]) {
                    console.log("setting wall");
                    level[x][y+i].background = "wall";
                }
            }
            break;
    }
}