export const defaultParams = {};

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
export const main = ({ makeCylinder, drawCircle }) => {
  const makeCone = (r1, r2, h) => {
    const bot = drawCircle(r1).sketchOnPlane("XY");
    return drawCircle(r2).sketchOnPlane("XY", h).loftWith(bot);
  };
  const none = 0.001;

  const outerRadius = 120;
  const innerRadius = 70;
  const t = 2;
  const innerH = 22;

  const makeScrew = (r1, r2, angle) => {
    return makeCone(r1, r2, t + 2 * none)
      .translateZ(-none)
      .translateX(Math.cos(angle) * (outerRadius - 10))
      .translateY(Math.sin(angle) * (outerRadius - 10));
  };

  const screw1 = makeScrew(2, 4, 0);
  const screw2 = makeScrew(2, 4, (Math.PI * 2) / 3);
  const screw3 = makeScrew(2, 4, (Math.PI * 2) / -3);

  const inner = makeCylinder(innerRadius, innerH).translateZ(-none);
  const outer = makeCylinder(innerRadius + t, innerH + t).translateZ(none);
  const base = makeCone(outerRadius, outerRadius - t * 0.75, 2)
    .fuse(outer)
    .cut(inner)
    .fillet(2, (e) => {
      return e.containsPoint([innerRadius + t, 0, innerH + t + none]);
    });

  return [
    {
      shape: base.cut(screw1).cut(screw2).cut(screw3),
      name: "poklopac",
      color: "#67c",
    },
  ];
};

export default main;
