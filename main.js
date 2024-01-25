p5.disableFriendlyErrors = true; //small performance boost
function preload(){
	input = createFileInput(handleImage);
	input.position(1240, 100);
	input.class("p-5 bg-black text-white")
}

function setup(){
	use_gray = true // WIP for working with hue threshold 
	range = use_gray ? 255 : 360 // rgb vs hue ranges
	final_w = 600 // scaling factor for images, use 2 or more if it takes too long to process
	layers = 20 // stl model layers
	layer = 1
	base_color = 'black'

	subd = parseInt(range/layers)

	total = Date.now()
	prev_color = []
	dest_color = ''
}

function draw() {
	if(layer <= layers) {
		if(typeof img !== 'undefined' && typeof copy !== 'undefined' && img.pixels && copy.pixels) {		
			let time = Date.now()
			let thresh = parseInt(subd * (layer - 1)) // threshold to change pixels
			for(i = 0; i < img.pixels.length; i+=4){
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
			console.log("Layer " + layer + ", with "+ current_color + ", taking: " + (Date.now() - time)/1000.0 + "s")
			copy.updatePixels()
			image(copy, 0, 0)	
			image(img, img.width + 20, 0)	
			layer++
		}
	} else {
		console.log("Took:" + (Date.now() - total)/1000.0 + "s")
		noLoop()
	}
}

function color_layer(c_color) {
	if(prev_color[0]	!= c_color[0]){
		prev_color = c_color
		dest_color = color(c_color[0])
	}
	result = mixbox.lerp(orig_color.levels, dest_color.levels, c_color[1]) // color mix using mixbox for accurate pigment mixing results
	copy.pixels[i + 0] = result[0]
	copy.pixels[i + 1] = result[1]
	copy.pixels[i + 2] = result[2]
}

function handleImage(file) {
  if (file.type === 'image') {
		img = loadImage(file.data, () => {
			copy = createImage(img.width, img.height)
			copy.copy(img, 0, 0, img.width, img.height, 0, 0, copy.width, copy.height)
			layer = 0
			img.resize(final_w, 0);
			copy.resize(final_w, 0);
			img.loadPixels()
			copy.loadPixels()
			createCanvas(img.width*2 + 200, img.height);
			draw()
		})
  } else {
    img = null;
		copy = null;
  }
}