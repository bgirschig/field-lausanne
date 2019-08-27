/** Donwload some data as a file */
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

/** Pick a random element from an array */
export function randomPick(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}

/** shuffle the given array */
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

/** return clamped value between min and max */
export function clamp (val, min=0, max=1) {
  return Math.min(Math.max(val, min), max);
}

/** see https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/smoothstep.xhtml */
export function smoothStep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Waits for the given duration then continues the promise chain (passes data
 * through, unchanged)
 * @param {int} duration duration to wait for (in milliseconds)
 * @return {function<Promise>}
 */
export function wait(duration) {
  return function(data) {
    return new Promise((resolve, _reject)=>{
      setTimeout(()=>resolve(data), duration);
    });
  };
}

/**
 * Should be used in async functions, to await for a given number of seconds
 * @param {*} count Number of seconds to wait for before yielding
 * @return {Promise<void>} a promise that resolves after a number of seconds
 */
export function seconds(count) {
  return millis(count*1000);
}

/**
 * Should be used in async functions, to await for a given number of millis
 * @param {*} count Number of millis to wait for before yielding
 * @return {Promise<void>} a promise that resolves after a number of millis
 */
export function millis(count) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const MILLIS_PER_MINUTE = 1000*60;
export const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;