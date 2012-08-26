$(function(){

var canvas = $("#level");
var ctx = canvas[0].getContext("2d");
var img = new Image();
img.src = "player.png";

var wall = new Image();
wall.src = "wall.png";

var floor = new Image();
floor.src = "floor.png";

var player = {x: 0, y: 0};
var players = [];
var levelWidth = 100;
var levelHeight = 100;
var tileWidth = 100;
var level;


player.x = 1;
player.y = 1;




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
	ctx.drawImage(img, player.x*tileWidth,player.y*tileWidth);
	console.log(img.width);

	level = generateLevel();
};

function moveUp(speed){
	//ctx.translate(0,10);
	//ctx.clearRect(0,0,canvas.width(),canvas.height());

	player.y--;

	drawView();
}

function moveLeft(speed){
	player.x--;

	drawView();
}

function moveDown(speed){
	player.y++;

	drawView();
}

function moveRight(speed){
	player.x++;

	drawView();

}

function drawLevel(level){
	canvas.width = canvas.width;
	for (var i=0;i<level.length;i++){
		for (var j=0;j<level[1].length;j++){
			if (level[i][j] === "wall"){
				ctx.drawImage(img, i*20, j*20);
			}
		}
	}
}

function drawView(){
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

	ctx.drawImage(img,1*tileWidth,1*tileWidth,tileWidth, tileWidth);
}

function drawTile(x, y, tile){
	console.log("x: " + x + " y: " + y + " tile: " + tile);
	if (tile === "wall") {
		ctx.drawImage(wall, x*tileWidth, y*tileWidth);
	} else {
		ctx.drawImage(floor, x*tileWidth, y*tileWidth);
	}
}

function generateLevel(){
	console.log("generate level");
	var l = [];
	for (var i=0; i<levelWidth; i++){
		l[i] = [];
		for (var j=0; j<levelHeight; j++){
			if (i === 0 || j === 0 || i === levelWidth-1 || j === levelWidth-1){
				l[i][j] = "wall";
			}
		}
	}
	console.log(l);
	
	return l;
}


});
