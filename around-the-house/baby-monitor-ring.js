export const defaultParams = {};

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */

export const main = ({ makeCylinder, makeBox }) => {
  const none = 0.001;

  const innerRadius = 23;
  const height = 2 + 2 * 3;
  const t = 1.5;
  const inner = makeCylinder(innerRadius, height * 2).translateZ(-none);
  const outer = makeCylinder(innerRadius + t, height);
  const gapOffset = 0.75; // gap = gapOffset * 2
  const lockLength = 8;
  const screwHoleRadius = 2;

  const antennaW = 15.5;
  const antennaH = 2.8;
  const antenna = makeBox(
    [0, -antennaW / 2, 0],
    [antennaH + t, antennaW / 2, height],
  ).translateX(innerRadius);

  const aLeft = makeBox(
    [0, -t - antennaW / 2, 0],
    [10, -antennaW / 2, height],
  ).translateX(15.5);
  const aRight = makeBox(
    [0, t + antennaW / 2, 0],
    [10, antennaW / 2, height],
  ).translateX(15.5);

  const innerA = makeCylinder(innerRadius + antennaH, height * 2).translateZ(
    -none,
  );
  const outerA = makeCylinder(innerRadius + antennaH + t, height);
  const boxLeft = makeBox([-50, -t - antennaW / 2, 0], [50, -50, height]);
  const boxRight = makeBox([-50, t + antennaW / 2, 0], [50, 50, height]);
  const boxBack = makeBox([0, -50, 0], [-50, 50, height]);
  const outterRing = outerA.cut(innerA).cut(boxLeft).cut(boxRight).cut(boxBack);

  const boxCut = makeBox(
    [0, -gapOffset, -none],
    [20, gapOffset, height * 2],
  ).translateX(innerRadius - t);
  const boxCut2 = makeBox(
    [0, -antennaW / 2, -none],
    [3, antennaW / 2, height * 2],
  ).translateX(innerRadius - t);
  const box = makeBox(
    [0, -t - gapOffset, 0],
    [lockLength + t, t + gapOffset, height],
  ).translateX(innerRadius + antennaH);

  const screwHoleLength = 20;
  const screwHole = makeCylinder(screwHoleRadius, screwHoleLength)
    .rotate(90, [0, 0, 0], [1, 0, 0])
    .translateY(screwHoleLength / 2)
    .translateZ(height / 2)
    .translateX(innerRadius + t + antennaH + lockLength / 2);

  return [
    {
      shape: outer
        .fuse(box)
        .fuse(aLeft)
        .fuse(aRight)
        .fuse(outterRing)
        .cut(boxCut)
        .cut(boxCut2)
        .cut(inner)
        .fillet(0.7)
        .cut(screwHole),
      name: "ring",
      color: "#67c",
    },
  ];
};
