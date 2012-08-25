$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");
var img = new Image();
var player = {x: 0, y: 0};
var players = [];
var url = "http://localhost:3000";
var socket = io.connect(url);



img.src = "images/player.png";
	player.x = 50;
	player.y = 50;


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


//starting position
img.onload = function(){
	ctx.drawImage(img, player.x,player.y);
	console.log(img.width);

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
	console.log(idNr);
	players.push({x: 50, y: 50, idNr: idNr});
	ctx.drawImage(img, 50, 50);
	console.log(players);
});

socket.on('newPosition', function (data) {
	console.log("got new position");
	moveTo(data.idNr, data.x, data.y);
});



function moveUp(speed){
	ctx.clearRect(player.x-1, player.y-1, img.width+1, img.height+1);
	ctx.drawImage(img, player.x, player.y-=speed);

	emitNewPosition();
}

function moveLeft(speed){
	console.log("left");
	ctx.clearRect(player.x-1, player.y-1, img.width+1, img.height+1);
	ctx.drawImage(img, player.x-=speed, player.y);

	emitNewPosition();
}

function moveDown(speed){
	ctx.clearRect(player.x-1, player.y-1, img.width+1, img.height+1);
	ctx.drawImage(img, player.x, player.y+=speed);

	emitNewPosition();
}

function moveRight(speed){
	console.log("right");
	ctx.clearRect(player.x-1, player.y-1, img.width+1, img.height+1);
	ctx.drawImage(img, player.x+=speed, player.y);

	emitNewPosition();
}

function moveTo(clientId, x, y){
	//get special client
	var client;
	console.log(clientId);
	for (var i=0; i<players.length; i++){
		if (players[i].idNr === clientId) {
			client = players[i];
		}
	}
	console.log(client);
	ctx.clearRect(client.x-1, client.y-1, img.width+1, img.height+1);
	ctx.drawImage(img, client.x=x, client.y=y);
}

function emitNewPosition(){
	socket.emit('move',{
		x: player.x,
		y: player.y,
		idNr: player.idNr
	});
}

});
