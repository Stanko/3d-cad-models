/*

Holder profile
                   d2
                   ___          _
            d1    /   \         .
  _        ____  /     \        .
  .       /   / /       \       .
  .      /   /p/         \      h3
  h2    /   /_/           \     .
  .    /     .h1           \    .
  . . /______.______________\ . .


Stick profile
             ____  _
            /   /  .
           /   /   .
          /   /    .
         /   /     .
        /   /      .
       /   /       .
      /   /        b2
     /   /         .
    /   /          .
   /_  /   _       .
  a1/ /    . b1    .
   /_/ . . . . . . .
   a2

*/

const defaultParams = {
  // holder

  h1: 5,
  h2: 10,
  h3: 20,

  d1: 4,
  d2: 8,

  p: 0.6,

  fillet: 5,

  width: 150,

  // sticks

  a1: 2,
  a2: 2,

  b1: 10,
  b2: 100,

  stickWidth: 6,
  stickEdgeDistance: 20,

  // angle ratio
  // For each N millimeters on the Y axis, pencil will be moved N/ratio on the X axis
  ratio: 10,

  // 3d printing snap fit tolerance
  tolerance: 0.3,
};

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = (
  { makeBox, draw },
  {
    h1,
    h2,
    h3,
    d1,
    d2,
    p,
    fillet,
    width,
    a1,
    a2,
    b1,
    b2,
    stickWidth,
    stickEdgeDistance,
    ratio,
    tolerance,
  },
) => {
  const offset = 0.01;
  const toleranceHalf = tolerance / 2;

  const holderOutline = draw([0, 0])
    .line(h2 / ratio, h2)
    .line(d1, 0)
    .line(-(h2 - h1) / ratio, -(h2 - h1))
    .line(p, 0)
    .line((h3 - h1) / ratio, h3 - h1)
    .line(d2, 0)
    .line(h3 / ratio, -h3)
    .close();

  const holderFillet = Math.min(fillet, h2 - h1);

  const holder = holderOutline
    .sketchOnPlane("XZ")
    .extrude(width)
    .fillet(holderFillet, (e) => {
      // point at mid d1
      return e.containsPoint([h2 / ratio + d1 / 2, 0, h2]);
    })
    .fillet(holderFillet, (e) => {
      // point at mid d2
      return e.containsPoint([h3 / ratio + d1 + p + d2 / 2, 0, h3]);
    })
    .fillet(holderFillet, (e) => {
      // point at mid d1
      return e.containsPoint([h2 / ratio + d1 / 2, -width, h2]);
    })
    .fillet(holderFillet, (e) => {
      // point at mid d2
      return e.containsPoint([h3 / ratio + d1 + p + d2 / 2, -width, h3]);
    });

  const stickOutline = draw([0, 0])
    .line(b1 / ratio, b1)
    .line(-a1, 0)
    .line((b2 - b1) / ratio, b2 - b1)
    .line(a1 + a2, 0)
    .lineTo([a2, 0])
    .close();

  const stickFillet = Math.min(stickWidth * 0.499, fillet);

  const stick = stickOutline
    .sketchOnPlane("XZ")
    .extrude(stickWidth)
    .fillet(stickFillet, (e) => e.containsPoint([b2 / ratio, 0, b2]))
    .fillet(stickFillet, (e) => e.containsPoint([b2 / ratio, -stickWidth, b2]))
    .translateY(stickWidth * 2);

  const holeOutline = draw([-toleranceHalf, -toleranceHalf])
    .line((b1 + tolerance) / ratio, b1 + tolerance)
    .line(a2 + tolerance, 0)
    .lineTo([a2 + toleranceHalf, -toleranceHalf])
    .close();

  const hole = holeOutline
    .sketchOnPlane("XZ")
    .extrude(stickWidth + tolerance)
    .translateX(-toleranceHalf);

  const hole1 = hole
    .clone()
    .translateZ(h3 - b1)
    .translateX(d1 + p + (h3 - b1) / ratio + a1 + toleranceHalf)
    .translateY(-stickEdgeDistance + toleranceHalf);

  const hole2 = hole
    .clone()
    .translateZ(h3 - b1)
    .translateX(d1 + p + (h3 - b1) / ratio + a1 + toleranceHalf)
    .translateY(-width + stickWidth + stickEdgeDistance + toleranceHalf);

  return [
    {
      shape: holder.cut(hole1).cut(hole2),
      name: "Holder",
      color: "#67c",
      // opacity: 0.5
    },
    {
      shape: stick,
      name: "Stick",
      color: "#c67",
    },
    {
      shape: stick.clone().translateY(stickWidth + 2),
      name: "Stick",
      color: "#c67",
    },
    // {
    //   shape: hole1,
    //   color: "#6c7",
    // },
    // {
    //   shape: hole2,
    //   color: "#6c7",
    // },
  ];
};
