const { cuboid } = require('@jscad/modeling').primitives;
const { union } = require('@jscad/modeling').booleans;

const main = (params) => {
  /*
   */
  const width = 23; // 22 + 1
  const height = 90; // 86 + 2 * 2
  const depth = 11; // 1 + 6 + 3 + 1

  const main = {
    width,
    height,
    depth: 1,
  };
  const side = {
    width,
    height: 2,
    depth,
  };
  const grip = {
    width,
    height: 4,
    depth: 1,
  };
  const stopper = {
    width: 1,
    height: 20,
    depth: 4.5, // TODO test and change to 5 if needed
  };

  const walls = [
    // main
    cuboid({
      size: [main.width, main.height, main.depth],
      center: [0, 0, main.depth / 2],
    }),
    // sides
    cuboid({
      size: [side.width, side.height, side.depth],
      center: [0, main.height / 2 - side.height / 2, side.depth / 2],
    }),
    cuboid({
      size: [side.width, side.height, side.depth],
      center: [0, main.height / -2 + side.height / 2, side.depth / 2],
    }),
    // grips
    cuboid({
      size: [grip.width, grip.height, grip.depth],
      center: [
        0,
        main.height / 2 - grip.height / 2,
        side.depth - grip.depth / 2,
      ],
    }),
    cuboid({
      size: [grip.width, grip.height, grip.depth],
      center: [
        0,
        main.height / -2 + grip.height / 2,
        side.depth - grip.depth / 2,
      ],
    }),
    // stopper
    cuboid({
      size: [stopper.width, stopper.height, stopper.depth],
      center: [main.width / 2 - stopper.width / 2, 0, stopper.depth / 2],
    }),
  ];

  let cover = union(...walls);

  return [cover];
};

module.exports = { main };
