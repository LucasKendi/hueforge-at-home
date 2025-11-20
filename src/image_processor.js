export function getLayerInfo() {
  let colorsAt = {}
  let items = document.querySelectorAll('li.colorInput');
  items.forEach(element => {
    let color = element.querySelector("input.color").value
    let layer = element.querySelector("input.layer").value
    let opacity = element.querySelector("input.opacity").value
    colorsAt[layer] = { "color": color, "opacity": opacity }
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
  createCanvas(finalWidth, source.height, existingCanvas)
}

export function loadImageAsync(filePath) {
  return new Promise((resolve, reject) => {
    let fileUrl = URL.createObjectURL(filePath);

    loadImage(fileUrl, img => resolve(img), err => reject(err))
  })
}

export function buildAndMixColors(baseColor, selectedColor) {
  let mixColor = color(selectedColor["color"])
  return mixbox.lerp(color(baseColor).levels, mixColor.levels, selectedColor["opacity"]) // color mix using mixbox for accurate pigment mixing results
}

export function paintPreview(image, colors) {
  let data = image.data;
  let ignore = parseInt(image.width/colors.length)
  for (let i = 0; i < colors.lenght; i++) {
    for (let x = 0; x < image.width; x++) {
      if (i * ignore > x) { continue }
      for (let y = 0; y < image.height; y++) {
        let coord = (y * image.width + x) * 4;
        image.data[coord + 0] = colors[i][0]
        image.data[coord + 1] = colors[i][1]
        image.data[coord + 2] = colors[i][2]
        image.data[coord + 3] = 255
      }
    }
  }
  return data
}