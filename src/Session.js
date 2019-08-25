import { sources } from "./data.js";
import { randomPick, shuffle } from "./utils.js";

export default class Session {
  constructor() {
    this.images = shuffle(randomPick(sources));
    this.imageScales = [];
    this.dom = document.querySelector('.slidewhow');
    this.sourceIdx = 0;
    this.onResize();
    this.loadNext();
    this.transitionPos = 0;
  }

  onResize() {
    this.diagonal = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) * 0.5;
  }

  onValue(e) {
    // if (this.transitionPos > 0) this.imageScale *= 1.005;
    this.dom.childNodes.forEach((item, idx) => {
      if (idx >= this.dom.childElementCount - 1 && this.transitionPos === 0) return;
      this.imageScales[idx] *= 1.001;
      item.style.transform = `scale(${this.imageScales[idx]}, ${this.imageScales[idx]})`;
    });

    if (this.swapped && e.direction === 'forward' && e.prevDirection === 'backward') this.swapped = false;
    if (this.swapped) return;
    
    if (e.direction === 'forward' || this.transitionPos > 0.8) {
      this.transitionPos += Math.abs(e.smoothedValue) * 0.2;
    } else if (this.transitionPos > 0) {
      this.transitionPos += 0.0002;
    }

    if (this.shouldSwap) {
      this.unloadOldest();
      this.loadNext();
      this.swapped = true;
      this.transitionPos = 0;
      this.shouldSwap = false;
      this.imageScale = 1;
    }
    if (this.transitionPos >= 1) this.shouldSwap = true;
  }

  get transitionPos() {
    return this._transitionPos;
  }
  set transitionPos(val) {
    this._transitionPos = val;
    if (this.dom.lastElementChild) {
      this.dom.lastElementChild.style.setProperty('--ellipse-size', `${val * this.diagonal}px`);
    }
  }

  loadNext() {
    const newItem = document.createElement('img');
    newItem.src = this.images[this.sourceIdx];
    this.sourceIdx = (this.sourceIdx + 1) % this.images.length;
    this.dom.appendChild(newItem);
    this.imageScales.push(1);
  }

  unloadOldest(keepOne = true) {
    if (keepOne && this.dom.childElementCount <= 1) return;
    if (this.dom.firstChild) {
      this.dom.removeChild(this.dom.firstChild);
      this.imageScales = this.imageScales.slice(1);
    }
  }
}