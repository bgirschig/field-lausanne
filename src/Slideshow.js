let sources;
let sourceIdx = 0;
let diagonal;
let slideshowWrapper;
export let transitionValue;

export function init(_sources) {
  sources = _sources;

  slideshowWrapper = document.querySelector('.slidewhow');
  diagonal = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) * 0.5;
}

export function next({ autoPlay = true } = {}) {
  const newItem = document.createElement('img');
  newItem.src = sources[sourceIdx];
  
  if (autoPlay) {
    // const transitionDuration = (parseFloat(getComputedStyle(slideshowWrapper.firstElementChild)['transitionDuration']));
    const transitionDuration = 0.8;
    newItem.onload = () => {
      setTimeout(()=> {
        newItem.style.setProperty('--ellipse-size', `${diagonal}px`);
        slideshowWrapper.lastChild.style.transform = "scale(1.2, 1.2)";
      }, 100);
    }
    setTimeout(()=> {
      if (slideshowWrapper.childCount > 1) {
        slideshowWrapper.removeChild(slideshowWrapper.firstChild);
      }
    }, transitionDuration*1000);
  }
  
  slideshowWrapper.appendChild(newItem);

  sourceIdx = (sourceIdx + 1) % sources.length;
}

export function setTransitionValue(val) {
  transitionValue = val;
  slideshowWrapper.lastElementChild.style.setProperty('--ellipse-size', `${val * diagonal}px`)
}