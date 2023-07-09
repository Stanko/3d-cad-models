// $fa = 1;
$fs = 0.2;
$fn = 64;

innerDiameter = 8.7; // 8.2 - 8.33mm
penDiameter = 10.7; // 9.42 - 10.43mm
wallThickness = 1;

outerDiameter = penDiameter + wallThickness * 2;

magnetHeight = 1.8; // 1.7 + tollerance
magnetDiameter = 5.2; // 5 + tollerance

// Small offset to prevent z-fighting
zOffset = 0.01;


// Specify where to apply the rounded corners. Default "all"
// apply_to = "all"|"x"|"y"|"z"|"zmax"|"zmin"|"xmax"|"xmin"|"ymax"|"ymin"

module roundedcube(size = [1, 1, 1], center = false, radius = 0.5, apply_to = "all") {
  // If single value, convert to [x, y, z] vector
  size = (size[0] == undef) ? [size, size, size] : size;

  translate_min = radius;
  translate_xmax = size[0] - radius;
  translate_ymax = size[1] - radius;
  translate_zmax = size[2] - radius;

  diameter = radius * 2;

  obj_translate = (center == false) ?
    [0, 0, 0] : [
      -(size[0] / 2),
      -(size[1] / 2),
      -(size[2] / 2)
    ];

  translate(v = obj_translate) {
    hull() {
      for (translate_x = [translate_min, translate_xmax]) {
        x_at = (translate_x == translate_min) ? "min" : "max";
        for (translate_y = [translate_min, translate_ymax]) {
          y_at = (translate_y == translate_min) ? "min" : "max";
          for (translate_z = [translate_min, translate_zmax]) {
            z_at = (translate_z == translate_min) ? "min" : "max";

            translate(v = [translate_x, translate_y, translate_z])
            if (
              (apply_to == "all") ||
              (apply_to == "xmin" && x_at == "min") || (apply_to == "xmax" && x_at == "max") ||
              (apply_to == "ymin" && y_at == "min") || (apply_to == "ymax" && y_at == "max") ||
              (apply_to == "zmin" && z_at == "min") || (apply_to == "zmax" && z_at == "max")
            ) {
              sphere(r = radius);
            } else {
              rotate = 
                (apply_to == "xmin" || apply_to == "xmax" || apply_to == "x") ? [0, 90, 0] : (
                (apply_to == "ymin" || apply_to == "ymax" || apply_to == "y") ? [90, 90, 0] :
                [0, 0, 0]
              );
              rotate(a = rotate)
              cylinder(h = diameter, r = radius, center = true);
            }
          }
        }
      }
    }
  }
}

module magnetHolder(
  reverse = true,
  height
) {
  magnetHolderDiameter = (magnetDiameter + wallThickness * 2);
  magnetHolderHeight = magnetHeight + wallThickness;

  translateHolderFactor = reverse ? 2 : -2;
  translateCubeFactor = reverse ? -magnetHolderDiameter : 0;
  supportRotation = reverse ? 45 : -45;
  supportX = reverse ? -1 : 1;
  supportCubeX = reverse ? -5 : -15;

  supportHeight = 20;

  difference() {
    translate([0, 0, height - magnetHolderHeight])

    difference() {
      translate([(outerDiameter + magnetHolderDiameter) / translateHolderFactor, 0, 0])
      difference() {
        union() {

          difference() {
            rotate([0, supportRotation, 0])
            translate([supportX, 0, supportHeight / -2]) 
              cylinder(supportHeight, magnetHolderDiameter / 2, magnetHolderDiameter / 2, false);

            translate([supportCubeX, -5, 0])
              cube([20, 10, 100]);
          }

          cylinder(magnetHolderHeight, magnetHolderDiameter / 2, magnetHolderDiameter / 2, false);
          
          translate([translateCubeFactor, magnetHolderDiameter / -2, 0]) 
            cube([magnetHolderDiameter, magnetHolderDiameter, magnetHolderHeight]);
        }

        translate([0, 0, wallThickness + zOffset]) 
          cylinder(magnetHeight + zOffset, magnetDiameter / 2, magnetDiameter / 2, false);
      }
      
      translate([0, 0, -1])
        cylinder(height + 2, (outerDiameter / 2) - zOffset, (outerDiameter / 2) - zOffset, false);
    }

    union() {
      translate([-25, -25, -50 + zOffset])
        cube(50);

      translate([0, 0, height * -5])
        cylinder(height * 10, (penDiameter / 2) + zOffset, (penDiameter / 2) + zOffset, false);
    }
  }
}

module shaft(
  hole = true,
  height,
  patternCount = 3,
  backPattern = true
) {
  difference() {
    cylinder(height, outerDiameter / 2, outerDiameter / 2, false);
    translate([0, 0, wallThickness]) cylinder(height, penDiameter / 2, penDiameter / 2, false);

    if (hole) {
      translate([0, 0, -1]) cylinder(height + 2, innerDiameter / 2, innerDiameter / 2, false);
    }

    translateX = backPattern ? 10 : 0;

    for (i = [1:patternCount]) {
      translate([-10, 0, i * innerDiameter])
      rotate([0, 90, 0])
        cylinder(20, innerDiameter / 4, innerDiameter / 4, false);

      translate([0, translateX, i * innerDiameter + innerDiameter / 2])
      rotate([90, 90, 0])
        cylinder(20, innerDiameter / 4, innerDiameter / 4, false);
    }
  }
}

module screwPlates(holderHeight) {
  screwVerticalDistance = 28.8;

  screwDiameter = 3.2;

  thickness = 2;
  height = screwVerticalDistance + 2 * (screwDiameter + 5);
  width = 15;

  screwOneZ = 5 + (screwDiameter / 2);
  screwTwoZ = screwOneZ + screwVerticalDistance + screwDiameter;

  plateOneZ = 0;

  difference() {
    difference() {
      translate([0, outerDiameter / 2 - thickness, plateOneZ])
        // cube([width, thickness, height]);
        // apply_to = "all"|"x"|"y"|"z"|"zmax"|"zmin"|"xmax"|"xmin"|"ymax"|"ymin"
        roundedcube([width, thickness, height], false, 1, "y");

      translate([width * 0.66, 0, screwTwoZ])
      rotate([-90, 0, 0])
        cylinder(thickness * 10, screwDiameter / 2, screwDiameter / 2, false);

      translate([width * 0.66, 0, screwOneZ])
      rotate([-90, 0, 0])
        cylinder(thickness * 10, screwDiameter / 2, screwDiameter / 2, false);
    }

    cylinder(holderHeight, penDiameter / 2 + zOffset, penDiameter / 2 + zOffset, false);
  }
}

module part(
  hole = true,
  height,
  patternCount = 3,
  backPattern = false,
) { 
  union() {
    shaft(hole, height, patternCount, backPattern);
    magnetHolder(true, height);
    magnetHolder(false, height);
  }
}


union() {
  screwPlates(60 + wallThickness);

  part(true, 60 + wallThickness, 5, false); // two parts should be 99m in total
}

translate([0, penDiameter * 2, 0])
  part(false, 39 + wallThickness, 3, true); // two parts should be 99m in total
 


