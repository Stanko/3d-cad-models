/**
 * Another version of the gnomon for my father. Three parts, snap fit.
 */
export const defaultParams = {
  angle: 45,
  radius: 40,
  totalLength: 100,
  shaftRadius: 5,
  wallThickness: 1.5,
  screwShaftDiameter: 2,
  screwHeadDiameter: 4.5,
  topRadius: 8,
  topHeight: 20,
};

// TODO - rename parameter and variable names

const nothing = 0.001;
const fit = 0.1;

const shaftConnectionLonger = 6;
const shaftConnectionShorter = shaftConnectionLonger * 0.8;

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
export const main = (
  { Sketcher, draw, drawCircle, drawRectangle },
  {
    angle,
    radius,
    totalLength,
    wallThickness,
    screwShaftDiameter,
    screwHeadDiameter,
    topRadius,
    topHeight,
    shaftRadius,
  },
) => {
  // Triangle
  const angleInRad = (angle / 180) * Math.PI;
  const oppositeAngleInRad = ((90 - angle) / 180) * Math.PI;

  const x = Math.cos(angleInRad) * radius;
  const y = Math.sin(angleInRad) * radius;

  const thickness = shaftRadius * 2;

  const cutTheTriangle = drawCircle(thickness)
    .sketchOnPlane("XY")
    .extrude(30)
    .translateZ(radius)
    .translateX(-thickness / 2)
    .rotate(90 - angle, [0, 0, 0], [0, 1, 0]);

  const triangle = draw([-wallThickness, 0])
    .lineTo([x, y + wallThickness])
    // .lineTo([x * 0.9, y * 0.5])
    // .lineTo([x * 1.5, 0])
    .bezierCurveTo(
      [x * 1.5, 3],
      [
        [x, y * 0.75],
        [x, y * 0.25 + 3],
      ],
    )
    .lineTo([x * 1.5 + 1, 0])
    .close()
    .sketchOnPlane("XZ")
    .extrude(thickness * 0.5)
    .translateY(thickness * 0.25)
    .cut(cutTheTriangle);

  const b = thickness * Math.tan(oppositeAngleInRad);
  const hypotenuse = Math.sqrt(b * b + thickness * thickness);

  const screw = drawCircle(screwShaftDiameter / 2)
    .sketchOnPlane("XY")
    .extrude(30)
    .translateZ(-nothing);

  const screwHead = drawCircle(screwHeadDiameter / 2)
    .sketchOnPlane("XY")
    .extrude(30);

  const baseScrew1 = screw.clone().translateX(hypotenuse / -2);

  const baseScrewHead1 = screwHead
    .clone()
    .translateZ(Math.tan(angleInRad) * (hypotenuse / 2))
    .translateZ(screwHeadDiameter / -2)
    .translateX(hypotenuse / -2);

  const baseScrew2 = screw.clone().translateX(radius - 3);

  const baseScrewHead2 = screwHead
    .clone()
    .translateZ(Math.tan(angleInRad) * (hypotenuse / 2))
    .translateZ(screwHeadDiameter / -2)
    .translateX(radius - 3);

  const basePlaneCube = drawRectangle(200, 200)
    .sketchOnPlane("XY")
    .extrude(50)
    .translateZ(-50);

  const rodBaseOffset = thickness * 4;
  const rodBaseHeight = radius + rodBaseOffset;

  const getRodeBase = (height = rodBaseHeight) => {
    const rodBase = drawCircle(thickness / 2 - wallThickness)
      .sketchOnPlane("XY")
      .extrude(height);
    return rodBase;
  };

  const rodBase = getRodeBase().translateZ(
    rodBaseHeight - shaftConnectionLonger,
  );

  const base = drawCircle(thickness / 2)
    .sketchOnPlane("XY")
    .extrude(rodBaseHeight)
    .cut(rodBase)
    .translateX(thickness * -0.5)
    .translateZ(-rodBaseOffset)
    .rotate(90 - angle, [0, 0, 0], [0, 1, 0])
    .cut(basePlaneCube)
    .fuse(triangle)
    .cut(baseScrew1)
    .cut(baseScrewHead1)
    .cut(baseScrew2)
    .cut(baseScrewHead2);

  // extension

  const extensionOuterHeight = totalLength - hypotenuse - topHeight;
  const extensionInneright = extensionOuterHeight + shaftConnectionShorter * 2;
  const extensionOuter = drawCircle(shaftRadius)
    .sketchOnPlane("XY")
    .extrude(extensionOuterHeight);
  const extensionInner = drawCircle(shaftRadius - wallThickness - fit)
    .sketchOnPlane("XY")
    .extrude(extensionInneright)
    .translateZ(-shaftConnectionShorter);

  // top

  const cone = draw([0, 0])
    .lineTo([topRadius, 0])
    .lineTo([0, topHeight])
    .close()
    .sketchOnPlane("XZ")
    .revolve();

  const topCut = getRodeBase(shaftConnectionLonger);

  return [
    {
      shape: base,
      color: "#56b",
      name: "Base",
    },
    {
      shape: extensionOuter
        .fuse(extensionInner)
        .translateY(-40)
        .translateZ(shaftConnectionShorter),
      color: "#5b6",
      name: "Shaft",
    },
    {
      shape: cone.cut(topCut).translateY(-20),
      color: "#b56",
      name: "Top",
    },
  ];
};
