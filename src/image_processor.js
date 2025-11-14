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