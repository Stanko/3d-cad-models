/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = ({ makeCylinder, makeBox }) => {
  const none = 0.001;

  const innerRadius = 23;
  const height = 2 + 2 * 2;
  const t = 1.5;
  const inner = makeCylinder(innerRadius, height * 2).translateZ(-none);
  const outer = makeCylinder(innerRadius + t, height);
  const gapOffset = 0.3; // gap = gapOffset * 2
  const lockLength = 6;
  const screwHoleRadius = 1.2;

  const boxCut = makeBox(
    [0, -gapOffset, -none],
    [10, gapOffset, height * 2],
  ).translateX(innerRadius - t);
  const box = makeBox(
    [0, -t - gapOffset, 0],
    [lockLength + t, t + gapOffset, height],
  ).translateX(innerRadius);

  const screwHoleLength = 20;
  const screwHole = makeCylinder(screwHoleRadius, screwHoleLength)
    .rotate(90, [0, 0, 0], [1, 0, 0])
    .translateY(screwHoleLength / 2)
    .translateZ(height / 2)
    .translateX(innerRadius + t + lockLength / 2);

  return [
    {
      shape: outer
        .fuse(box)
        .fillet(t / 2) // optional
        .cut(boxCut)
        .cut(inner)
        .cut(screwHole),
      name: "ring",
      color: "#67c",
    },
  ];
};
