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

var imgMessageOnly = new Image();
imgMessageOnly.src = "images/messageOnly.png";

var messageInput = $("#messageInput");
var writing = false;
var messageLimit = 5;
var messagesDropped = 0;

var levelWidth = 100;
var levelHeight = 100;
var maze;
var viewWidth = 5;
var offset = Math.floor(viewWidth/2);
var tileWidth = 100;

var players = [];
var playerCountIndicator = $("#playerCount");

var player = {x: 0, y: 0};


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
            case (38):
            case (87):
                //w
                moveUp();
                break;
            case (37):
            case 65:
                //a
                moveLeft();
                break;
            case (40):
            case 83:
                //s
                moveDown();
                break;
            case (39):
            case 68:
                //d
                moveRight();
                break;
            case 77:
                //m
                if (messagesDropped < messageLimit) {
                    messageInput.removeClass("hidden");
                    messageInput.trigger("focus");
                    //ctx.fillText("Sample String", 10, 50);
                }
                break;
        };
    } else {
        switch(e.keyCode) {
            case 13:
                //enter
                console.log("submitted");
                messagesDropped++;
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
    player.x = data.level.spawn.x;
    player.y = data.level.spawn.y;
    players = data.currentPlayers;
    playerCountIndicator.html(players.length);

    viewWidth = data.options.viewWidth;
    offset = Math.floor(viewWidth/2);
    tileWidth = data.options.tileWidth;
    canvas.attr("width", viewWidth*tileWidth);
    canvas.attr("height", viewWidth*tileWidth);

    messageLimit = data.options.messageLimit;

    messageInput.css({top: canvas.offset().top + canvas.width()/2 +"px", left: canvas.offset().left + canvas.width()/2 - messageInput.width()/2 +"px"});

    level = data.level;
    maze = level.maze;
    maze[level.spawn.x][level.spawn.y].players++;

    // draw players that are already there
    for (var i=0; i<players.length; i++){
        spawnClient(players[i].x, players[i].y);
    }
    drawView();
});

socket.on('newPlayer', function (data) {
    // new player connected, spawn player
    console.log("got new player");

    players.push({x: data.spawn.x, y: data.spawn.y, idNr: data.idNr});
    spawnClient(data.spawn.x, data.spawn.y);

    playerCountIndicator.html(players.length);
});

socket.on('playerDisconnected', function (idNr) {
    // client disconnected, delete client
    deleteClient(idNr);
});

socket.on('newPosition', function (data) {
    // other player moved
    console.log("got new position");
    moveTo(data.idNr, data.x, data.y);
});

socket.on('newMessage', function (data) {

    console.log("got new message");

    maze[data.x][data.y].message = data.message;
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
    if (maze[player.x][player.y-1].background === "wall")
        return;

    maze[player.x][player.y].players--;
    player.y--;
    maze[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveLeft(){
    if (maze[player.x-1][player.y].background === "wall")
        return;

    maze[player.x][player.y].players--;
    player.x--;
    maze[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveDown(){
    if (maze[player.x][player.y+1].background === "wall")
        return;

    maze[player.x][player.y].players--;
    player.y++;
    maze[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function moveRight(){
    if (maze[player.x+1][player.y].background === "wall")
        return;

    maze[player.x][player.y].players--;
    player.x++;
    maze[player.x][player.y].players++;

    drawView();

    emitNewPosition();
}

function dropMessage(){
    var message = messageInput.val();
    maze[player.x][player.y].message = message;
    drawTile(offset, offset, maze[player.x][player.y]);

    // decrease displayed left messages
    drawView();

    emitNewMessage(message);
}

function spawnClient(x,y){
    maze[x][y].players++;
    if (isVisible(x,y)) {
        drawClient(x,y);
    }
}

function deleteClient(clientId){

    for (var i=0; i<players.length; i++){
        if (players[i].idNr === clientId) {
            client = players[i];
        }
    }

    maze[client.x][client.y].players--;

    players.splice(players.indexOf(client), 1);

    if (isVisible(client.x,client.y)) {
        drawClient(client.x,client.y);
    }
}

function drawClient(x,y){
    drawTile((x-player.x+offset), (y-player.y+offset),maze[x][y]);
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
    maze[client.x][client.y].players--;
    maze[x][y].players++;

    // reset previous tile if visible
    if (isVisible(client.x, client.y)) {
        drawTile((client.x-player.x+offset), (client.y-player.y+offset),maze[client.x][client.y]);
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
            if (maze[player.x-offset+i] && maze[player.x-offset+i][player.y-offset+j])
                drawTile(i,j,maze[player.x-offset+i][player.y-offset+j]);
            else {
                drawTile(i,j,{background: "wall"});
            }
        }
    }

    if (maze[player.x][player.y].message){
        ctx.font = "25px KnightsQuest";
        ctx.textAlign = "center";

        ctx.drawImage(imgMessageBig,canvas.width()/2-150, 10, 300, 150);
        wrapText(ctx, maze[player.x][player.y].message, canvas.width()/2+3, 80, 250, 30);
    }

    drawMessagesLeft();
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

function drawMessagesLeft(){
    for (var i=0; i<messageLimit-messagesDropped; i++){
        console.log("drawing message");
        ctx.drawImage(imgMessageOnly, 50*i, canvas.height()-30);
    }
}



});
