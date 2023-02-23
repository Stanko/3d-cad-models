const { draw, drawCircle, drawRectangle } = replicad;

// Tiny value to prevent z fighting
const NOTHING = 0.0001;

function getMagnetHolder({ shaftRadius, wall, magnetRadius, magnetHeight }) {
  const magnetDiameter = magnetRadius * 2;

  const offsetForJoining = 3;
  const h = magnetDiameter + wall * 2;
  const w = magnetDiameter + wall * 2 + offsetForJoining;

  const topHeight = magnetHeight + wall;

  const angle = (Math.PI / 180) * 45;
  const angleCos = Math.cos(angle);
  const angleSin = Math.sin(angle);
  const bottomExtrusion = 20;
  const extrusionDirection = [-angleCos, 0, -angleSin];
  const bottomHeight = Math.sin(angle) * bottomExtrusion;

  const magnet = drawCircle(magnetRadius)
    .sketchOnPlane('XY')
    .extrude(magnetHeight)
    .translateZ(-magnetHeight + NOTHING)
    .translate(offsetForJoining * 0.5);

  const holderProfile = drawRectangle(w, h).fillet(h * 0.5 - NOTHING, (e) => {
    return e.inBox([0, h * -0.5], [w * 0.5, h * 0.5]);
  });

  const holderBottom = holderProfile
    .sketchOnPlane('XY')
    .extrude(bottomExtrusion, {
      extrusionDirection,
    })
    .translateX(w * 0.5)
    .translateZ(-topHeight + NOTHING);

  const holderTop = holderProfile
    .sketchOnPlane('XY')
    .extrude(topHeight, {
      extrusionDirection: [0, 0, -1],
    })
    .cut(magnet)
    .translateX(w * 0.5);

  const shaftChord = h;
  const arcAngle = Math.asin(shaftChord / (2 * shaftRadius));
  const shaftHeight = (topHeight + bottomHeight) * 2;

  const fuseX = (1 - Math.cos(arcAngle)) * shaftRadius;

  const shaft = drawCircle(shaftRadius - NOTHING)
    .sketchOnPlane('XY')
    .extrude(shaftHeight)
    .translateX(-shaftRadius)
    .translateZ(-shaftHeight + NOTHING);

  const holder = holderTop.fuse(holderBottom).translateX(-fuseX).cut(shaft);

  return holder;
}

function getShaft({ penRadius, shaftRadius, height, wall }) {
  const inner = drawCircle(penRadius)
    .sketchOnPlane('XY')
    .extrude(-height + wall);
  const shaft = drawCircle(shaftRadius).sketchOnPlane('XY').extrude(-height);

  return shaft.cut(inner);
}

function getPart(params) {
  const { shaftRadius } = params;

  const leftHolder = getMagnetHolder(params).translateX(shaftRadius);

  const rightHolder = getMagnetHolder(params)
    .mirror('YZ')
    .translateX(-shaftRadius);

  const shaft = getShaft(params);

  return shaft.fuse(leftHolder).fuse(rightHolder).translateZ(params.height);
}

function getBottomPart(params) {
  const { penRadius, wall, holeRadius, speedHoles, height } = params;

  let bottom = getPart(params);

  if (speedHoles) {
    const speedHoleRadius = penRadius * 0.48;
    const speedHole = drawCircle(speedHoleRadius)
      .sketchOnPlane('XZ')
      .extrude(5)
      .translateY(2.5);
    const r = penRadius + wall * 0.5;
    const zStep = speedHoleRadius * 1.5;
    const zStart = speedHoleRadius * 2;
    const n = 3;
    const angleStep = (Math.PI / n) * 2;
    const angleStepDeg = 360 / n;

    const count = Math.floor((height * 0.8) / zStep);

    for (let z = 0; z < count; z++) {
      const angleOffset = z % 2 === 0 ? angleStep / 2 : 0;
      const angleOffsetDeg = z % 2 === 0 ? angleStepDeg / 2 : 0;

      for (let i = 0; i < n; i++) {
        const angle = angleStep * i + angleOffset;

        const h = speedHole
          .clone()
          .rotate(90 + angleOffsetDeg + angleStepDeg * i)
          .translateX(Math.cos(angle) * r)
          .translateY(Math.sin(angle) * r)
          .translateZ(z * zStep + zStart);

        bottom = bottom.cut(h);
      }
    }
  }

  const hole = drawCircle(holeRadius)
    .sketchOnPlane('XY')
    .extrude(10)
    .translateZ(-5);

  return bottom.cut(hole);
}

function getSpringyPart(params) {
  const {
    peekHeight,
    penRadius,
    topPartHeight,
    springShaftRadius,
    springShaftHoleRadius,
  } = params;

  const radius = penRadius - 0.5;

  const baseHeight = 1.5;
  const shaftHeight = topPartHeight + peekHeight;

  const base = drawCircle(radius).sketchOnPlane('XY').extrude(baseHeight);

  const shaft = drawCircle(springShaftRadius)
    .sketchOnPlane('XY')
    .extrude(shaftHeight)
    .fillet(baseHeight * 0.5)
    .translateZ(NOTHING);

  const shaftHoleSize = springShaftRadius * 10;
  const shaftHole = drawCircle(springShaftHoleRadius)
    .sketchOnPlane('YZ')
    .extrude(shaftHoleSize)
    .translateX(shaftHoleSize * -0.5)
    .translateZ(shaftHeight - peekHeight * 0.5);

  return base.fuse(shaft).cut(shaftHole);
}

const defaultParams = {
  // Both penRadius and holeRadius are set for Pigma Micron markers

  // Inner radius of the tool, make sure it is nice and tight for the pen you are using
  penRadius: 10.65,
  // Hole radius, through which the tip of the pen goes through
  holeRadius: 8.7,
  bottomPartHeight: 100,
  topPartHeight: 20,
  wall: 1,
  // Parts are connected using magnets, in the past I used 5x2mm ones from here:
  // https://www.aliexpress.com/item/32961652499.html
  magnetRadius: 5,
  magnetHeight: 2,
  springShaftRadius: 1.5,
  springShaftHoleRadius: 0.5,
  peekHeight: 5,
  // These are here to make the tool more interesting and to reduce 3d printing time
  speedHoles: false,
};

const main = ({}, params) => {
  const {
    penRadius,
    wall,
    bottomPartHeight,
    topPartHeight,
    springShaftRadius,
  } = params;
  const shaftRadius = penRadius + wall;

  const bottom = getBottomPart({
    ...params,
    shaftRadius,
    height: bottomPartHeight,
  });

  const topHole = drawCircle(springShaftRadius + 0.5)
    .sketchOnPlane('XY')
    .extrude(topPartHeight)
    .translateZ(-NOTHING);
  const top = getPart({
    ...params,
    shaftRadius,
    height: topPartHeight,
  })
    .cut(topHole)
    .translateY(shaftRadius * 3);

  // This part resembles a nail, and a compression spring should go over it's shaft (pen spring should work).
  // Then put it through the top part and thread some wire (or a nail) through the hole on the shaft so it can't go back.
  const springy = getSpringyPart(params).translateY(shaftRadius * 6);

  return [bottom, top, springy];
};
