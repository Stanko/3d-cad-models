const { cuboid, cylinderElliptic } = require('@jscad/modeling').primitives
const { union, subtract } = require('@jscad/modeling').booleans
 
const main = (params) => {
  const object = cuboid({
    size: [100, params.innerWidth, params.innerHeight],
  });

  const halfThickness = params.wallThickness / 2;

  const bottom = {
    depth: params.bracketWidth,
    width: params.innerWidth + 2 * params.wallThickness,
    height: params.wallThickness,
  }

  const side = {
    depth: params.bracketWidth,
    width: params.wallThickness,
    height: params.innerHeight + 2 * params.wallThickness,
  }

  const arm = {
    depth: params.bracketWidth, 
    width: (params.innerWidth / 100 * params.armsLength) + params.wallThickness, 
    height: params.wallThickness,
  }
  
  const walls = [
    // bottom
    cuboid({
      size: [
        bottom.depth, 
        bottom.width,
        bottom.height,
      ],
      center: [
        0, 
        0,
        params.wallThickness / 2,
      ]
    }),
    // sides
    cuboid({
      size: [
        side.depth, 
        side.width,
        side.height,
      ],
      center: [
        0, 
        bottom.width / 2 - halfThickness,
        side.height / 2,
      ]
    }),
    cuboid({
      size: [
        side.depth, 
        side.width,
        side.height,
      ],
      center: [
        0, 
        bottom.width / -2 + halfThickness,
        side.height / 2,
      ]
    }),
    // top arms
    cuboid({
      size: [
        arm.depth, 
        arm.width,
        arm.height,
      ],
      center: [
        0,
        (bottom.width - arm.width) / 2,
        side.height - halfThickness,
      ],
    }),
    cuboid({
      size: [
        arm.depth, 
        arm.width,
        arm.height,
      ],
      center: [
        0,
        (bottom.width - arm.width) / -2,
        side.height - halfThickness,
      ],
    }),
  ];

  let bracket = union(...walls);

  const endRadius = params.holeDiameterTop / 2;
  const startRadius = params.holeDiameterBottom / 2;

  const hole = cylinderElliptic({
    height: params.wallThickness,
    endRadius: [endRadius, endRadius],
    startRadius: [startRadius, startRadius],
    center: [
      0,
      0,
      halfThickness
    ]
  });

  bracket = subtract(bracket, hole);


  return [
    // object,
    bracket,
  ]
}



const getParameterDefinitions = () => {
  return [
    { name: 'innerWidth', type: 'float', initial: 62, caption: 'Inner length' }, 
    { name: 'innerHeight', type: 'float', initial: 46, caption: 'Inner width' },
    { name: 'wallThickness', type: 'float', initial: 4, caption: 'Wall thickness' },
    { name: 'armsLength', type: 'float', initial: 30, caption: 'Arms length (10 - 40%)' },
    { name: 'bracketWidth', type: 'float', initial: 30, caption: 'Bracket Width' },
    { name: 'holeDiameterTop', type: 'float', initial: 12, caption: 'Hole top diameter' },
    { name: 'holeDiameterBottom', type: 'float', initial: 6, caption: 'Hole bottom diameter' },
  ]
}
 
module.exports = { main, getParameterDefinitions }

