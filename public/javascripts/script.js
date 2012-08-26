$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");

var img = new Image();
img.src = "images/player.png";

var wall = new Image();
wall.src = "images/wall.png";

var floor = new Image();
floor.src = "images/floor.png";

var message = new Image();
message.src = "images/message.png";



var levelWidth = 100;
var levelHeight = 100;
var viewWidth = 5;
var offset = Math.floor(viewWidth/2);
var tileWidth = 100;
var spawn = {x:3, y:3};

var players = [];

var player = {x: spawn.x, y: spawn.y};


var url = "http://localhost:3000";
var socket = io.connect(url);




document.onkeydown = function(e) {
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
            dropMessage();
            break;
    };
};

//----------------------------SOCKETS-----------------

//starting position
img.onload = function(){
    ctx.drawImage(img, player.x,player.y,tileWidth,tileWidth);
    console.log(img.width);

    //level = generateLevel();
    console.log(level);
    
    console.log("filled!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(level);
    
    

};

socket.on('successfullyConnected', function (data) {
    // own player connected and receiving data like all current players
    console.log("successfully connected");
    console.log(data);
    player.idNr = data.idNr;
    players = data.currentPlayers;
    level = data.level;
    level[spawn.x][spawn.y].players++;
    console.log(players);
    for (var i=0; i<players.length; i++){
        spawnClient(players[i].x, players[i].y);
    }
    drawView();
});

socket.on('newPlayer', function (idNr) {
    // new player connected, spawn player
    console.log("got new player");
    //console.log(idNr);
    players.push({x: spawn.x, y: spawn.y, idNr: idNr});
    spawnClient(spawn.x, spawn.y);
    console.log(players);
});

socket.on('newPosition', function (data) {
    // other player moved
    console.log("got new position");
    moveTo(data.idNr, data.x, data.y);
});

socket.on('newMessage', function (data) {

    console.log("got new message");

    level[data.x][data.y].message = true;
    if (isVisible(data.x, data.y)){
        console.log((data.x-player.x+offset) + ":" + (data.y-player.y+offset));
        drawTile((data.x-player.x+offset), (data.y-player.y+offset), level[data.x][data.y]);
    }
});

function emitNewPosition(){
    socket.emit('move',{
        x: player.x,
        y: player.y,
        idNr: player.idNr
    });
}

function emitNewMessage(){
    socket.emit('droppedNewMessage',{
        x: player.x,
        y: player.y,
        idNr: player.idNr
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
    level[player.x][player.y].message = true;
    drawTile(offset, offset, level[player.x][player.y]);

    emitNewMessage();
}

function spawnClient(x,y){
    level[x][y].players++;
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
    console.log(client);


    // move player count on level
    level[client.x][client.y].players--;
    level[x][y].players++;

    // reset previous tile if visible
    if (isVisible(client.x, client.y)) {
        console.log("prev pos visible: " + (client.x-player.x+offset) + ":" + (client.y-player.y+offset));
        drawTile((client.x-player.x+offset), (client.y-player.y+offset),level[client.x][client.y]);
    }

    // print client if visible
    if (isVisible(x, y)) {
        console.log("client visible!");

        console.log("drawing player: x=" + (x-player.x+offset) *tileWidth + " y=" + (y-player.y-offset) *tileWidth);
        ctx.drawImage(img, (x-player.x+offset) *tileWidth, (y-player.y+offset) *tileWidth, 100, 100);

    }

    // set new client position
    client.x=x;
    client.y=y;

    //draw own player
    ctx.drawImage(img,offset*tileWidth,offset*tileWidth, tileWidth, tileWidth);
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

    //draw own player
    //ctx.drawImage(img,1*tileWidth,1*tileWidth, tileWidth, tileWidth);
}

function drawTile(x, y, tile){
    // draw a single tile
    // 
    //console.log("x: " + x + " y: " + y + " tile: " + tile);
    if (tile.background === "wall") {
        ctx.drawImage(wall, x*tileWidth, y*tileWidth);
    } else {
        ctx.drawImage(floor, x*tileWidth, y*tileWidth);
    }

    if (tile.message === true) {
        ctx.drawImage(message, x*tileWidth, y*tileWidth);
    }

    //draw other players
    //console.log(tile.players);
    if (tile.players > 0){
        console.log("drawing other player");
        ctx.drawImage(img, x*tileWidth, y*tileWidth, 100, 100);
    }
}



});
