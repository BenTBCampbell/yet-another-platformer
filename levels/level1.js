var group = $("#group");

var outside = new Background();
outside.init(
    gf.addSprite(group,"outsideFront",{width: 7000, height: 960}),
    gf.addSprite(group,"outsideBack",{width: 7000, height: 960}),
    outsideAnim
    );
$("#outsideFront").attr("class", "background");
$("#outsideBack").attr("class", "background");
backgrounds.push(outside);