export const defaultParams = {};

const nothing = 0.00001;

export const main = ({ drawCircle, drawRoundedRectangle }) => {
  const woodThickness = 20.5;
  const wall = 8;
  const height = 40;
  const width = 25;

  const legHeight = 17;

  const thickness = woodThickness + 2 * wall;

  const outerRadius = thickness * 0.3;
  const innerRadius = woodThickness * 0.3;

  const screwInnerRadius = 1.6;
  const screwOuterRadius = 3;
  const screwHeadDepth = Math.min(2.5, wall * 0.5);

  const base = drawRoundedRectangle(thickness, height, outerRadius)
    .sketchOnPlane("XY")
    .extrude(width)
    .fillet(wall * 0.5);

  const hole = drawRoundedRectangle(woodThickness, height, innerRadius)
    .sketchOnPlane("XY")
    .extrude(width)
    .translateY(legHeight);

  const screwHoleInner = drawCircle(screwInnerRadius)
    .sketchOnPlane("ZY")
    .extrude(100)
    .translateX(50)
    .translateZ(width / 2);

  const screwHoleOuter1 = drawCircle(screwOuterRadius)
    .sketchOnPlane("ZY")
    .extrude(30)
    .translateX(woodThickness / -2 - wall + screwHeadDepth)
    .translateZ(width / 2);

  const screwHoleOuter2 = drawCircle(screwOuterRadius)
    .sketchOnPlane("YZ")
    .extrude(30)
    .translateX(woodThickness / 2 + wall - screwHeadDepth)
    .translateZ(width / 2);

  const screwHoleParts = screwHoleInner
    .fuse(screwHoleOuter1)
    .fuse(screwHoleOuter2)
    .translateY(height / 2 - outerRadius - screwOuterRadius);

  return [
    {
      shape: base.cut(hole).cut(screwHoleParts),
      color: "#67c",
      // color: 'rgba(50, 70, 200, 0.5)',
    },
  ];
};
