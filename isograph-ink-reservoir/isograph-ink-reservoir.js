const defaultParams = {
  innerRadius: 3.825,
  height: 100,
};

/*
Original ink container dimensions:
- inner diameter 7.6
- outer diameter 9.3
- length 38.4
- outer diameter at the bottom 8.6
*/

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
const main = ({ makeBox, makeCylinder }, { innerRadius, height }) => {
  // Array of radii for the tubes, useful for testing multiple versions
  const radii = [innerRadius];
  // If you create multiple tubes, small markers will be added to them
  const showMarkers = radii.length > 1;

  // Group
  let tubes;

  radii.forEach((innerRadius, i) => {
    const outer = innerRadius + 0.4 * 2;

    // Create marker
    let marker;

    for (let n = 0; n < i + 1; n++) {
      const notch = makeBox([1, 1.5, 3])
        .translateX(-1)
        .translateY(innerRadius)
        .rotate(n * 20, [0, 0]);

      if (!marker) {
        marker = notch;
      } else {
        marker = marker.fuse(notch);
      }
    }

    // Create tube
    let tube = makeCylinder(outer, height).cut(
      makeCylinder(innerRadius, height).translateZ(1),
    );

    // Add marker
    if (showMarkers) {
      tube = tube.fuse(marker);
    }

    // Add tube to the group
    if (!tubes) {
      tubes = tube;
    } else {
      tubes = tubes.fuse(tube.translateX(i * 12));
    }
  });

  return {
    shape: tubes,
    color: "#67c",
  };
};
