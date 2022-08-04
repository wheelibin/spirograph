/* globals dat,push,pop,noLoop,loop,strokeWeight,line */

// App constants
const fps = 60;

// Colours
const backgroundColour = "#292929";
const textColour = "#c6c6c6";
const circleBackgroundColour = "#333";
const lineColourPalettes = [
  // https://coolors.co/012a4a-013a63-01497c-014f86-2a6f97-2c7da0-468faf-61a5c2-89c2d9-a9d6e5
  ["012a4a", "013a63", "01497c", "014f86", "2a6f97", "2c7da0", "468faf", "61a5c2", "89c2d9", "a9d6e5"],
  // https://coolors.co/fadde1-ffc4d6-ffa6c1-ff87ab-ff5d8f-ff97b7-ffacc5-ffcad4-f4acb7
  ["fadde1", "ffc4d6", "ffa6c1", "ff87ab", "ff5d8f", "ff97b7", "ffacc5", "ffcad4", "f4acb7"],
  // https://coolors.co/54478c-2c699a-048ba8-0db39e-16db93-83e377-b9e769-efea5a-f1c453-f29e4c
  ["54478c", "2c699a", "048ba8", "0db39e", "16db93", "83e377", "b9e769", "efea5a", "f1c453", "f29e4c"],
  // https://coolors.co/004b23-006400-007200-008000-38b000-70e000-9ef01a-ccff33
  ["004b23", "006400", "007200", "008000", "38b000", "70e000", "9ef01a", "ccff33"],
  // https://coolors.co/fec5bb-fcd5ce-fae1dd-f8edeb-e8e8e4-d8e2dc-ece4db-ffe5d9-ffd7ba-fec89a
  ["fec5bb", "fcd5ce", "fae1dd", "f8edeb", "e8e8e4", "d8e2dc", "ece4db", "ffe5d9", "ffd7ba", "fec89a"],
  // https://coolors.co/001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226
  ["001219", "005f73", "0a9396", "94d2bd", "e9d8a6", "ee9b00", "ca6702", "bb3e03", "ae2012", "9b2226"],
  // https://coolors.co/03071e-370617-6a040f-9d0208-d00000-dc2f02-e85d04-f48c06-faa307-ffba08
  ["03071e", "370617", "6a040f", "9d0208", "d00000", "dc2f02", "e85d04", "f48c06", "faa307", "ffba08"],
  // https://coolors.co/d8f3dc-b7e4c7-95d5b2-74c69d-52b788-40916c-2d6a4f-1b4332-081c15
  ["d8f3dc", "b7e4c7", "95d5b2", "74c69d", "52b788", "40916c", "2d6a4f", "1b4332", "081c15"],
  // https://coolors.co/d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77
  ["d9ed92", "b5e48c", "99d98c", "76c893", "52b69a", "34a0a4", "168aad", "1a759f", "1e6091", "184e77"],
  // https://coolors.co/f8f9fa-e9ecef-dee2e6-ced4da-adb5bd-6c757d-495057-343a40-212529
  ["f8f9fa", "e9ecef", "dee2e6", "ced4da", "adb5bd", "6c757d", "495057", "343a40", "212529"],
  // https://coolors.co/390099-9e0059-ff0054-ff5400-ffbd00
  ["390099", "9e0059", "ff0054", "ff5400", "ffbd00"],
  // https://coolors.co/ff595e-ffca3a-8ac926-1982c4-6a4c93
  ["ff595e", "ffca3a", "8ac926", "1982c4", "6a4c93"],
  // https://coolors.co/c9cba3-ffe1a8-e26d5c-723d46-472d30
  ["c9cba3", "ffe1a8", "e26d5c", "723d46", "472d30"],
  // https://coolors.co/247ba0-70c1b3-b2dbbf-f3ffbd-ff1654
  ["247ba0", "70c1b3", "b2dbbf", "f3ffbd", "ff1654"],
  // https://coolors.co/ffffff-84dcc6-a5ffd6-ffa69e-ff686b
  ["ffffff", "84dcc6", "a5ffd6", "ffa69e", "ff686b"],
  // https://coolors.co/f7b267-f79d65-f4845f-f27059-f25c54
  ["f7b267", "f79d65", "f4845f", "f27059", "f25c54"],
];

let boundaryRadius;
let worldCentre;

// radius of outer circle
let R;

let theta = 0;
let prevPoint = [];
let isRunning = true;
const config = {
  lineWidth: 2,
  colourPalette: 11,
  precision: 0.96,
};
const gui = new dat.GUI();
const guiFolders = [];
const buttonHandlers = {
  newCog: function () {
    const newCog = { cogRadius: 100 * Math.random(), holePosition: 100 * Math.random() };
    cogs.push(newCog);
    createGuiForCogs();
    init();
  },
  removeCog: function (index) {
    cogs.splice(index, 1);
    createGuiForCogs();
    init();
  },
  startStop: function () {
    isRunning = !isRunning;
    if (isRunning) {
      loop();
    } else {
      noLoop();
    }
  },
};

const cogs = [
  {
    cogRadius: 13,
    holePosition: 88,
  },
];

// eslint-disable-next-line no-unused-vars
function setup() {
  frameRate(fps);
  createCanvas(windowWidth, windowHeight);

  createGui();
  init();
}

// eslint-disable-next-line no-unused-vars
function draw() {
  for (let i = 0; i < cogs.length; i++) {
    const cog = cogs[i];

    const r = R * (cog.cogRadius / 100);
    const p = r * (cog.holePosition / 100);
    const l = p / r;
    const k = r / R;
    // https://en.wikipedia.org/wiki/Spirograph#Mathematical_basis
    let x = R * ((1 - k) * Math.cos(theta) + l * k * Math.cos(((1 - k) / k) * theta));
    let y = R * ((1 - k) * Math.sin(theta) - l * k * Math.sin(((1 - k) / k) * theta));
    let penPoint = createVector(worldCentre.x + x, worldCentre.y + y);

    push();
    const palette = lineColourPalettes[config.colourPalette];
    stroke(`#${palette[i % (palette.length - 1)]}`);
    strokeWeight(config.lineWidth);
    line(prevPoint[i]?.x || penPoint.x, prevPoint[i]?.y || penPoint.y, penPoint.x, penPoint.y);
    pop();
    prevPoint[i] = { ...penPoint };
  }

  theta += 1 - config.precision;
}

// eslint-disable-next-line no-unused-vars
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  init();
}

function createTextElement(element, text, x, y, color = textColour) {
  let el = createElement(element, text);
  el.style("font-family", "sans-serif");
  el.style("color", color);
  el.position(x, y);
}

function createGui() {
  createTextElement("h1", "Spirograph", 32, 8, textColour);
  const folder = gui.addFolder("Controls");
  folder.open();
  folder.add(buttonHandlers, "startStop").name("Start / Stop");
  folder.add(buttonHandlers, "newCog").name("New Cog");

  gui.add(config, "lineWidth", 1, 10, 1).name("Line Width").onChange(noLoop).onFinishChange(init);
  gui
    .add(config, "colourPalette", 0, lineColourPalettes.length - 1, 1)
    .name("Colour Palette")
    .onChange(noLoop)
    .onFinishChange(init);
  gui.add(config, "precision", 0.8, 0.99, 0.01).name("Precision").onChange(noLoop).onFinishChange(init);

  createGuiForCogs();
}

function createGuiForCogs() {
  guiFolders.forEach(function (folder) {
    try {
      gui.removeFolder(folder);
    } catch (j) {}
  });
  cogs.forEach(function (penLine, i) {
    const folder = gui.addFolder(`Cogs ${i + 1}`);
    folder.add(penLine, "cogRadius", 1, 100, 1).name("Size").onChange(noLoop).onFinishChange(init);
    folder.add(penLine, "holePosition", 1, 100, 1).name("Hole Position").onChange(noLoop).onFinishChange(init);
    folder.add(buttonHandlers, "removeCog").name("Remove Cog");
    guiFolders.push(folder);
  });
  guiFolders[guiFolders.length - 1].open();
}

function init() {
  background(backgroundColour);
  theta = 0;
  prevPoint = [];
  boundaryRadius = (Math.min(windowWidth, windowHeight) - 100) / 2;
  worldCentre = createVector(windowWidth / 2, windowHeight / 2);
  background(backgroundColour);

  // radius of outer circle
  R = boundaryRadius;

  fill(circleBackgroundColour);
  strokeWeight(2);
  circle(worldCentre.x, worldCentre.y, 2 * R);
  loop();
  isRunning = true;
}
