// Washer for a window handle like this one:
// https://www.gamma.nl/assortiment/axa-raamsluiting-met-drukknop-links-aluminium/p/B139628
const { draw, drawCircle, drawRectangle, drawRoundedRectangle } = replicad;

const defaultParams = {
  width: 30,
  height: 74,
  radius: 5,
  depth: 1.5,
  screwDiameter: 4,
  offset: 1,
};

const main = ({}, params) => {
  const { width, height, radius, depth, screwDiameter, offset } = params;

  const r = screwDiameter / 2;

  const xDistance = 16;
  const yDistance = height - (width - xDistance);

  const w = width + 2 * offset;
  const h = height + 2 * offset;

  const base = drawRoundedRectangle(h, w, radius)
    .sketchOnPlane('YX')
    .extrude(depth);

  const screw = drawCircle(r)
    .sketchOnPlane('YX')
    .extrude(depth * 10)
    .translateZ(depth * 4);

  const screw1 = screw
    .clone()
    .translateX(xDistance / 2)
    .translateY(yDistance / 2);
  const screw2 = screw
    .clone()
    .translateX(xDistance / -2)
    .translateY(yDistance / 2);

  const screw3 = screw
    .clone()
    .translateX(xDistance / 2)
    .translateY(yDistance / -2);
  const screw4 = screw
    .clone()
    .translateX(xDistance / -2)
    .translateY(yDistance / -2);

  return [base.cut(screw1).cut(screw2).cut(screw3).cut(screw4)];
};
