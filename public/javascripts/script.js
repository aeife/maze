$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");
var img = new Image();
var player = {image: img, x: 0, y: 0};
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

socket.on('newPosition', function (data) {
	console.log("got new Pos");
	console.log(data.x);
	moveTo(data.x, data.y);
});



function moveUp(speed){
	ctx.clearRect(player.x-1, player.y-1, player.image.width+1, player.image.height+1);
	ctx.drawImage(player.image, player.x, player.y-=speed);

	socket.emit('move',{
		x: player.x,
		y: player.y
	});

}

function moveLeft(speed){
	console.log("left");
	ctx.clearRect(player.x-1, player.y-1, player.image.width+1, player.image.height+1);
	ctx.drawImage(player.image, player.x-=speed, player.y);

	socket.emit('move',{
		x: player.x,
		y: player.y
	});
}

function moveDown(speed){
	ctx.clearRect(player.x-1, player.y-1, player.image.width+1, player.image.height+1);
	ctx.drawImage(player.image, player.x, player.y+=speed);

	socket.emit('move',{
		x: player.x,
		y: player.y
	});
}

function moveRight(speed){
	console.log("right");
	ctx.clearRect(player.x-1, player.y-1, player.image.width+1, player.image.height+1);
	ctx.drawImage(player.image, player.x+=speed, player.y);

	socket.emit('move',{
		x: player.x,
		y: player.y
	});
}

function moveTo(x, y){
	ctx.clearRect(player.x-1, player.y-1, player.image.width+1, player.image.height+1);
	ctx.drawImage(player.image, player.x=x, player.y=y);
}

});
