$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");

var img = new Image();
img.src = "images/player.png";

var wall = new Image();
wall.src = "images/wall.png";

var floor = new Image();
floor.src = "images/floor.png";

var player = {x: 1, y: 1};
var players = [];

var levelWidth = 100;
var levelHeight = 100;
var tileWidth = 100;

var url = "http://localhost:3000";
var socket = io.connect(url);


document.onkeydown = function(e) {
	switch(e.keyCode) {
		case 87:
			//w
			moveUp(10);
			break;
		case 65:
			//a
			moveLeft(10);
			break;
		case 83:
			//s
			moveDown(10);
			break;
		case 68:
			//d
			moveRight(10);
			break;
	};
};

//----------------------------SOCKETS-----------------

//starting position
img.onload = function(){
	ctx.drawImage(img, player.x,player.y,tileWidth,tileWidth);
	console.log(img.width);

	level = generateLevel();
	drawView();

};

socket.on('successfullyConnected', function (data) {
	console.log("successfully connected");
	console.log(data);
	player.idNr = data.idNr;
	players = data.currentPlayers;
	console.log(players);
	for (var i=0; i<players.length; i++){
		moveTo(players[i].idNr, players[i].x, players[i].y);
	}
});

socket.on('newPlayer', function (idNr) {
	console.log("got new player");
	//console.log(idNr);
	players.push({x: 1, y: 1, idNr: idNr});
	moveTo(idNr,1,1);
	console.log(players);
});

socket.on('newPosition', function (data) {
	console.log("got new position");
	moveTo(data.idNr, data.x, data.y);
});


//----------------------------FUNCTIONS-----------------

function moveUp(speed){
	level[player.x][player.y].player = false;
	player.y--;
	level[player.x][player.y].player = true;

	drawView();

	emitNewPosition();
}

function moveLeft(speed){
	level[player.x][player.y].player = false;
	player.x--;
	level[player.x][player.y].player = true;

	drawView();

	emitNewPosition();
}

function moveDown(speed){
	console.log("!!!!!");
	console.log(level[1][1]);
	level[player.x][player.y].player = false;
	player.y++;
	level[player.x][player.y].player = true;

	drawView();

	emitNewPosition();
}

function moveRight(speed){
	level[player.x][player.y].player = false;
	player.x++;
	level[player.x][player.y].player = true;

	drawView();

	emitNewPosition();
}

function moveTo(clientId, x, y){
	//get special client
	var client;
	for (var i=0; i<players.length; i++){
		if (players[i].idNr === clientId) {
			client = players[i];
		}
	}
	console.log(client);

	level[client.x][client.y].player = false;
	level[x][y].player = true;

	//reset previous tile
	if ((client.x >= player.x-1 && client.x <= player.x+1) && (client.y >= player.y-1 && client.y <= player.y+1)) {
		console.log("prev pos visible: " + (client.x-player.x+1) + ":" + (client.y-player.y+1));
		drawTile((client.x-player.x+1), (client.y-player.y+1),level[client.x][client.y]);
	}

	//test if visible
	if ((x >= player.x-1 && x <= player.x+1) && (y >= player.y-1 && y <= player.y+1)) {
		console.log("client visible!");

		console.log("drawing player: x=" + (x-player.x+1) *tileWidth + " y=" + (y-player.y-1) *tileWidth);
		ctx.drawImage(img, (x-player.x+1) *tileWidth, (y-player.y+1) *tileWidth, 100, 100);

	}

	client.x=x;
	client.y=y;
}

function drawView(){
	console.log("drawing view");
	/*
	for(var i=player.x-1; i<=player.x+1; i++){
		for(var j=player.y-1; j<=player.y+1; j++){
			drawTile(i,j);
		}
	}*/

	ctx.clearRect(0, 0, 3*tileWidth, 3*tileWidth);
	for(var i=0; i<3; i++){
		for(var j=0; j<3; j++){
			var y = player.y-tileWidth;
			var x = player.x-tileWidth;
			drawTile(i,j,level[player.x-1+i][player.y-1+j]);
		}
	}

	//ctx.drawImage(img,1*tileWidth,1*tileWidth,tileWidth, tileWidth);
}

function drawTile(x, y, tile){
	//console.log("x: " + x + " y: " + y + " tile: " + tile);
	if (tile.background === "wall") {
		ctx.drawImage(wall, x*tileWidth, y*tileWidth);
	} else {
		ctx.drawImage(floor, x*tileWidth, y*tileWidth);
	}
	if (tile.player){
		ctx.drawImage(img, x*tileWidth, y*tileWidth, 100, 100);
	}
}

function generateLevel(){
	console.log("generate level");
	var l = [];
	for (var i=0; i<levelWidth; i++){
		l[i] = [];
		for (var j=0; j<levelHeight; j++){
			if (i === 0 || j === 0 || i === levelWidth-1 || j === levelWidth-1){
				l[i][j] = {background: "wall"};
			} else {
				l[i][j] = {background: "floor"};
			}
		}
	}
	console.log(l);
	
	return l;
}

function emitNewPosition(){
	socket.emit('move',{
		x: player.x,
		y: player.y,
		idNr: player.idNr
	});
}

});
