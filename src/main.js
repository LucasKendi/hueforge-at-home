p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync, buildAndMixColors, buildPreview } from './image_processor.js';

let origImage, coloredImage, startTime;
let layers = 15;
let currentLayer;
let resolution;
let layerColors;
let gradientPreview = document.getElementById('gradient-preview').getContext("2d")
let previewX = 300, previewY = 150;
let existingCanvas = document.getElementById('existing-canvas')
existingCanvas.getContext("2d", { willReadFrequently: true })
let finalWidth = existingCanvas.parentElement.offsetWidth;

window.handleImageInput = async (event) => {
  let path = event.target.files[0];
  event.target.value = "";
  if (!path) return;

  origImage = await loadImageAsync(path);
  coloredImage = createImage(origImage.width, origImage.height)
  coloredImage.copy(origImage, 0, 0, origImage.width, origImage.height, 0, 0, coloredImage.width, coloredImage.height)
  setup()
}

window.preload = () => {
  let inputImage = "input_image.png"
  origImage = loadImage(inputImage)
  coloredImage = loadImage(inputImage)
}

window.setup = () => {
  frameRate(240)
  prepareImages(origImage, coloredImage, finalWidth);
  createCanvas(finalWidth, origImage.height, existingCanvas)
  image(origImage, 0, 0)

  let inputColors = getLayerInfo();
  let currentColor = inputColors[Object.keys(inputColors)[0]]
  let previewData = new ImageData(previewX, previewY);

  startTime = Date.now()
  currentLayer = 1;
  resolution = parseInt(255 / layers)
  layerColors = [];
  layerColors[0] = color(currentColor["color"]).levels

  for (let i = 1; i < layers; i++) {
    if (inputColors[i + 1]) { currentColor = inputColors[i + 1] }
    layerColors[i] = buildAndMixColors(layerColors[i - 1], currentColor)
  }

  gradientPreview.putImageData(buildPreview(previewData, layerColors), 0, 0)

  if (typeof origImage == 'undefined' || typeof coloredImage == 'undefined' || !origImage.pixels || !coloredImage.pixels) {
    noLoop()
  } else { loop() }
}

window.draw = () => {
  let layerIndex = currentLayer - 1;
  let threshold = resolution * layerIndex // threshold to change pixels
  let origPixels = origImage.pixels

  for (let i = 0; i < origPixels.length; i += 4) {
    if (origPixels[i + 3] == 0) continue; // skip transparent pixels on png files
    let currentValue = (origPixels[i] + origPixels[i + 1] + origPixels[i + 2]) / 3
    if (currentValue >= threshold) {
      coloredImage.pixels[i + 0] = layerColors[layerIndex][0]
      coloredImage.pixels[i + 1] = layerColors[layerIndex][1]
      coloredImage.pixels[i + 2] = layerColors[layerIndex][2]
    }
  }

  coloredImage.updatePixels()
  image(coloredImage, coloredImage.width, 0)
  currentLayer++
  if (currentLayer > layers) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)
document.getElementById("numLayers").addEventListener("input", (event) => {
  layers = event.target.value;
  document.getElementById("layerCount").innerHTML = layers;
  setup();
})
