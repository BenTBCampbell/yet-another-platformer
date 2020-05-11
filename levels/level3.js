var group = $("#group");

var win = new Background();
win.init(
    gf.addSprite(group,"winFront",{width: 630, height: 960}),
    gf.addSprite(group,"winBack",{width: 630, height: 960}),
    winAnim
    );
$("#winFront").attr("class", "background");
$("#winBack").attr("class", "background");
backgrounds.push(win);
