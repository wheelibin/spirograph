/* globals dat,push,pop,noLoop,loop,strokeWeight,line,tippy */

// extend dat.gui controller to have tooltips
for (const contoller in dat.controllers) {
  dat.controllers[contoller].prototype.title = function (title) {
    this.__li.setAttribute("data-tippy-content", title);
    return this;
  };
}

// App constants
const fps = 60;

// Colours
const backgroundColour = "#292929";
const textColour = "#c6c6c6";
const lineColourPalettes = [
  // https://coolors.co/ff595e-ffca3a-8ac926-1982c4-6a4c93
  ["ff595e", "ffca3a", "8ac926", "1982c4", "6a4c93"],
  // https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff
  ["ffbe0b", "fb5607", "ff006e", "8338ec", "3a86ff"],
  // https://coolors.co/palette/f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590
  ["f94144", "f3722c", "f8961e", "f9c74f", "90be6d", "43aa8b", "577590"],
  // https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
  ["ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff", "a0c4ff", "bdb2ff", "ffc6ff", "fffffc"],
  // https://coolors.co/palette/25ced1-ffffff-fceade-ff8a5b-ea526f
  ["25ced1", "ffffff", "fceade", "ff8a5b", "ea526f"],
  // https://coolors.co/palette/007f5f-2b9348-55a630-80b918-aacc00-bfd200-d4d700-dddf00-eeef20-ffff3f
  ["007f5f", "2b9348", "55a630", "80b918", "aacc00", "bfd200", "d4d700", "dddf00", "eeef20", "ffff3f"],
  // https://coolors.co/palette/fdc5f5-f7aef8-b388eb-8093f1-72ddf7
  ["fdc5f5", "f7aef8", "b388eb", "8093f1", "72ddf7"],
  // https://coolors.co/palette/5aa9e6-7fc8f8-f9f9f9-ffe45e-ff6392
  ["5aa9e6", "7fc8f8", "f9f9f9", "ffe45e", "ff6392"],
];

let boundaryRadius;
let worldCentre;

// radius of outer circle
let R;

let isRunning = true;
const config = {
  paperColour: "#333",
  lineWidth: 1,
  colourPalette: 1,
  drawSpeed: 100,
  precision: 80,
  revolutions: 50,
};

const cogs = [
  {
    cogRadius: 2,
    holePosition: 99,
  },
  {
    cogRadius: 4,
    holePosition: 99,
  },
  {
    cogRadius: 8,
    holePosition: 99,
  },
  {
    cogRadius: 16,
    holePosition: 99,
  },
  {
    cogRadius: 32,
    holePosition: 99,
  },
  {
    cogRadius: 64,
    holePosition: 99,
  },
];

const gui = new dat.GUI();
const cogGuiFolders = [];
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
  removeAllCogs: function () {
    cogs.length = 0;
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

// eslint-disable-next-line no-unused-vars
function setup() {
  frameRate(fps);
  createCanvas(windowWidth, windowHeight);

  createGui();
  init();

  calcSpiro();
}

function calcSpiro() {
  const pointsPerRevolution = 300 * (config.precision / 100);
  const pointCount = pointsPerRevolution * config.revolutions;
  const thetas = linspace(0, config.revolutions * 2 * Math.PI, pointCount);

  for (let i = 0; i < cogs.length; i++) {
    const cog = cogs[i];
    cog.points = [];
    cog.inc = 0;

    const r = R * (cog.cogRadius / 100);
    const p = r * (cog.holePosition / 100);

    for (const theta of thetas) {
      let x = (R - r) * Math.cos(theta) + p * Math.cos(((R - r) / r) * theta);
      let y = (R - r) * Math.sin(theta) - p * Math.sin(((R - r) / r) * theta);

      let penPoint = createVector(worldCentre.x + x, worldCentre.y + y);
      cog.points.push(penPoint);
    }
  }
}

// eslint-disable-next-line no-unused-vars
function draw() {
  const incompleteCogs = cogs.filter((c) => c.inc < c.points.length);
  if (!incompleteCogs.length) {
    noLoop();
  }
  for (let c = 0; c < incompleteCogs.length; c++) {
    const cog = cogs[c];

    const linesToDrawThisFrame = Math.min(config.drawSpeed, cog.points.length - cog.inc);
    for (let i = 0; i < linesToDrawThisFrame; i++) {
      const prevPoint = cog.inc === 0 ? { x: 0, y: 0 } : cog.points[cog.inc - 1];
      const point = cog.points[cog.inc];
      push();
      const palette = lineColourPalettes[config.colourPalette - 1];
      stroke(`#${palette[c % palette.length]}`);
      strokeWeight(config.lineWidth);
      line(prevPoint.x || point.x, prevPoint.y || point.y, point.x, point.y);
      pop();
      cog.inc++;
    }
  }
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
  let folder = gui.addFolder("Actions");
  folder.open();
  folder.add(buttonHandlers, "startStop").name("Start / Stop");
  folder.add(buttonHandlers, "newCog").name("New Cog").title("Add a new cog with random settings");
  folder.add(buttonHandlers, "removeAllCogs").name("Remove All Cogs");

  folder = gui.addFolder("Options");
  folder.addColor(config, "paperColour").name("Paper Colour").onChange(noLoop).onFinishChange(init);
  folder.add(config, "drawSpeed", 1, 100, 2).name("Draw Speed").onChange(noLoop).onFinishChange(init);
  folder
    .add(config, "precision", 1, 100, 1)
    .name("Precision")
    .title(
      "Controls how many of the calculated points are actually used for drawing the line. Lower values produce some interesting shapes!"
    )
    .onChange(noLoop)
    .onFinishChange(init);
  folder
    .add(config, "revolutions", 10, 500, 10)
    .name("Revolutions")
    .title("The number of full revolutions the small cogs make round the outer cog")
    .onChange(init);

  folder.add(config, "lineWidth", 1, 10, 1).name("Line Width").onChange(init);
  folder
    .add(config, "colourPalette", 1, lineColourPalettes.length, 1)
    .name("Colour Palette")
    .onChange(noLoop)
    .onFinishChange(init);

  createGuiForCogs();

  tippy("[data-tippy-content]", { placement: "left" });
}

function createGuiForCogs() {
  cogGuiFolders.forEach(function (folder) {
    try {
      gui.removeFolder(folder);
    } catch (j) {}
  });

  cogs.forEach(function (penLine, i) {
    const folder = gui.addFolder(`Cog ${i + 1}`);
    folder.open();
    folder.add(penLine, "cogRadius", 1, 100, 1).name("Size").onChange(init);
    folder.add(penLine, "holePosition", 1, 100, 1).name("Hole Position").onChange(init);
    folder.add(buttonHandlers, "removeCog").name("Remove Cog");
    cogGuiFolders.push(folder);
  });
}

function init() {
  boundaryRadius = (Math.min(windowWidth, windowHeight) - 100) / 2;
  worldCentre = createVector(windowWidth / 2, windowHeight / 2);
  background(backgroundColour);

  // radius of outer circle
  R = boundaryRadius;

  fill(config.paperColour);
  strokeWeight(2);
  circle(worldCentre.x, worldCentre.y, 2 * R);

  calcSpiro();

  loop();
  isRunning = true;
}

// https://github.com/NikhilAshodariya/JavaScript_Numpy/blob/master/NumericalRange.js
function linspace(start, stop, parts = 10) {
  if (typeof start == "undefined" || typeof stop == "undefined") {
    /**
     * case like start is undefined and stop has some value is not possible in JavaScript
     * such case is possible since during calling a function you can calling using following method
     * linspace(stop=5). Such case is not possible in JS. JS will take the first parameter as
     * start value only. Case such as both are both are undefined can occur so it is handle.
     *
     */
    if (typeof start != "undefined" && typeof stop == "undefined") {
      throw new Error(`linspace() missing 1 required positional argument: 'stop'`);
    } else if (typeof start == "undefined" && typeof stop == "undefined") {
      throw new Error(`linspace() missing 2 required positional arguments: 'start' and 'stop'`);
    } else {
      throw new Error(`Some unknown Exception occured in linspace`);
    }
  }
  if (start == stop) {
    var toReturnData = [];
    for (let i = 0; i < parts; i++) {
      toReturnData[i] = start;
    }
    return toReturnData;
  }
  if (parts < 0) {
    throw new Error(`Number of samples, ${parts}, must be non-negative.`);
  } else if (parts == 0) {
    return [];
  } else if (parts == 1) {
    return [start];
  } else if (parts == 2) {
    return [start, stop];
  } else {
    var increment = ((stop * 1.0 - start * 1.0) / (parts - 1)) * 1.0;
    var toReturn = [];
    var temp = start;
    for (let i = 0; i < parts; i++) {
      toReturn[i] = temp;
      temp = temp + increment;
    }
    return toReturn;
  }
}
