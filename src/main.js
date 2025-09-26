import { showToast } from './toast.js';
import { validateColor, validateLayer, validateOpacity } from './validation.js';
import { LoadingIndicator } from './loading.js';

const loadingIndicator = new LoadingIndicator();
p5.disableFriendlyErrors = true; //small performance boost
function preload(){
  name = "input_image.png"
  img = loadImage(name)
  copy = loadImage(name)
}

function setup(){
	try {
		setup_variables();
		fixedImage();
		if (!getLayerInfo()) {
			noLoop();
			return;
		}
		loop();
	} catch (err) {
		console.error('Error in setup:', err);
		showToast('An error occurred while setting up the application');
		noLoop();
	}
}

function setup_variables(){
	range = 255 // max color value
	layers = 20 // stl model layers
	layer = 1
	base_color = 'black'
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
	try {
		if (!img || !copy) {
			throw new Error('Image not properly loaded');
		}

		img.resize(final_w/2, 0);
		copy.resize(final_w/2, 0);

		try {
			img.loadPixels();
			copy.loadPixels();
		} catch (err) {
			console.error('Error loading pixels:', err);
			throw new Error('Failed to load image pixels');
		}

		try {
			createCanvas(final_w + 20, img.height, existing);
		} catch (err) {
			console.error('Error creating canvas:', err);
			throw new Error('Failed to create canvas');
		}

		// Verify canvas creation was successful
		if (!existing || !existing.getContext('2d')) {
			throw new Error('Canvas context not available');
		}
	} catch (err) {
		console.error('Error in fixedImage:', err);
		showToast(err.message || 'Error preparing image for processing');
		throw err;
	}
}

function draw() {
  if(layer <= layers && colorsAt) {
		if(typeof img !== 'undefined' && typeof copy !== 'undefined' && img.pixels && copy.pixels) {
			let time = Date.now();
			let thresh = parseInt(subd * (layer - 1)); // threshold to change pixels

			// Show loading indicator with progress
			loadingIndicator.show(`Processing layer ${layer}/${layers} (${Math.round(layer/layers * 100)}%)`);

			try {
				for(i = 0; i < img.pixels.length; i += 4){
					if (img.pixels[i + 3] == 0) continue; // skip on transparent pixels for png files

					orig_color = layer == 1 ? color(base_color) : color(copy.pixels[i], copy.pixels[i + 1], copy.pixels[i + 2]);
					current_value = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2])/3;

					if(current_value >= thresh){
						for(var cur_layer in colorsAt){
							if(layer <= cur_layer) {
								current_color = colorsAt[cur_layer];
								break;
							}
						}
						color_layer(current_color);
					}
				}

				console.log("Layer " + layer + ", with "+ current_color + ", taking: " + (Date.now() - time)/1000.0 + "s");
				copy.updatePixels();
				image(copy, 0, 0);
				image(img, img.width + 20, 0);
				layer++;
			} catch (err) {
				console.error('Error processing layer:', err);
				showToast('Error processing layer ' + layer);
				noLoop();
				loadingIndicator.hide();
				return;
			}
		}
	} else {
		loadingIndicator.hide();
		if (layer > layers) {
			showToast('Processing completed successfully', 'success');
		}
		noLoop();
	}
}

function color_layer(cur_color) {
	try {
		if (!cur_color || !Array.isArray(cur_color) || cur_color.length !== 2) {
			throw new Error('Invalid color format');
		}

		if(prev_color[0] !== cur_color[0]){
			prev_color = cur_color;
			try {
				dest_color = color(cur_color[0]);
			} catch (err) {
				console.error('Error creating color:', err);
				throw new Error('Invalid color value: ' + cur_color[0]);
			}
		}

		if (!orig_color || !orig_color.levels || !dest_color || !dest_color.levels) {
			throw new Error('Invalid color objects');
		}

		const result = mixbox.lerp(orig_color.levels, dest_color.levels, cur_color[1]); // color mix using mixbox for accurate pigment mixing results
		
		if (!result || result.length < 3) {
			throw new Error('Color mixing failed');
		}

		if (i + 2 >= copy.pixels.length) {
			throw new Error('Pixel index out of bounds');
		}

		copy.pixels[i + 0] = result[0];
		copy.pixels[i + 1] = result[1];
		copy.pixels[i + 2] = result[2];
	} catch (err) {
		console.error('Error in color_layer:', err);
		throw new Error('Failed to process color layer: ' + err.message);
	}
}

function handleImage() {
	try {
		const fileInput = select('#fileInput').elt;
		if (!fileInput.files || fileInput.files.length === 0) {
			showToast('Please select an image file');
			return;
		}

		file = fileInput.files[0];
		const maxSize = 10 * 1024 * 1024; // 10MB limit
		
		if (file.size > maxSize) {
			showToast('Image file is too large. Maximum size is 10MB');
			return;
		}

		if (!file.type.startsWith('image/')) {
			showToast('Please select a valid image file (PNG, JPG, etc.)');
			return;
		}

		// Show loading state
		const loadingToast = showToast('Loading image...', 'info');

		img = loadImage(
			URL.createObjectURL(file), 
			() => {
				try {
					copy = createImage(img.width, img.height);
					copy.copy(img, 0, 0, img.width, img.height, 0, 0, copy.width, copy.height);
					img.resize(final_w/2, 0);
					copy.resize(final_w/2, 0);
					img.loadPixels();
					copy.loadPixels();
					createCanvas(final_w, img.height, existing);
					layer = 1;
					loop();
					showToast('Image loaded successfully', 'success');
				} catch (err) {
					console.error('Error processing image:', err);
					showToast('Error processing image. Please try again');
				}
			},
			(err) => {
				console.error('Error loading image:', err);
				showToast('Failed to load image. Please try a different file');
			}
		);
	} catch (err) {
		console.error('Error in handleImage:', err);
		showToast('An unexpected error occurred. Please try again');
	}
}

function getLayerInfo() {
	try {
		colorsAt = {};
		const items = document.querySelectorAll('li.colorInput');
		const errors = [];

		items.forEach((element, index) => {
			const colorInput = element.querySelector("input.color");
			const layerInput = element.querySelector("input.layer");
			const opacityInput = element.querySelector("input.opacity");

			const color = colorInput.value;
			const layer = layerInput.value;
			const opacity = opacityInput.value;

			// Validate color
			if (!validateColor(color)) {
				errors.push(`Invalid color "${color}" in row ${index + 1}`);
				colorInput.classList.add('invalid');
			} else {
				colorInput.classList.remove('invalid');
			}

			// Validate layer
			const layerValidation = validateLayer(layer, layers);
			if (!layerValidation.isValid) {
				errors.push(`${layerValidation.message} in row ${index + 1}`);
				layerInput.classList.add('invalid');
			} else {
				layerInput.classList.remove('invalid');
			}

			// Validate opacity
			const opacityValidation = validateOpacity(opacity);
			if (!opacityValidation.isValid) {
				errors.push(`${opacityValidation.message} in row ${index + 1}`);
				opacityInput.classList.add('invalid');
			} else {
				opacityInput.classList.remove('invalid');
			}

			if (layerValidation.isValid && opacityValidation.isValid) {
				colorsAt[layer] = [color, parseFloat(opacity)];
			}
		});

		if (errors.length > 0) {
			errors.forEach(error => showToast(error));
			return false;
		}

		// Add some CSS styles for invalid inputs
		const style = document.createElement('style');
		style.textContent = `
			input.invalid {
				border-color: #ef4444 !important;
				background-color: #fee2e2 !important;
			}
		`;
		document.head.appendChild(style);

		return true;
	} catch (err) {
		console.error('Error in getLayerInfo:', err);
		showToast('An error occurred while validating inputs');
		return false;
	}
}