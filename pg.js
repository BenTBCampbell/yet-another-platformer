var enemies = [];
var slimeAnim = {
    stand: new gf.animation({
        url: "images/slime.png"
    }),
    walk: new gf.animation({
        url: "images/slime.png",
        width: 43,
        numberOfFrames: 2,
        rate: 90
    }),
    dead: new gf.animation({
        url: "images/slime.png",
        offsetx: 86
    })
};
var flyAnim = {
    stand: new gf.animation({
        url: "images/fly.png"
    }),
    walk: new gf.animation({
        url: "images/fly.png",
        width: 69,
        numberOfFrames: 2,
        rate: 90
    }),
    dead: new gf.animation({
        url: "images/fly.png",
        offsetx: 138
    })

};

var Slime = function() {
    this.init = function(div, x1, x2, anim) {
        this.div = div;
        this.x1 = x1;
        this.x2 = x2;
        this.anim = anim;
        this.direction = 1;
        this.speed = 5;
        this.dead = false;

        gf.transform(div, {flipH: true});
        gf.setAnimation(div, anim.walk, true);
    };

    this.update = function() {
        if (this.dead) {
            this.dies();
        } else {
            var position = gf.x(this.div);
            if (position < this.x1) {
                this.direction = 1;
                gf.transform(this.div, {flipH: true});
            }
            if (position > this.x2) {
                this.direction = -1;
                gf.transform(this.div, {flipH: false});
            }
            gf.x(this.div, gf.x(this.div) + this.direction * this.speed);
        }
    };
    this.kill = function() {
        this.dead = true;
        gf.setAnimation(this.div, this.anim.dead);
    };
    this.dies = function() {
    };
};
var Fly = function() {
};
Fly.prototype = new Slime();
Fly.prototype.dies = function() {
    gf.y(this.div, gf.y(this.div) + 5);
};

var backgrounds = [];

var outsideAnim = {
    back: new gf.animation({
        url: "images/outside_back.png"
    }),
    front: new gf.animation({
        url: "images/outside_front.png"
    })
};

var caveAnim = {
    back: new gf.animation({
        url: "images/cave_back.png"
    }),
    front: new gf.animation({
        url: "images/cave_front.png"
    })
};

var winAnim = {
    back: new gf.animation({
        url: "images/win.png"
    }),
    front: new gf.animation({
        url: "images/win.png"
    })
};

var Background = function() {
    this.init = function(divB, divF, anim) {
        this.backgroundBack = divB;
        this.backgroundFront = divF;
        this.anim = anim;

        gf.setAnimation(divB, anim.back, true);
        gf.setAnimation(divF, anim.front, true);
    };

};

$(function() {
    gf.initialize({baseDiv: $("#myGame")});

    var levels = [
        {tiles: "../Platformer2/levels/level1.json", objects: "levels/level1.js"},
        {tiles: "levels/level2.json", objects: "levels/level2.js"},
        {tiles: "levels/level3.json", objects: "levels/level3.js"}
    ];

    var currentLevel = 0;

    var loadNextLevel = function(group) {
        var level = levels[currentLevel++];
        // clear old level
        $("#level0").remove();
        $("#level1").remove();
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].div.remove();
        }
        for (var i = 0; i < backgrounds.length; i++) {
            backgrounds[i].backgroundBack.remove();
            backgrounds[i].backgroundFront.remove();
        }
        enemies = [];
        backgrounds = [];

        // create the new level

        // first the tiles
        gf.importTiled(level.tiles, group, "level");

        // then the objects
        $.getScript(level.objects);

        // finaly return the div holdoing the tilemap
        return $("#level1");
    };

    var playerAnim = {
        stand: new gf.animation({
            url: "images/player.png",
            offsetx: 75
        }),
        walk: new gf.animation({
            url: "images/player.png",
            offsetx: 150,
            width: 75,
            numberOfFrames: 10,
            rate: 90
        }),
        jump: new gf.animation({
            url: "images/player.png",
            offsetx: 900
        })
    };

    var tilemap, container, group;

    var player = new (function() {
        var acceleration = 9;
        var speed = 20;
        var status = "stand";
        var horizontalMove = 0;

        this.update = function() {
            if (status === "dead") {
                var newY = gf.y(this.div) + 2;
                if (newY > 480 + 93 - 100) {
                    gf.x(this.div, 0);
                    gf.y(this.div, 810);
                    status = "stand";
                    gf.setAnimation(this.div, playerAnim.stand);
                    gf.x(group, 0);
                } else {
                    gf.y(this.div, newY);
                }

            } else if (status === "finished") {
                tilemap = loadNextLevel(group);
                gf.x(this.div, 70);
                gf.y(this.div, 780);
                status = "stand";
                gf.setAnimation(this.div, playerAnim.jump);

            } else {
                var delta = 30;
                speed = Math.min(100, Math.max(-100, speed + acceleration * delta / 100.0));
                var newY = gf.y(this.div) + speed * delta / 100.0;
                var newX = gf.x(this.div) + horizontalMove;
                var newW = gf.w(this.div);
                var newH = gf.h(this.div);

                var collisions = gf.tilemapCollide(tilemap, {x: newX, y: newY, width: newW, height: newH});
                var i = 0;
                while (i < collisions.length > 0) {
                    var collision = collisions[i];
                    console.log(collisions[i]);
                    i++;
                    var collisionBox = {
                        x1: collision.x,
                        y1: collision.y,
                        x2: collision.x + collision.width,
                        y2: collision.y + collision.height
                    };

                    // react differently to each kind of tile
                    switch (collision.type) {
                        case 1:
                            // collision tiles
                            var x = gf.intersect(newX, newX + newW, collisionBox.x1, collisionBox.x2);
                            var y = gf.intersect(newY, newY + newH, collisionBox.y1, collisionBox.y2);

                            var diffx = (x[0] === newX) ? x[0] - x[1] : x[1] - x[0];
                            var diffy = (y[0] === newY) ? y[0] - y[1] : y[1] - y[0];
                            if (Math.abs(diffx) > Math.abs(diffy)) {
                                // displace along the y axis
                                newY -= diffy;
                                speed = 0;
                                if (status === "jump" && diffy > 0) {
                                    status = "stand";
                                    gf.setAnimation(this.div, playerAnim.stand);
                                }
                            } else {
                                // displace along the x axis
                                newX -= diffx;
                            }
                            break;
                        case 2:
                            // deadly tiles
                            // collision tiles
                            var y = gf.intersect(newY, newY + newH, collisionBox.y1, collisionBox.y2);
                            var diffy = (y[0] === newY) ? y[0] - y[1] : y[1] - y[0];
                            if (diffy > 40) {
                                status = "dead";
                            }
                            break;
                        case 3:
                            // end of level tiles
                            status = "finished";
                            break;
                    }

                }
                if (newX < 0) {
                    newX = 0;
                } /*else if (x > gf.w(tilemap)-gf.w(x)){
                 newX = gf.w(tilemap)-gf.w(x);
                 }*/
                gf.x(this.div, newX);
                gf.y(this.div, newY);
                horizontalMove = 0;
            }
        };

        this.left = function() {
            switch (status) {
                case "stand":
                    gf.setAnimation(this.div, playerAnim.walk, true);
                    status = "walk";
                    horizontalMove -= 7;
                    break;
                case "jump":
                    horizontalMove -= 5;
                    break;
                case "walk":
                    horizontalMove -= 7;
                    break;
            }
            gf.transform(this.div, {flipH: true});
        };

        this.right = function() {
            switch (status) {
                case "stand":
                    gf.setAnimation(this.div, playerAnim.walk, true);
                    status = "walk";
                    horizontalMove += 7;
                    break;
                case "jump":
                    horizontalMove += 5;
                    break;
                case "walk":
                    horizontalMove += 7;
                    break;
            }
            gf.transform(this.div, {flipH: false});
        };

        this.jump = function() {
            switch (status) {
                case "stand":
                case "walk":
                    status = "jump";
                    speed = -60;
                    gf.setAnimation(this.div, playerAnim.jump);
                    break;
            }
        };

        this.idle = function() {
            switch (status) {
                case "walk":
                    status = "stand";
                    gf.setAnimation(this.div, playerAnim.stand);
                    break;
            }
        };
    });

    var initialize = function() {
        $("#myGame").append("<div id='container'>");
        container = $("#container");
        group = gf.addGroup(container, "group");

        tilemap = loadNextLevel(group);

        player.div = gf.addSprite(group, "player", {width: 74, height: 93, y: 810});

        gf.setAnimation(player.div, playerAnim.stand);

        $("#startScreen").remove();
        container.css("display", "block");
    };

    var gameLoop = function() {

        var idle = true;
        if (gf.keyboard[37]) { //left arrow
            player.left();
            idle = false;
        }
        if (gf.keyboard[38]) { //up arrow
            player.jump();
            idle = false;
        }
        if (gf.keyboard[39]) { //right arrow
            player.right();
            idle = false;
        }
        if (idle) {
            player.idle();
        }

        player.update();
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].update();
            if (gf.spriteCollide(player.div, enemies[i].div)) {
                enemies[i].kill();
            }
        }


        var margin = {x: 200, y: -500};
        var playerPos = {x: gf.x(player.div), y: gf.y(player.div)};

        var offset = {
            x: margin.x - Math.min(Math.max(playerPos.x, margin.x), gf.w(tilemap) - 640 + margin.x),
            y: margin.y - Math.min(Math.max(playerPos.y, margin.y), gf.h(tilemap) - 480 + margin.y)
        };
        gf.y(group, margin.y);
//        console.log(group.x);

        if (currentLevel !== 3) {
            if (playerPos.x > margin.x) {
                gf.x(group, margin.x - playerPos.x);
            }
        }
        $("#caveFront").css("background-position", "" + (offset.x * 0.66) + "px 0px");
        $("#caveBack").css("background-position", "" + (offset.x * 0.33) + "px 0px");
        $("#outsideFront").css("background-position", "" + (offset.x * 0.66) + "px 0px");
        $("#outsideBack").css("background-position", "" + (offset.x * 0.33) + "px 0px");
    };
    gf.addCallback(gameLoop, 30);

    $("#startScreen").click(function() {
        gf.startGame(initialize);
    });
});