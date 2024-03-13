// Work in progress

const defaultParams = {
  hookOuterRadius: 6,
  hookInnerRadius: 2,
  hookWidth: 10,
  hookGap: 2,

  baseWidth: 26,
  backDepth: 4,
  backHeight: 7,

  baseHeight: 4,

  screwDiameter: 3,
  screwDistanceFromEdge: 3,

  radius: 1,
};

const { cos, PI, SQRT2 } = Math;

const nothing = 0.001;
const fit = 0.1;

const innerPipeConnection = 15;
const outerPipeConnection = innerPipeConnection * 0.9;

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = (
  { Sketcher, draw, drawCircle, drawRectangle, makeBaseBox },
  {
    hookOuterRadius,
    hookInnerRadius,
    hookWidth,
    hookGap,
    baseWidth,
    backDepth,
    backHeight,
    baseHeight,
    radius,
    screwDiameter,
    screwDistanceFromEdge,
  }
) => {
  function box(x, y, z, r = 0) {
    return drawRectangle(x, y, r)
      .sketchOnPlane('XY')
      .extrude(z)
      .translateX(x / 2)
      .translateY(y / 2);
  }

  const backWidth = hookWidth; // + 8;

  // ----- HOOK ----- //
  const cylinderOuter = drawCircle(hookOuterRadius)
    .sketchOnPlane('YZ')
    .extrude(hookWidth);

  const cylinderInner = drawCircle(hookInnerRadius)
    .sketchOnPlane('YZ')
    .extrude(hookWidth + 2 * nothing)
    .translateX(-nothing);

  const cylinderCutHeight = hookOuterRadius * 2;
  const cylinderCutSide = Math.max(hookOuterRadius, hookWidth) * 3;
  const cylinderCut = box(cylinderCutSide, cylinderCutSide, cylinderCutHeight)
    .translateX(cylinderCutSide / -2)
    .translateY(cylinderCutSide / -2)
    .translateZ(-cylinderCutHeight);

  const hookX = (baseWidth - hookWidth) / 2;
  const hookY =
    hookOuterRadius +
    (backDepth - (hookOuterRadius - hookInnerRadius)) -
    // Not parametrized, move a little to align with back hook
    0.1;
  const hookZ = baseHeight + hookGap;
  const hook = cylinderOuter
    .cut(cylinderInner)
    .cut(cylinderCut)
    .translateX(hookX)
    .translateY(hookY + nothing)
    .translateZ(hookZ)
    .fillet(radius, (e) => e.inPlane('XY', hookZ));

  // ----- BACK ----- //

  const back = box(backWidth, backDepth, backHeight, radius).translateX(
    (baseWidth - backWidth) / 2
  );
  // .fillet(radius, (e) => e.inPlane('XY', backHeight));

  // ----- BASE ----- //

  const baseDepth = hookY + hookOuterRadius;
  const base = box(baseWidth, baseDepth, baseHeight, baseDepth * 0.3)
    .translateY(nothing)
    .fillet(radius, (e) => e.inPlane('XY', baseHeight));

  // ----- SCREWS ----- //

  const screwRadius = screwDiameter / 2;
  const screw = drawCircle(screwRadius)
    .sketchOnPlane('XY')
    .extrude(backHeight)
    .translateY(baseDepth / 2)
    .translateX(screwRadius)
    .translateZ(-1);

  const screw1 = screw.clone().translateX(screwDistanceFromEdge);
  const screw2 = screw
    .clone()
    .translateX(baseWidth - screwDistanceFromEdge - screwDiameter);

  // ----- ANCHOR ----- //
  const anchor = base.fuse(back).fuse(hook).cut(screw1).cut(screw2);

  return [
    anchor,
    // {
    //   shape: screw1,
    //   color: '#a4a',
    // },
    // {
    //   shape: screw2,
    //   color: '#a4a',
    // },
    // {
    //   shape: hook,
    //   color: '#44a',
    // },
    // {
    //   shape: cylinderOuter,
    //   color: '#a44',
    // },
    // {
    //   shape: cylinderInner,
    //   color: '#4a4',
    // },
    // {
    //   shape: cylinderCut,
    //   color: '#44a',
    // },
  ];
};
