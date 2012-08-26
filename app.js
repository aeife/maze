
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

io.sockets.on('connection', function (socket) {
    console.log("connected");

    //generate unique id
    var idNr = Math.round(new Date()*Math.random());
    
    console.log("idNr: " + idNr);
    var connectionData = {idNr: idNr, currentPlayers: players};

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

    socket.on("disconnect", function(){
        console.log("disconnected client!");
    });

});