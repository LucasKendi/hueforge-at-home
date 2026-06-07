export function getLayerInfo() {
  let colorsAt = {}
  let items = document.querySelectorAll('li.color-input');
  items.forEach(element => {
    let color = element.querySelector("input").value
    let layer = element.querySelector("input.layer").value
    let opacity = element.querySelector("input.opacity").value
    colorsAt[layer] = { "color": color, "opacity": opacity }
  });
  return colorsAt
}

export function prepareImages(source, destination, finalWidth) {
  source.resize(finalWidth / 2, 0);
  destination.resize(finalWidth / 2, 0);

  source.loadPixels()
  destination.loadPixels()
}

export function loadImageAsync(filePath) {
  return new Promise((resolve, reject) => {
    let fileUrl = URL.createObjectURL(filePath);

    loadImage(fileUrl, img => resolve(img), err => reject(err))
  })
}

export function getLightness(image) {
  let minLightness = 255;
  let maxLightness = 0;
  for (let i = 0; i < image.pixels.length; i++) {
    let r = image.pixels[i + 0];
    let g = image.pixels[i + 1];
    let b = image.pixels[i + 2];
    let currentLightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (currentLightness < minLightness) { minLightness = currentLightness }
    else if (currentLightness > maxLightness) { maxLightness = currentLightness }
  }

  return [minLightness, maxLightness]
}

export function renderPreview(image, colors) {
  let ctx = image.getContext("2d");
  let step = image.width / colors.length

  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i]
    ctx.fillRect(i*step, 0, step, image.height)
  }

  return image
}

export function computeHueHistogram(img) {
  let hueBin = new Array(360).fill(0);
  for (let i = 0; i < img.pixels.length; i += 4) {
    if(img.pixels[i + 3] == 0) { continue; }
    let c = color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]);
    if (saturation(c) > 5 && lightness(c) > 5) {
      let h = floor(hue(c));
      hueBin[h]++;
    }
  }
  return hueBin
}

export function drawHistogram(histogramCanvas, histogram, hueOffset) {
  colorMode(HSB, 360, 100, 100);
  let maxCount = max(histogram);
  let barWidth = histogramCanvas.width / histogram.length;
  let context = histogramCanvas.getContext("2d", { willReadFrequently: true })
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (let i = 0; i < histogram.length; i++) {
    let barHeight = map(histogram[i], 0, maxCount, 0, context.canvas.height - 5);
    let start = (i + hueOffset) % 360

    context.fillStyle = color(i, 100, 100);
    context.fillRect(start * barWidth, context.canvas.height - barHeight, barWidth + 1, barHeight);
  }
  colorMode(RGB);
}

export function addColorToList() {
  const colorList = document.getElementById("colorList")
  let colorPicker = createColorPicker();
  colorList.appendChild(colorPicker)
}

export function createColorPicker(initialColor = "#ffffff", initialLayer = 1) {
  const wrapper = document.createElement("li");
  wrapper.className = "color-input btn-primary hover:border-slate-600 rounded-lg divide-x divide-slate-500";
  wrapper.innerHTML = `
    <div class="w-1/3 relative">
      <input type="color" value="${initialColor}" class="w-full h-full absolute z-10 opacity-0 cursor-pointer"
        onchange="this.nextElementSibling.style.backgroundColor = this.value" />
      <div class="rounded-l-lg absolute h-8 w-full bg-[${initialColor}] "></div>
    </div>
    <input class="w-1/3 layer px-2" type="number" value="${initialLayer}" />
    <input class="w-1/3 opacity px-2" type="number" step="0.05" min="0" max="1" value="0.35" />
    <div onclick="this.parentNode.remove()" class="content-center bg-slate-900 rounded-r-lg px-1.5">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    `;
  return wrapper
}
