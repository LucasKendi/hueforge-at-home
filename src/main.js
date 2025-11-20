p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync, buildAndMixColors } from './image_processor.js';

let origImage, coloredImage, startTime;
let layers = 15;
let currentLayer;
let subdivisions = parseInt(255 / layers);
let inputColors = getLayerInfo();
let layerColors = [];

let gradientPreview = document.getElementById('gradient-preview').getContext("2d")
let previewX = 450, previewY = 150;
let step = parseInt(previewX / layers);

let imgData, dataArray;

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
  startTime = Date.now()
  currentLayer = 0;
  prepareImages(origImage, coloredImage);
  imgData = gradientPreview.createImageData(previewX, previewY);
  dataArray = imgData.data;

  let currentColor = inputColors[Object.keys(inputColors)[0]]
  layerColors[0] = color(currentColor["color"])

  for (let i = 1; i <= layers; i++) {
    if (inputColors[i]) { currentColor = inputColors[i] }

    layerColors[i] = buildAndMixColors(layerColors[i - 1], currentColor)
  }

  if (typeof origImage == 'undefined' || typeof coloredImage == 'undefined' || !origImage.pixels || !coloredImage.pixels) {
    noLoop()
  } else { loop() }
}

window.draw = () => {
  let threshold = parseInt(subdivisions * (currentLayer - 1)) // threshold to change pixels
  let origPixels = origImage.pixels

  for (let i = 0; i < origPixels.length; i += 4) {
    if (origPixels[i + 3] == 0) continue; // skip transparent pixels on png files
    let currentValue = (origPixels[i] + origPixels[i + 1] + origPixels[i + 2]) / 3
    if (currentValue >= threshold) {
      coloredImage.pixels[i + 0] = layerColors[currentLayer][0]
      coloredImage.pixels[i + 1] = layerColors[currentLayer][1]
      coloredImage.pixels[i + 2] = layerColors[currentLayer][2]
    }
  }

  for (let x = 0; x < previewX; x++) {
    if (currentLayer * step > x) { continue }
    for (let y = 0; y < previewY; y++) {
      let i = (y * previewX + x) * 4;

      dataArray[i + 0] = layerColors[currentLayer][0];
      dataArray[i + 1] = layerColors[currentLayer][1];
      dataArray[i + 2] = layerColors[currentLayer][2];
      dataArray[i + 3] = 255;
    }
  }

  coloredImage.updatePixels()
  image(coloredImage, 0, 0)
  image(origImage, origImage.width, 0)
  gradientPreview.putImageData(imgData, 0, 0)
  currentLayer++

  if (currentLayer > layers || !inputColors) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)
