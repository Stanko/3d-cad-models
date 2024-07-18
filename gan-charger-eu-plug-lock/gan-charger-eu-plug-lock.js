const fit = 0.5;

const defaultParams = {};

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = ({ draw, drawRoundedRectangle, makeBaseBox }, {}) => {
  const tOffset = 3;
  const tDepth = 10 + tOffset;
  const tHeight = 5;

  const armWidth = 10;
  const armDepth = 1;
  const armHeight = armDepth * 3;

  const ringHeight = 8 + armHeight + fit;
  const ringWall = 3;
  const ringInnerWidth = 40 + fit;
  const ringInnerDepth = 23 + fit;
  const ringInnerRadius = 6;
  const ringOuterWidth = ringInnerWidth + 2 * ringWall;
  const ringOuterDepth = ringInnerDepth + 2 * ringWall;
  const ringOuterRadius = 8;

  const ringOuter = drawRoundedRectangle(
    ringOuterDepth,
    ringOuterWidth,
    ringOuterRadius
  )
    .sketchOnPlane('XY')
    .extrude(ringHeight);

  const ringInner = drawRoundedRectangle(
    ringInnerDepth,
    ringInnerWidth,
    ringInnerRadius
  )
    .sketchOnPlane('XY')
    .extrude(ringHeight + 2)
    .translateZ(-1);

  const ring = ringOuter.cut(ringInner);

  const t1 = makeBaseBox(tDepth, 3, tHeight);
  const t2 = makeBaseBox(tDepth, 5, 2);
  const t3 = makeBaseBox(tOffset, 3, ringHeight)
    .translateZ(tHeight)
    .translateX((tDepth - tOffset) / -2);

  const t = t1
    .fuse(t2)
    .fuse(t3)
    .translateX((tDepth - ringOuterDepth) * 0.5 - tOffset);

  const arm1 = draw([0, 0])
    .lineTo([-armDepth, armHeight * 0.5])
    .lineTo([0, armHeight])
    .close()
    .sketchOnPlane('XZ')
    .extrude(armWidth)
    .translateY(armWidth / 2)
    .translateX(ringInnerDepth / 2)
    .translateZ(ringHeight - armHeight);

  const arm2 = draw([0, 0])
    .lineTo([armDepth, armHeight * 0.5])
    .lineTo([0, armHeight])
    .close()
    .sketchOnPlane('XZ')
    .extrude(armWidth)
    .translateY(armWidth / 2)
    .translateX(ringInnerDepth / -2)
    .translateZ(ringHeight - armHeight);

  const ringWithArms = ring.fuse(arm1).fuse(arm2).translateZ(tHeight);

  const adapter = ringWithArms.fuse(t);

  return [
    {
      shape: adapter,
      color: '#3b6',
      name: 'adapter',
    },
  ];
};
