export const defaultParams = {
  preview: false,
};

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {(replicad: replicadLib) => any} */
export const main = (
  {
    makeBox,
    makeCylinder,
    draw,
    drawCircle,
    drawRoundedRectangle,
    drawRectangle,
  },
  { preview },
) => {
  const fit = 0.2;
  const sirinaBrave = 27 + fit * 2;
  const dubinaBrave = 12.5;
  const radius = 32;
  const debljinaMosta = 4;
  const rupaRadius = 1.5 + fit;
  const rupaOffset = 19;
  const maticaRupaRadius = 4;
  const maticaRupaDubina = 4;
  const drzacOffset = 12;
  const drzacMaticaOffset = sirinaBrave / 2 + 10;
  const maticaDubinaDrzac = 3;
  const maticaRadiusUnutra = 3.1 + fit;
  const rupaZaMaticuOffset = sirinaBrave / 2; // + 3.5;
  const sredisnjaRupaRadius = 8;

  const box = makeBox([0, 0, 0], [sirinaBrave, radius * 4, dubinaBrave])
    .translateX(sirinaBrave / -2)
    .translateY(radius * -2);

  const cyl = makeCylinder(radius, dubinaBrave + debljinaMosta);

  const rupa1 = makeCylinder(rupaRadius, 50).translateX(rupaOffset);
  const rupa1Glava = makeCylinder(
    maticaRupaRadius,
    maticaRupaDubina,
  ).translateX(rupaOffset);

  const rupa2 = makeCylinder(rupaRadius, 50).translateX(-rupaOffset);
  const rupa2Glava = makeCylinder(
    maticaRupaRadius,
    maticaRupaDubina,
  ).translateX(-rupaOffset);

  const dummy = radius;
  const dummyGlava = 10;

  const drzac = drawCircle(rupaRadius)
    .sketchOnPlane("ZY")
    .extrude(dummy)
    .translateZ(dubinaBrave / 2);
  const drzacGlava = drawCircle(maticaRupaRadius)
    .sketchOnPlane("ZY")
    .extrude(dummyGlava)
    .translateZ(dubinaBrave / 2);
  const points = [0, 1, 2, 3, 4, 5].map((index) => {
    return [
      maticaRadiusUnutra * Math.cos((index * Math.PI) / 3),
      maticaRadiusUnutra * Math.sin((index * Math.PI) / 3),
    ];
  });

  // const rupaZaMaticuBox = drawRectangle(maticaRadiusUnutra, maticaRadiusUnutra * 2)
  //   .sketchOnPlane("ZY")
  //   .extrude(maticaDubinaDrzac)
  //   .translateZ(dubinaBrave / 2 - maticaRadiusUnutra / 2);

  const rupaZaMaticu = draw(points[0])
    .lineTo(points[1])
    .lineTo(points[2])
    .lineTo(points[3])
    .lineTo(points[4])
    .lineTo(points[5])
    .close()
    .sketchOnPlane("ZY")
    .extrude(maticaDubinaDrzac)
    .translateZ(dubinaBrave / 2);

  const drzac1 = drzac.clone().translateY(drzacOffset);
  const drzacGlava1 = drzacGlava
    .clone()
    .translateY(drzacOffset)
    .translateX(-drzacMaticaOffset);
  const rupaZaMaticu1 = rupaZaMaticu
    .clone()
    .translateY(drzacOffset)
    .translateX(-rupaZaMaticuOffset);

  const drzac2 = drzac.clone().translateY(-drzacOffset);
  const drzacGlava2 = drzacGlava
    .clone()
    .translateY(-drzacOffset)
    .translateX(-drzacMaticaOffset);
  const rupaZaMaticu2 = rupaZaMaticu
    .clone()
    .translateY(-drzacOffset)
    .translateX(-rupaZaMaticuOffset);

  const drzac3 = drzac.clone().translateX(dummy).translateY(drzacOffset);
  const drzacGlava3 = drzacGlava
    .clone()
    .translateX(dummyGlava)
    .translateY(drzacOffset)
    .translateX(drzacMaticaOffset);
  const rupaZaMaticu3 = rupaZaMaticu
    .clone()
    .translateX(maticaDubinaDrzac)
    .translateY(drzacOffset)
    .translateX(rupaZaMaticuOffset);

  const drzac4 = drzac.clone().translateX(dummy).translateY(-drzacOffset);
  const drzacGlava4 = drzacGlava
    .clone()
    .translateX(dummyGlava)
    .translateY(-drzacOffset)
    .translateX(drzacMaticaOffset);
  const rupaZaMaticu4 = rupaZaMaticu
    .clone()
    .translateX(maticaDubinaDrzac)
    .translateY(-drzacOffset)
    .translateX(rupaZaMaticuOffset);

  const sredisnjaRupa = makeCylinder(sredisnjaRupaRadius, 100);

  const nukiOffset = 2;
  const nuki1 = makeCylinder(28.4, 25).translateZ(
    dubinaBrave + debljinaMosta + nukiOffset,
  );
  const nuki2 = makeCylinder(28.4, 40).translateZ(
    dubinaBrave + debljinaMosta + nukiOffset + 25,
  );

  return [
    {
      name: "Adapter za bravu",
      shape: cyl
        .cut(box)
        .cut(rupa1.fuse(rupa1Glava))
        .cut(rupa2.fuse(rupa2Glava))
        .cut(drzac1.fuse(drzacGlava1).fuse(rupaZaMaticu1))
        .cut(drzac2.fuse(drzacGlava2).fuse(rupaZaMaticu2))
        .cut(drzac3.fuse(drzacGlava3).fuse(rupaZaMaticu3))
        .cut(drzac4.fuse(drzacGlava4).fuse(rupaZaMaticu4))
        .cut(sredisnjaRupa),
      color: "rgba(100 100 200 / 0.8)",
    },
    // {
    //   shape: nuki1,
    //   color: 'rgba(255 255 255 / 0.9)',
    // },
    // {
    //   shape: nuki2,
    //   color: 'rgba(150 150 165 / 0.7)',
    // },
    // drzac1.fuse(drzacGlava1).fuse(rupaZaMaticu1),
    // drzac2.fuse(drzacGlava2).fuse(rupaZaMaticu2),
    // drzac3.fuse(drzacGlava3).fuse(rupaZaMaticu3),
    // drzac4.fuse(drzacGlava4).fuse(rupaZaMaticu4),
  ];
};

export default main;
