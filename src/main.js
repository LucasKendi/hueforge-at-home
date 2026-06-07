p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync, renderPreview, createColorPicker, addColorToList, getLightness, computeHueHistogram, drawHistogram } from './image_processor.js';

const state = {
  layers: document.getElementById("layerCount").innerHTML,
  hueSegment: parseInt(document.getElementById("hueSegment").value),
  hueOffset: parseInt(document.getElementById("hueOffset").value),
}

let segmentFlag = document.getElementById("segmentFlag").checked;
let gradientCanvas = document.getElementById('gradientPreview')
let histogramCanvas = document.getElementById('imageHistogram')
let existingCanvas = document.getElementById('existing-canvas')
let finalWidth = existingCanvas.parentElement.offsetWidth;

let origImage, coloredImage;
let minLightness, maxLightness;
let layerRange, layerColors, histogram;
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
  prepareImages(origImage, coloredImage, finalWidth - 20);
  createCanvas(finalWidth, origImage.height, existingCanvas)
  image(origImage, 0, 0)
  histogram = computeHueHistogram(origImage, state.hueOffset)
}

window.draw = () => {
  let origPixels = origImage.pixels
  let inputColors = getLayerInfo();
  let currentColor = inputColors[Object.keys(inputColors)[0]]
  let lightnessRange = getLightness(origImage)

  minLightness = lightnessRange[0]
  maxLightness = lightnessRange[1]
  layerColors = [color(currentColor["color"])];
  for (let i = 1; i < state.layers; i++) {
    if (inputColors[i + 1]) { currentColor = inputColors[i + 1] }
    layerColors[i] = mixbox.lerp(color(layerColors[i - 1]), color(currentColor["color"]), currentColor["opacity"])
  }

  for (let i = 0; i < origPixels.length; i += 4) {
    if (origPixels[i + 3] == 0) continue; // skip transparent pixels on png files
    let currentValue = 0.2126 * origPixels[i] + 0.7152 * origPixels[i + 1] + 0.0722 * origPixels[i + 2];

    if (segmentFlag) {
      let currentPixel = color(origPixels[i + 0], origPixels[i + 1], origPixels[i + 2])
      let currentHue = floor(hue(currentPixel))
      let rotatedHue = (currentHue + state.hueOffset) % 360
      let dh = state.hueSegment - rotatedHue;
      let mixFactor = constrain(map(dh, -20, 20, 1, 0), 0, 1);

      currentValue = lerp(currentValue / 2, (currentValue / 2) + 128, mixFactor)
    }

    let colorIndex = constrain(parseInt(map(currentValue, minLightness, maxLightness, 0, state.layers - 1)), 0, state.layers - 1)
    coloredImage.pixels[i + 0] = layerColors[colorIndex][0]
    coloredImage.pixels[i + 1] = layerColors[colorIndex][1]
    coloredImage.pixels[i + 2] = layerColors[colorIndex][2]
  }

  coloredImage.updatePixels()
  image(coloredImage, coloredImage.width, 0)

  drawHistogram(histogramCanvas, histogram, state.hueOffset)
  renderPreview(gradientCanvas, layerColors)
}

function exportBnW() {
  const image = coloredImage;
  const copy = image.get();
  copy.filter(GRAY);
  const a = document.createElement("a");
  a.href = copy.canvas.toDataURL("image/png");
  a.download = "my-image.png";
  a.click();
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)
document.getElementById("download-bw").addEventListener("click", exportBnW);
document.querySelectorAll("[data-state]").forEach(input => {
  input.addEventListener("input", (event) => {
    const key = input.dataset.state;
    const output = document.getElementById(input.dataset.output);
    state[key] = Number(event.target.value);

    if (output) {
      output.textContent = state[key];
    }
  });
});

document.getElementById("segmentFlag").addEventListener("input", (event) => {
  segmentFlag = event.target.checked;
})

const colorList = document.getElementById("colorList")
colorList.addEventListener("click", () => {
  setup();
})
colorList.appendChild(createColorPicker("#000000", 1))
colorList.appendChild(createColorPicker("#ff0000", 2))
colorList.appendChild(createColorPicker("#ffe342", 6))
colorList.appendChild(createColorPicker("#ffffff", 12))
