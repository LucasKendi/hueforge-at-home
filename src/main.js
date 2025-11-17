p5.disableFriendlyErrors = true; //small performance boost
import { getLayerInfo, prepareImages, loadImageAsync, buildAndMixColors } from './image_processor.js';

let origImage, coloredImage, startTime;
let layers = 15;
let currentLayer = 0;
let subdivisions = parseInt(255 / layers);
let inputColors = getLayerInfo();
let selectedColor;

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
  currentLayer = 0;
  startTime = Date.now()
  prepareImages(origImage, coloredImage);

  if (typeof origImage == 'undefined' || typeof coloredImage == 'undefined' || !origImage.pixels || !coloredImage.pixels) {
    noLoop()
  } else {
    loop();
  }
}

window.draw = () => {
  let time = Date.now()
  let threshold = parseInt(subdivisions * (currentLayer - 1)) // threshold to change pixels
  let coloredPixels = coloredImage.pixels
  let origPixels = origImage.pixels

  if (selectedColor) {
    if (inputColors[currentLayer]) { selectedColor = inputColors[currentLayer] }
  } else {
    selectedColor = inputColors[Object.keys(inputColors)[0]]
  }

  for (let i = 0; i < origPixels.length; i += 4) {
    if (origPixels[i + 3] == 0) continue; // skip transparent pixels on png files

    let currentValue = (origPixels[i] + origPixels[i + 1] + origPixels[i + 2]) / 3
    if (currentValue >= threshold) {
      let origColor = color(Array.from(coloredPixels.slice(i, i + 3)))
      let result = buildAndMixColors(origColor, selectedColor)

      coloredImage.pixels[i + 0] = result[0]
      coloredImage.pixels[i + 1] = result[1]
      coloredImage.pixels[i + 2] = result[2]
    }
  }

  console.log("current layer " + currentLayer + ", with " + selectedColor["color"] + ", taking: " + (Date.now() - time) / 1000.0 + "s")
  coloredImage.updatePixels()
  image(coloredImage, 0, 0)
  image(origImage, origImage.width, 0)
  currentLayer++

  if (currentLayer > layers || !inputColors) {
    console.log("Total took " + (Date.now() - startTime) / 1000)
    noLoop();
    return;
  }
}

document.getElementById("fileInput").addEventListener("change", handleImageInput)
