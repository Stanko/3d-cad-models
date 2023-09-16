const defaultParams = {
  r: 90,
  angle: 42.3167,
  width: 10,
  cut: 10,
  curveHeightFactor: 1,
  curveDepthFactor: 0.75,
};

const { cos, sin, PI, SQRT2 } = Math;

const nothing = 0.00001;
const fit = 0.1;

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = (
  { draw, makeBaseBox },
  { r, angle, width, cut, curveHeightFactor, curveDepthFactor }
) => {
  const angleInRad = (angle / 180) * Math.PI;

  const t1 = {
    height: Math.sin(angleInRad) * r,
    width,
  };
  const t2 = {
    height: nothing,
    width: nothing,
    position: Math.cos(angleInRad) * r,
  };

  const triangle1 = draw()
    .movePointerTo([t1.width / 2, 0])
    .lineTo([0, t1.height])
    .lineTo([-t1.width / 2, 0])
    .close()
    .sketchOnPlane('YZ');

  const triangle2 = draw()
    .movePointerTo([t2.width / 2, 0])
    .lineTo([0, t2.height])
    .lineTo([-t2.width / 2, 0])
    .close()
    .sketchOnPlane('YZ', t2.position);

  const base = triangle1.loftWith(triangle2);

  const box = makeBaseBox(t2.position, width * 2, t1.height * 2)
    .translateX(t2.position * 1.5 - cut)
    .translateZ(t1.height * -0.5);

  const k = t1.height * curveDepthFactor * 0.1;
  const h = t1.height * curveHeightFactor;
  const curve = draw()
    .movePointerTo([0, h])
    .bezierCurveTo(
      [k, h * 0.5],
      [
        [0, h * 0.8],
        [k, h * 0.7],
      ]
    )
    .bezierCurveTo(
      [0, 0],
      [
        [k, h * 0.3],
        [0, h * 0.2],
      ]
    )
    .lineTo([-1, 0])
    .lineTo([-1, t1.height])
    .close()
    .sketchOnPlane('XZ')
    .extrude(width * 2)
    .translateY(width);

  return [
    // {
    //   shape: curve,
    //   color: '#44a',
    // },
    // {
    //   shape: base,
    //   color: '#a4a',
    // },
    // {
    //   shape: box,
    //   color: '#44a',
    // },
    {
      shape: base.cut(box).cut(curve),
      // color: '#a4a',
    },
  ];
};
