$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");

var imgPlayer = new Image();
imgPlayer.src = "images/player.png";

var imgClient = new Image();
imgClient.src = "images/client.png";

var imgWall = new Image();
imgWall.src = "images/wall.png";

var imgFloor = new Image();
imgFloor.src = "images/floor.png";

var imgMessage = new Image();
imgMessage.src = "images/message.png";

var imgMessageBig = new Image();
imgMessageBig.src = "images/messageBig.png";

var messageInput = $("#messageInput");
var writing = false;

var levelWidth = 100;
var levelHeight = 100;
var viewWidth = 5;
var offset = Math.floor(viewWidth/2);
var tileWidth = 100;
var spawn = {x:3, y:3};

var players = [];

var player = {x: spawn.x, y: spawn.y};


var url = "http://localhost";
var socket = io.connect();

// INPUT

messageInput.focusout(function() {
  writing = false;
});

messageInput.focus(function() {
  writing = true;
  messageInput.val("");
});

document.onkeydown = function(e) {
    if (!writing){
        switch(e.keyCode) {
            case 87:
                //w
                moveUp();
                break;
            case 65:
                //a
                moveLeft();
                break;
            case 83:
                //s
                moveDown();
                break;
            case 68:
                //d
                moveRight();
                break;
            case 77:
                //m
                messageInput.removeClass("hidden");
                messageInput.trigger("focus");
                //ctx.fillText("Sample String", 10, 50);
                break;
        };
    } else {
        switch(e.keyCode) {
            case 13:
                //enter
                console.log("submitted");
                dropMessage();
                messageInput.addClass("hidden");
                messageInput.trigger("focusout");
                break;
            case 27:
                //esc
                console.log("canceled");
                messageInput.val("");
                messageInput.addClass("hidden");
                messageInput.trigger("focusout");
                break;
        };
    }
};

//----------------------------SOCKETS-----------------


socket.on('successfullyConnected', function (data) {
    // own player connected and receiving data like all current players
    console.log("successfully connected");
    player.idNr = data.idNr;
    players = data.currentPlayers;

    level = data.level;;
    level[spawn.x][spawn.y].players++;

    for (var i=0; i<players.length; i++){
        spawnClient(players[i].x, players[i].y);
    }
    drawView();
});

socket.on('newPlayer', function (idNr) {
    // new player connected, spawn player
    console.log("got new player");

    players.push({x: spawn.x, y: spawn.y, idNr: idNr});
    spawnClient(spawn.x, spawn.y);
});

socket.on('playerDisconnected', function (data) {
    // client disconnected, delete client
    console.log("player disconnected");
    console.log(data);
    deleteClient(data.x, data.y);
});

socket.on('newPosition', function (data) {
    // other player moved
    console.log("got new position");
    moveTo(data.idNr, data.x, data.y);
});

socket.on('newMessage', function (data) {

    console.log("got new message");

    level[data.x][data.y].message = data.message;
    if (isVisible(data.x, data.y)){
        drawClient(data.x, data.y);
    }
});

function emitNewPosition(){
    socket.emit('move',{
        x: player.x,
        y: player.y,
        idNr: player.idNr
    });
}

function emitNewMessage(message){
    socket.emit('droppedNewMessage',{
        x: player.x,
        y: player.y,
        idNr: player.idNr,
        message: message
    });
}

//----------------------------FUNCTIONS-----------------

function moveUp(){
    if (level[player.x][player.y-1].background === "wall")
        return;

    level[player.x][player.y].players--;
    player.y--;
    level[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveLeft(){
    if (level[player.x-1][player.y].background === "wall")
        return;

    level[player.x][player.y].players--;
    player.x--;
    level[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveDown(){
    if (level[player.x][player.y+1].background === "wall")
        return;

    level[player.x][player.y].players--;
    player.y++;
    level[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveRight(){
    if (level[player.x+1][player.y].background === "wall")
        return;

    level[player.x][player.y].players--;
    player.x++;
    level[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function dropMessage(){
    var message = messageInput.val();
    level[player.x][player.y].message = message;
    drawTile(offset, offset, level[player.x][player.y]);

    emitNewMessage(message);
}

function spawnClient(x,y){
    level[x][y].players++;
    if (isVisible(x,y)) {
        drawClient(x,y);
    }
}

function deleteClient(x,y,clientId){
    level[x][y].players--;

    // delete vom players array
    //players.push({x: spawn.x, y: spawn.y, idNr: idNr});
    for (var i=0; i<players.length; i++){
        if (players[i].idNr === clientId) {
            client = players[i];
        }
    }

    players.splice(players.indexOf(client), 1);

    if (isVisible(x,y)) {
        drawClient(x,y);
    }
}

function drawClient(x,y){
    drawTile((x-player.x+offset), (y-player.y+offset),level[x][y]);
}



function moveTo(clientId, x, y){
    //get moved client
    var client;
    for (var i=0; i<players.length; i++){
        if (players[i].idNr === clientId) {
            client = players[i];
        }
    }

    // move player count on level
    level[client.x][client.y].players--;
    level[x][y].players++;

    // reset previous tile if visible
    if (isVisible(client.x, client.y)) {
        drawTile((client.x-player.x+offset), (client.y-player.y+offset),level[client.x][client.y]);
    }

    // print client if visible
    if (isVisible(x, y)) {
        ctx.drawImage(imgClient, (x-player.x+offset) *tileWidth, (y-player.y+offset) *tileWidth, tileWidth, tileWidth);
    }

    // set new client position
    client.x=x;
    client.y=y;

    //draw own player
    ctx.drawImage(imgPlayer, offset*tileWidth, offset*tileWidth, tileWidth, tileWidth);
}

function isVisible(x,y){
    return ((x >= player.x-offset && x <= player.x+offset) && (y >= player.y-offset && y <= player.y+offset));
}

function drawView(){
    // redraw whole view port
    ctx.clearRect(0, 0, viewWidth*tileWidth, viewWidth*tileWidth);
    for(var i=0; i<viewWidth; i++){
        for(var j=0; j<viewWidth; j++){
            var y = player.y-tileWidth;
            var x = player.x-tileWidth;
            if (level[player.x-offset+i] && level[player.x-offset+i][player.y-offset+j])
                drawTile(i,j,level[player.x-offset+i][player.y-offset+j]);
        }
    }

    if (level[player.x][player.y].message){
        ctx.font = "25px KnightsQuest";
        ctx.textAlign = "center";

        ctx.drawImage(imgMessageBig,canvas.width()/2-150, 10, 300, 150);
        wrapText(ctx, level[player.x][player.y].message, canvas.width()/2+3, 80, 250, 30);
    }

   
}

//http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

function drawTile(x, y, tile){
    // draw a single tile

    if (tile.background === "wall") {
        ctx.drawImage(imgWall, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    } else {
        ctx.drawImage(imgFloor, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    }

    if (tile.message) {
        ctx.drawImage(imgMessage, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    }

    if (tile.players > 0 && (x != offset || y != offset)){
        //draw other players
        ctx.drawImage(imgClient, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    } else if (x === offset && y === offset) {
        //draw own player
        ctx.drawImage(imgPlayer,offset*tileWidth,offset*tileWidth, tileWidth, tileWidth);
    }
}



});
