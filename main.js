p5.disableFriendlyErrors = true; //small performance boost
function preload(){
	name = "input_image.png"
	img = loadImage(name)
	copy = loadImage(name)
}

function setup(){
	use_gray = true // WIP for working with hue threshold 
	range = use_gray ? 255 : 360 // rgb vs hue ranges
	factor = 1 // scaling factor for images, use 2 or more if it takes too long to process
	layers = 15 // stl model layers
	layer = 1
	base_color = 'black'

	subd = parseInt(range/layers)
	img.resize(img.width/factor, img.height/factor);
	copy.resize(copy.width/factor, copy.height/factor);
	img.loadPixels()
	copy.loadPixels()
	start = new Date()
	createCanvas(img.width*2 + 20, img.height);
}

function draw() {
	if(layer <= layers) {
		let thresh = parseInt(subd * (layer - 1)) // threshold to change pixels
		for(i = 0; i < copy.pixels.length; i+=4){
			if (img.pixels[i + 3] == 0) continue; // skip on transparent pixels for png files

			if (layer == 1) { // the origin color for the color mix. After the first layer, it is the current image's color
				orig_color = color(base_color)
			} else {
				orig_color = color(copy.pixels[i], copy.pixels[i + 1], copy.pixels[i + 2])
			}

			if (use_gray) {
				current_value = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2])/3
			} else {
				let c = color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2])
				current_value = hue(c)
			}

			if(current_value >= thresh){ // use this switch-case to setup your layer changes. Add or remove layers and set mix-factor as you wish
				switch(true) {
					case(layer <= 1):
						current_color = [base_color, 0.3] // current_color is a size 2 array with a p5 color definition and it's "translucency"
						break;
					case(layer <= 3):
						current_color = ["blue", 0.3] 
						break;
					case(layer <= 11):
						current_color = ["yellow", 0.3]
						break;
					case(layer <= 15):
						current_color = ["white", 0.3]
						break;
				}
				color_layer(current_color)
			}
		}

		console.log("Layer " + layer + ', with '+ current_color)
		copy.updatePixels()
		image(copy, 0,0)	
		image(img, img.width + 20,0)	
		layer++
	}
}

function color_layer(c_color) {
	dest_color = color(c_color[0])
	result = mixbox.lerp(orig_color.levels, dest_color.levels, c_color[1]) // color mix using mixbox for accurate pigment mixing results
	copy.pixels[i + 0] = result[0]
	copy.pixels[i + 1] = result[1]
	copy.pixels[i + 2] = result[2]
}
