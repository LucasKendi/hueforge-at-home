p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync, buildAndMixColors, buildPreview, createColorPicker, addColorToList, getLightness, computeHueHistogram, drawHistogram } from './image_processor.js';

let layers = document.getElementById("layerCount").innerHTML;
let hueSegment = parseInt(document.getElementById("hueSegment").value);
let hueOffset = parseInt(document.getElementById("hueOffset").value);
let segmentFlag = document.getElementById("segmentFlag").checked;
let gradientPreview = document.getElementById('gradientPreview').getContext("2d")
let imageHistogram = document.getElementById('imageHistogram').getContext("2d")
let existingCanvas = document.getElementById('existing-canvas')
existingCanvas.getContext("2d", { willReadFrequently: true })
let finalWidth = existingCanvas.parentElement.offsetWidth;

let origImage, coloredImage, startTime;
let minLightness, maxLightness;
let currentLayer, layerRange, layerColors, histogram;
let previewX = 300, previewY = 150;
window.addColorToList = addColorToList

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
  prepareImages(origImage, coloredImage, finalWidth - 20);
  imageHistogram.clearRect(0, 0, canvas.width, canvas.height);
  histogram = computeHueHistogram(origImage, hueOffset)
  createCanvas(finalWidth, origImage.height, existingCanvas)
  image(origImage, 0, 0)

  let inputColors = getLayerInfo();
  let currentColor = inputColors[Object.keys(inputColors)[0]]
  let previewData = new ImageData(previewX, previewY);
  let lightnessRange = getLightness(origImage)

  startTime = Date.now()
  currentLayer = 1;
  minLightness = lightnessRange[0]
  maxLightness = lightnessRange[1]
  layerRange = (maxLightness - minLightness) / layers
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
  let threshold = layerRange * layerIndex + minLightness // threshold to change pixels
  let origPixels = origImage.pixels

  for (let i = 0; i < origPixels.length; i += 4) {
    if (origPixels[i + 3] == 0) continue; // skip transparent pixels on png files
    let currentValue = 0.2126 * origPixels[i] + 0.7152 * origPixels[i + 1] + 0.0722 * origPixels[i + 2];

    if (segmentFlag) {
      let currentPixel = color(origPixels[i + 0], origPixels[i + 1], origPixels[i + 2])
      let currentHue = floor(hue(currentPixel))
      let rotatedHue = (currentHue + hueOffset) % 360
      let w = 100;
      let dh = hueSegment - rotatedHue;
      let blend = constrain(map(dh, 0, w, 1, 0), 0, 1);

      currentValue = lerp(currentValue / 2, (currentValue / 2) + 128, blend)
    }

    if (currentValue >= threshold) {
      coloredImage.pixels[i + 0] = layerColors[layerIndex][0]
      coloredImage.pixels[i + 1] = layerColors[layerIndex][1]
      coloredImage.pixels[i + 2] = layerColors[layerIndex][2]
    }
  }

  coloredImage.updatePixels()
  image(coloredImage, coloredImage.width, 0)
  drawHistogram(imageHistogram, histogram, hueOffset)

  currentLayer++
  if (currentLayer > layers) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)
const layerCount = document.getElementById("layerCount")
const segmentCount = document.getElementById("hueSegment")
document.getElementById("numLayers").addEventListener("input", (event) => {
  layers = event.target.value;
  layerCount.innerHTML = layers;
  setup();
})

document.getElementById("hueSegment").addEventListener("input", (event) => {
  hueSegment = parseInt(event.target.value);
  setup();
})


document.getElementById("hueOffset").addEventListener("input", (event) => {
  hueOffset = parseInt(event.target.value);
  setup();
})

document.getElementById("segmentFlag").addEventListener("input", (event) => {
  segmentFlag = event.target.checked;
  setup();
})

const black = createColorPicker("#000000", 1)
const red = createColorPicker("#ff0000", 2)
const yellow = createColorPicker("#ffa742", 6)
const white = createColorPicker("#ffffff", 12)

const colorList = document.getElementById("colorList")
colorList.appendChild(black)
colorList.appendChild(red)
colorList.appendChild(yellow)
colorList.appendChild(white)

colorList.addEventListener("click", () => {
  setup();
})
