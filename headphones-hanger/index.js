require('@jscad/modeling').primitives;
const { path2 } = require('@jscad/modeling').geometries;
const { expand } = require('@jscad/modeling').expansions;
const { extrudeLinear } = require('@jscad/modeling').extrusions;

const main = (params) => {
  const { width, wallThickness, depth, shelfThickness, hookHeight } = params;

  const corner = wallThickness;
  const hookTooth = hookHeight * 0.3;
  const bottom = wallThickness * 2.5 + shelfThickness + hookHeight;
  const right = wallThickness * 1.5 + depth;

  let lineProfile = path2.create([
    [wallThickness * 0.5, wallThickness * 0.5],
    [right, wallThickness * 0.5],
    [right, wallThickness * 1.5 + shelfThickness],
    [wallThickness * 0.5, wallThickness * 1.5 + shelfThickness],

    [wallThickness * 0.5, bottom - corner],
    [wallThickness * 0.5 + corner, bottom],

    [right - corner, bottom],
    [right, bottom - corner],

    [right, bottom - corner - hookTooth],
  ]);

  const outline = expand(
    { delta: wallThickness * 0.5, corners: 'round' },
    lineProfile
  );

  const hook = extrudeLinear({ height: width }, outline);

  return [lineProfile, outline, hook];
};

const getParameterDefinitions = () => {
  return [
    { name: 'width', type: 'float', initial: 25, caption: 'Width' },
    { name: 'depth', type: 'float', initial: 40, caption: 'Depth' },
    {
      name: 'shelfThickness',
      type: 'float',
      initial: 30,
      caption: 'Shelf thickness',
    },
    { name: 'hookHeight', type: 'float', initial: 40, caption: 'Hook height' },
    {
      name: 'wallThickness',
      type: 'float',
      initial: 3,
      caption: 'Material thickness',
    },
  ];
};

module.exports = { main, getParameterDefinitions };
