const colorNameToHex = {
  'black': '#000000',
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#00FF00',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  // Add more color names as needed
};

export const validateColor = (color) => {
  // Check if it's a valid color name
  if (typeof color === 'string') {
    const lowerColor = color.toLowerCase();
    if (colorNameToHex[lowerColor]) {
      return true;
    }
  }

  // Check if it's a valid hex color
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(color)) {
    return true;
  }

  return false;
};

export const validateLayer = (layer, totalLayers) => {
  const layerNum = parseInt(layer);
  if (isNaN(layerNum)) {
    return { isValid: false, message: 'Layer must be a number' };
  }
  
  if (layerNum < 1) {
    return { isValid: false, message: 'Layer must be greater than 0' };
  }

  if (layerNum > totalLayers) {
    return { isValid: false, message: `Layer must be less than or equal to ${totalLayers}` };
  }

  return { isValid: true };
};

export const validateOpacity = (opacity) => {
  const opacityNum = parseFloat(opacity);
  if (isNaN(opacityNum)) {
    return { isValid: false, message: 'Opacity must be a number' };
  }

  if (opacityNum < 0 || opacityNum > 1) {
    return { isValid: false, message: 'Opacity must be between 0 and 1' };
  }

  return { isValid: true };
};