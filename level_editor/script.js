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
var level = [];

var saveButton = $("#saveBtn");
var loadButton = $("#loadBtn");
var levelJson;

floor.onload = function(){
    generateEmptyLevel();
    drawLevel();
};

function generateEmptyLevel() {
    for (var i=0; i<levelWidth; i++){
        level[i] = [];
        for (var j=0; j<levelHeight; j++) {
            level[i][j] = {background: "floor", players: 0};
        }
    }
}

function drawLevel() {
    for (var i=0; i<levelWidth; i++){
        for (var j=0; j<levelHeight; j++) {
           if (level[i][j].background === "floor"){
                console.log("drawing floor");
                ctx.drawImage(floor, i*tileWidth, j*tileWidth, tileWidth, tileWidth);
           } else if (level[i][j].background === "wall"){
                console.log("drawing wall");
                ctx.drawImage(wall, i*tileWidth, j*tileWidth, tileWidth, tileWidth);
           }
        }
    }
}



canvas.click(function(event){
    var x = event.pageX;
    var y = event.pageY;

    x -= canvas.offset().left;
    y -= canvas.offset().top;

    console.log("x:" + x + " y:" + y);

    if (level[Math.floor(x/tileWidth)][Math.floor(y/tileWidth)].background === "floor"){
        level[Math.floor(x/tileWidth)][Math.floor(y/tileWidth)].background = "wall";
    } else if (level[Math.floor(x/tileWidth)][Math.floor(y/tileWidth)].background === "wall"){
        level[Math.floor(x/tileWidth)][Math.floor(y/tileWidth)].background = "floor";
    }

    drawTile(Math.floor(x/tileWidth),Math.floor(y/tileWidth), level[Math.floor(x/tileWidth)][Math.floor(y/tileWidth)]);
    //drawLevel();
});

function drawTile(x,y,tile){
    if (tile.background === "wall"){
        ctx.drawImage(wall, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    } else if (tile.background === "floor"){
        ctx.drawImage(floor, x*tileWidth, y*tileWidth, tileWidth, tileWidth);
    }
}

saveButton.click(function(){
    var dataUri = "data:application/json;charset=utf-8,"+JSON.stringify(level);
    window.open( dataUri, 'mywindow' );
});

loadButton.click(function(){
    level = JSON.parse(levelJson);
    drawLevel();
});

$("#loadFile").change(function(evt){
        var f = evt.target.files[0]; 

        if (f) {
            var r = new FileReader();
            r.onload = function(e) { 
                console.log("LOAD");
                levelJson = e.target.result;
            }
        r.readAsText(f);
        } else { 
            alert("Failed to load file");
        }
    });


});
