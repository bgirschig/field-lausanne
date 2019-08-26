export function download(filename, data={}, mime='application/json', charset='utf-8') {
  let content;
  if (typeof data === 'string') content = data;
  else content = JSON.stringify(data);

  content = encodeURIComponent(content);
  const link = `data:${mime};charset=${charset},${content}`;

  var element = document.createElement('a');
  element.setAttribute('href', link);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function toFloatStr(value) {
  let strValue = value.toString();
  if (!strValue.includes('.')) strValue += '.0';
  return strValue;
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}

export function shuffle(array) {
  let counter = array.length;
  while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let tmp = array[counter];
      array[counter] = array[index];
      array[index] = tmp;
  }
  return array;
}

export function clamp (val, min=0, max=1) {
  return Math.min(Math.max(val, min), max);
}

export function smoothStep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}