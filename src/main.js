p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync } from './image_processor.js';

let origImage;
let coloredImage;
let range = 255;
let layers = 20;
let currentLayer = 0;
let subd = parseInt(range / layers);
let previousColor = [];
let destColor = '';
let startTime;
let colorsAt;
let selectedColor;
let currentValue;
let origColor;
let i;

window.handleImageInput = async (event) => {
  let path = event.target.files[0];
  event.target.value = "";
  if(!path) return;

  origImage = await loadImageAsync(path);
  coloredImage = createImage(origImage.width, origImage.height)
  coloredImage.copy(origImage, 0, 0, origImage.width, origImage.height, 0, 0, coloredImage.width, coloredImage.height)
  prepareImages(origImage, coloredImage)
  currentLayer = 1;
  startTime = Date.now()
  loop()
}

window.preload = () => {
  name = "input_image.png"
  origImage = loadImage(name)
  coloredImage = loadImage(name)
}

window.setup = () => {
  currentLayer = 0;
  startTime = Date.now()
  prepareImages(origImage, coloredImage);
  colorsAt = getLayerInfo();
  if (typeof origImage == 'undefined' || typeof coloredImage == 'undefined' || !origImage.pixels || !coloredImage.pixels) {
    noLoop()
  } else {
    loop();
  }
}

window.draw =() => {
  let time = Date.now()
  let thresh = parseInt(subd * (currentLayer - 1)) // threshold to change pixels
  let copyData = coloredImage.pixels
  let imgData = origImage.pixels

  for (let selectedLayer in colorsAt) {
    if (currentLayer <= selectedLayer) {
      selectedColor = colorsAt[selectedLayer];
      break;
    }
  }

  for (i = 0; i < imgData.length; i += 4) {
    if (imgData[i + 3] == 0) continue; // skip on transparent pixels for png files

    currentValue = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3
    if (currentValue >= thresh) {
      origColor = color(copyData[i], copyData[i + 1], copyData[i + 2])
      colorLayer(selectedColor)
    }
  }

  console.log("current layer " + currentLayer + ", with " + selectedColor + ", taking: " + (Date.now() - time) / 1000.0 + "s")
  coloredImage.updatePixels()
  image(coloredImage, 0, 0)
  image(origImage, origImage.width + 20, 0)
  currentLayer++

  if (currentLayer > layers || !colorsAt) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)

function colorLayer(currentColor) {
  if (previousColor[0] != currentColor[0]) {
    previousColor = currentColor
    destColor = color(currentColor[0])
  }
  let result = mixbox.lerp(origColor.levels, destColor.levels, currentColor[1]) // color mix using mixbox for accurate pigment mixing results
  coloredImage.pixels[i + 0] = result[0]
  coloredImage.pixels[i + 1] = result[1]
  coloredImage.pixels[i + 2] = result[2]
}
