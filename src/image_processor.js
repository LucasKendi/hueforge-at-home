export function getLayerInfo() {
  let colorsAt = {}
  let items = document.querySelectorAll('li.colorInput');
  items.forEach(element => {
    let color = element.querySelector("input.color").value
    let layer = element.querySelector("input.layer").value
    let opacity = element.querySelector("input.opacity").value
    colorsAt[layer] = [color, opacity]
  });
  return colorsAt
}

export function prepareImages(source, destination) {
  let existingCanvas = document.getElementById('existing-canvas')
  existingCanvas.getContext("2d", { willReadFrequently: true })
  let finalWidth = existingCanvas.parentElement.offsetWidth;

  source.resize(finalWidth / 2, 0);
  destination.resize(finalWidth / 2, 0);

  source.loadPixels()
  destination.loadPixels()
  createCanvas(finalWidth + 20, source.height, existingCanvas)
}

export function loadImageAsync(filePath) {
  return new Promise((resolve, reject) => {
    let fileUrl = URL.createObjectURL(filePath);

    loadImage(fileUrl, img => resolve(img), err => reject(err))
  })
}
