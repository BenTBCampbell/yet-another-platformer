var group = $("#group");

var cave = new Background();
cave.init(
    gf.addSprite(group,"caveFront",{width: 5670, height: 980}),
    gf.addSprite(group,"caveBack",{width: 5670, height: 980}),
    caveAnim
    );
$("#caveFront").attr("class", "background");
$("#caveBack").attr("class", "background");
backgrounds.push(cave);

var outside = new Background();
outside.init(
    gf.addSprite(group,"outsideFront",{width: 1400, height: 980, x: 5670}),
    gf.addSprite(group,"outsideBack",{width: 1400, height: 980, x: 5670}),
    outsideAnim
    );
$("#outsideFront").attr("class", "background");
$("#outsideBack").attr("class", "background");
backgrounds.push(outside);