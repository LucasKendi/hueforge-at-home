p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo } from './image_processor.js';

let img;
let time;
let thresh;
let copyData;
let imgData;
let currentLayer;
let range = 255;
let layers = 30;
let layer = 1;
let subd = parseInt(range / layers);
let previousColor = [];
let destColor = '';
let existing = document.getElementById('existing-canvas');
existing.getContext("2d", { willReadFrequently: true });
let finalWidth = existing.parentElement.offsetWidth;
let startTime;
let colorsAt;
let targetColor;
let currentValue;
let origColor;
let i;

document.getElementById("fileInput").addEventListener("change", handleImage);

window.preload = () => {
  name = "input_image.png"
  img = loadImage(name)
  copy = loadImage(name)
}

window.setup = () => {
  startTime = Date.now()
  fixedImage();
  colorsAt = getLayerInfo();
  if (typeof img == 'undefined' || typeof copy == 'undefined' || !img.pixels || !copy.pixels) {
    noLoop()
  } else {
    loop();
  }
}

function fixedImage() {
  img.resize(finalWidth / 2, 0);
  copy.resize(finalWidth / 2, 0);
  img.loadPixels()
  copy.loadPixels()
  createCanvas(finalWidth + 20, img.height, existing);
}

window.draw =() => {
  if (layer > layers || !colorsAt) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }

  time = Date.now()
  thresh = parseInt(subd * (layer - 1)) // threshold to change pixels
  copyData = copy.pixels
  imgData = img.pixels

  for (currentLayer in colorsAt) {
    if (layer <= currentLayer) {
      targetColor = colorsAt[currentLayer];
      break;
    }
  }

  for (i = 0; i < imgData.length; i += 4) {
    if (imgData[i + 3] == 0) continue; // skip on transparent pixels for png files

    currentValue = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3

    if (currentValue >= thresh) {
      origColor = color(copyData[i], copyData[i + 1], copyData[i + 2])
      color_layer(targetColor)
    }
  }

  console.log("Layer " + layer + ", with " + targetColor + ", taking: " + (Date.now() - time) / 1000.0 + "s")
  copy.updatePixels()
  image(copy, 0, 0)
  image(img, img.width + 20, 0)
  layer++
}

function color_layer(cur_color) {
  if (previousColor[0] != cur_color[0]) {
    previousColor = cur_color
    destColor = color(cur_color[0])
  }
  let result = mixbox.lerp(origColor.levels, destColor.levels, cur_color[1]) // color mix using mixbox for accurate pigment mixing results
  copy.pixels[i + 0] = result[0]
  copy.pixels[i + 1] = result[1]
  copy.pixels[i + 2] = result[2]
}

function handleImage() {
  let file = select('#fileInput').elt.files[0]
  if (file.type.startsWith('image/')) {
    img = loadImage(URL.createObjectURL(file), () => {
      copy = createImage(img.width, img.height)
      copy.copy(img, 0, 0, img.width, img.height, 0, 0, copy.width, copy.height)
      img.resize(finalWidth / 2, 0);
      copy.resize(finalWidth / 2, 0);
      img.loadPixels()
      copy.loadPixels()
      createCanvas(finalWidth, img.height, existing);
      layer = 1;
      loop()
    })
  } else {
    img = null;
    copy = null;
  }
}
