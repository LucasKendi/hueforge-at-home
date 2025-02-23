p5.disableFriendlyErrors = true; //small performance boost
function preload(){
  name = "input_image.png"
  img = loadImage(name)
  copy = loadImage(name)
}

function setup(){
	start_time = Date.now()
	setup_variables();
	fixedImage();
	getLayerInfo();
	if(typeof img == 'undefined' || typeof copy == 'undefined' || !img.pixels || !copy.pixels) {
		noLoop()
	} else {
		loop();
	}
}

function setup_variables(){
	range = 255 // max color value
	layers = 30 // stl model layers
	layer = 1
	subd = parseInt(range/layers)
	prev_color = []
	dest_color = ''
	total = Date.now()
	existing = document.getElementById('existing-canvas')
	existing.getContext("2d", { willReadFrequently: true })
	final_w = existing.parentElement.offsetWidth
}

function addLayerInfo() {
	colorList = document.getElementById("colorList")
}

function fixedImage() {
	img.resize(final_w/2, 0);
	copy.resize(final_w/2, 0);
	img.loadPixels()
	copy.loadPixels()
	createCanvas(final_w + 20, img.height, existing);
}

function draw() {
  if(layer > layers || !colorsAt) {
		console.log("Total took "+ (Date.now() - start_time)/1000)
		noLoop();
		return;
	}

	let time = Date.now()
	let thresh = parseInt(subd * (layer - 1)) // threshold to change pixels
	let copyData = copy.pixels
	let imgData = img.pixels

	for (let cur_layer in colorsAt) {
    if (layer <= cur_layer) {
      targetColor = colorsAt[cur_layer];
      break;
    }
  }

	for(i = 0; i < imgData.length; i += 4){
		if (imgData[i + 3] == 0) continue; // skip on transparent pixels for png files

		current_value = (imgData[i] + imgData[i + 1] + imgData[i + 2])/3

		if(current_value >= thresh){
			orig_color = color(copyData[i], copyData[i + 1], copyData[i + 2])
			color_layer(targetColor)
		}
	}

	console.log("Layer " + layer + ", with "+ targetColor + ", taking: " + (Date.now() - time)/1000.0 + "s")
	copy.updatePixels()
	image(copy, 0, 0)
	image(img, img.width + 20, 0)
	layer++
}

function color_layer(cur_color) {
	if(prev_color[0]	!= cur_color[0]){
		prev_color = cur_color
		dest_color = color(cur_color[0])
	}
	result = mixbox.lerp(orig_color.levels, dest_color.levels, cur_color[1]) // color mix using mixbox for accurate pigment mixing results
  copy.pixels[i + 0] = result[0]
  copy.pixels[i + 1] = result[1]
  copy.pixels[i + 2] = result[2]
}

function handleImage() {
	file = select('#fileInput').elt.files[0]
	if (file.type.startsWith('image/')) {
		img = loadImage(URL.createObjectURL(file), () => {
			copy = createImage(img.width, img.height)
			copy.copy(img, 0, 0, img.width, img.height, 0, 0, copy.width, copy.height)
			img.resize(final_w/2, 0);
			copy.resize(final_w/2, 0);
			img.loadPixels()
			copy.loadPixels()
			createCanvas(final_w, img.height, existing);
			layer = 1;
			loop()
		})
	} else {
		img = null;
		copy = null;
	}
}

function getLayerInfo() {
	colorsAt = {}
	items = document.querySelectorAll('li.colorInput');
	items.forEach(element => {
		let color = element.querySelector("input.color").value
		let layer = element.querySelector("input.layer").value
		let opacity = element.querySelector("input.opacity").value
		colorsAt[layer] = [color, opacity]
	});
}