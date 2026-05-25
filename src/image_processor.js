const BIN_COUNT = 120;

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

export function buildAndMixColors(baseColor, selectedColor) {
  let mixColor = color(selectedColor["color"])
  return mixbox.lerp(color(baseColor).levels, mixColor.levels, selectedColor["opacity"]) // color mix using mixbox for accurate pigment mixing results
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
    if (currentLightness > maxLightness) { maxLightness = currentLightness }
  }

  return [minLightness, maxLightness]
}

export function buildPreview(image, colors) {
  let step = parseInt(image.width / colors.length)

  for (let i = 0; i < colors.length; i++) {
    for (let x = 0; x < image.width; x++) {
      if (i * step > x) { continue }
      for (let y = 0; y < image.height; y++) {
        let coord = (y * image.width + x) * 4;
        image.data[coord + 0] = colors[i][0]
        image.data[coord + 1] = colors[i][1]
        image.data[coord + 2] = colors[i][2]
        image.data[coord + 3] = 255
      }
    }
  }
  return image
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

export function addColorToList() {
  const colorList = document.getElementById("colorList")
  let colorPicker = createColorPicker();
  colorList.appendChild(colorPicker)
}

export function computeHueHistogram(img, hueOffset) {
  let hueBin = new Array(BIN_COUNT).fill(0);
  for (let i = 0; i < img.pixels.length; i += 4) {
    let c = color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]);
    let h = hue(c);
    h = (h + hueOffset) % 360

    let bin = floor(map(h, 0, 360, 0, BIN_COUNT));
    if (saturation(c) > 5 && lightness(c) > 5) {
      hueBin[bin]++;
    }
  }
  return hueBin
}

export function drawHistogram(imageHistogram, histogram, hueOffset) {
  colorMode(HSB, 360, 100, 100);
  let maxCount = max(histogram);
  let barWidth = imageHistogram.canvas.width / histogram.length;
  for (let h = 0; h < histogram.length; h++) {
    let barHeight = map(histogram[h], 0, maxCount, 0, imageHistogram.canvas.height - 10);
    let mappedHue = map(h, 0, BIN_COUNT, 0, 360)
    mappedHue = floor((mappedHue + 360 - hueOffset) % 360)
    imageHistogram.fillStyle = color(mappedHue, 100, 100);
    imageHistogram.fillRect(h * barWidth, imageHistogram.canvas.height - barHeight, barWidth, barHeight);
  }
  colorMode(RGB);
}

export function saveBnW(image) {
  let a = document.createElement("a");
  image.filter(GRAY)
  a.href = image.canvas.toDataURL("image/png");
  a.textContent = "Export black & white gradients"
  a.download = "my-image.png"; // filename
  let downloadBW = document.getElementById("download-bw")
  downloadBW.innerHTML = "";
  downloadBW.appendChild(a);
}
