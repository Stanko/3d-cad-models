export const defaultParams = {
  preview: true,
};

/** Voxelated ship from my game SpaceDeck X.
 *
 * This model was given as a trophy for a hi-score tournament when the game was released on the arcade cabinet.
 */

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {(replicad: replicadLib) => any} */
export const main = (
  { makeBox, makeCylinder, draw, drawRoundedRectangle, drawRectangle },
  { preview },
) => {
  const layerMaps = {
    lowerHull: `

        OO
       XOOX
       XOOX
       OOOO
       OiiO
       iiii
       iiii
       iiii
       iOOi
       OOOO
       OOOO
       OOOO
       OOOO
       OOOO
       XOOX
       XOOX
       XOOX
       XXXX
`,

    mainHull: `
        XX
       XOOX
       XOOX
       XOOX
      XOOOOX
      XOiiOX
      XiiiiX
      XiiiiX
     XXiiiiXX
    XOXiOOiXOX
   XOOXOOOOXOOX
  XOOOXOOOOXOOOX
 XOOOOXOOOOXOOOOX
XOXXOOXOOOOXOOXXOX
XOOOXXXOOOOXXXOOOX
XOOOOOOXOOXOOOOOOX
 XXXXOOXOOXOOXXXX
     XXX  XXX
       X  X
`,

    upperHull: `


        OO
        OO
       OOOO
       OiiO
       iiii
       iiii
       iiii
       iOOi
       OOOO
       OOOO
       OOOO
x      OOOO      x
x      OOOO      x
x      XOOX      x
       XOOX
       XOOX
       XXXX
`,

    sideRails: `









     x      x
    xx      xx
   xxx      xxx
  xxxx      xxxx
    xx      xx

`,

    cockpit: `





        ii
       iiii
       iiii
       iiii
       i  i
`,

    canopy: `






        ii
        ii
        ii

`,
  };

  const CELL = 5;
  const FIT = 0.1;
  const ZERO = 0;

  const fuseAll = (shapes) =>
    shapes.reduce((model, shape) => (model ? model.fuse(shape) : shape), null);

  const makeLayer = (map, z = 0, h = 1) => {
    const strips = [];

    map.split("\n").forEach((row, y) => {
      // Each non-space run becomes one rectangular strip instead of one box per cell.
      for (const run of row.matchAll(/\S+/g)) {
        const x = run.index;
        strips.push(
          makeBox(
            [x * CELL, y * CELL, z * CELL],
            [(x + run[0].length) * CELL, (y + 1) * CELL, (z + h) * CELL],
          ),
        );
      }
    });

    return fuseAll(strips);
  };

  const armShipConnectorWidth = 1.5;
  const armShipConnector = drawRectangle(
    armShipConnectorWidth * CELL,
    1.1 * CELL,
    0.5,
  )
    .sketchOnPlane("XY")
    .extrude(CELL * 1)
    .rotate(15, [0, 0, 0], [0, 0, 1])
    .translate([4.9 * CELL, 14.6 * CELL, 0 * CELL]);

  const armShipCut = drawRectangle(
    1 * CELL + FIT * 2,
    armShipConnectorWidth * CELL + FIT * 2,
  )
    .sketchOnPlane("XY")
    .extrude(CELL * 3)
    .translate([9 * CELL, 14 * CELL, -2 * CELL]);

  const lowerHull = makeLayer(layerMaps.lowerHull, -1);
  const mainHull = makeLayer(layerMaps.mainHull);
  const upperHull = makeLayer(layerMaps.upperHull, 1);
  const sideRails = makeLayer(layerMaps.sideRails, 1, 0.5);
  const cockpit = makeLayer(layerMaps.cockpit, 2, 0.5);
  const canopy = makeLayer(layerMaps.canopy, 2.5, 0.5);

  const makeConnector = (r, h, x, y, z, fit = FIT) => {
    const radius = r * CELL;
    const height = h * CELL;
    const place = (shape) =>
      shape
        .translateX(x * CELL)
        .translateY(y * CELL)
        .translateZ(z * CELL - ZERO);

    // Slightly undersized pegs give the printed parts room to fit together.
    return {
      hole: place(makeCylinder(radius, height)),
      peg: place(makeCylinder(radius - fit, height * 0.8)),
    };
  };

  const lowerFront = makeConnector(0.5, 1, 9, 6, 0, 0.75 * FIT);
  const lowerRear = makeConnector(0.5, 1, 9, 16, 0, 0.75 * FIT);
  const upperRear = makeConnector(0.4, 0.7, 9, 9, 2);
  const upperFront = makeConnector(0.4, 0.7, 9, 8, 2);

  const lowerPart = lowerHull
    .fuse(lowerFront.peg)
    .fuse(lowerRear.peg)
    .cut(armShipCut);
  const middlePart = mainHull
    .fuse(upperHull)
    .fuse(sideRails)
    .cut(lowerFront.hole)
    .cut(lowerRear.hole)
    .fuse(upperRear.peg)
    .fuse(upperFront.peg);
  const topPart = cockpit.fuse(canopy).cut(upperRear.hole).cut(upperFront.hole);

  const p1 = [
    "  XXXXXXX  ",
    " XXXXXXXXX ",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    " XXXXXXXXX ",
    "  XXXXXXX  ",
  ].join("\n");
  const p2 = [
    "",
    "   XXXXX   ",
    "  XXXXXXX  ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    " XXXXXXXXX ",
    "  XXXXXXX  ",
    "   XXXXX   ",
  ].join("\n");
  const p3 = [
    "",
    "",
    "    XXX",
    "    XxX",
    "    XxX",
    "    XxX",
    "    XXX",
  ].join("\n");

  const arm = [
    "xxx",
    "xxx",
    "xxx",
    "xxx",
    "xxx",
    " xx",
    " xxx",
    " xxx",
    "  xx",
    "  XXX",
    "  XXX",
    "   XX",
    "   XXX",
    "   XXX",
    "    XX",
    "    XX",
  ].join("\n");

  const cut1 = drawRectangle(5.5 * CELL, 1 * CELL)
    .sketchOnPlane("XY")
    .extrude(CELL)
    .rotate(15, [0, 0, 0], [0, 0, 1])
    .translate([4.85 * CELL, 14.85 * CELL, 0]);

  const pedestal1 = makeLayer(p1, 0);
  const pedestal2 = makeLayer(p2, 1);
  const pedestal3 = makeLayer(p3, 2);
  const pedestal4 = drawRectangle(1 * CELL + 2 * FIT, 3 * CELL + 2 * FIT)
    .sketchOnPlane("XY")
    .extrude(CELL * 5)
    .translate([5.5 * CELL + FIT, 4.5 * CELL + FIT, 1 * CELL]);

  const pedestalArm = makeLayer(arm, 0).translateY(-CELL).cut(cut1);

  if (preview) {
    const pedestalArmRotated = pedestalArm
      .rotate(90, [0, 0, 0], [1, 0, 0])
      .rotate(90, [0, 0, 0], [0, 0, 1])
      .translateX(CELL * 5)
      .translateY(CELL * 3)
      .translateZ(CELL * 2);

    return [
      {
        shape: pedestal1
          .fuse(pedestal2)
          .fuse(pedestal3)
          .fuse(pedestalArmRotated)
          .rotate(180, [0, 0, 0], [0, 0, 1])
          .translateX(14.5 * CELL)
          .translateY(21 * CELL),
        color: "#445",
      },
      {
        shape: lowerPart
          .rotate(-15, [0, 0, 0], [1, 0, 0])
          .translateZ(CELL * 21),
        color: "#445",
      },

      {
        shape: middlePart
          .rotate(-15, [0, 0, 0], [1, 0, 0])
          .translateZ(CELL * 21),
        color: "#556",
      },

      {
        shape: topPart.rotate(-15, [0, 0, 0], [1, 0, 0]).translateZ(CELL * 21),
        color: "#dde",
      },
    ];
  } else {
    return [
      {
        shape: pedestalArm
          .cut(cut1)
          .fuse(armShipConnector)
          .translateX(-8 * CELL),
        color: "#445",
        name: "pedestal-arm",
      },
      {
        shape: pedestal1.fuse(pedestal2).fuse(pedestal3).cut(pedestal4),
        color: "#445",
        name: "pedestal",
      },
      {
        shape: lowerPart
          .cut(armShipCut)
          .translateX(CELL * 6)
          .translateZ(CELL),
        color: "#445",
        name: "lower",
      },
      {
        shape: middlePart.translateX(CELL * 20),
        color: "#445",
        name: "mid",
      },

      {
        shape: topPart.translateX(CELL * 30).translateZ(-2 * CELL),
        color: "#dde",
        name: "top",
      },
    ];
  }
};
