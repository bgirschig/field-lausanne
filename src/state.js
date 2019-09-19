import watchableObject from "@/utils/watchableObject";
import EventHandler from "@/utils/EventHandler";

const eventhandler = new EventHandler();

function onChange() {
  eventhandler.invoke('change', state);
}

const state = new watchableObject({
  screenWidth: 500,
  screenHeight: 500,
  get screenRatio() {
    return this.screenWidth / this.screenHeight;
  },
  get screenWidth() {
    return window.innerWidth - this.offsetRight - this.offsetLeft;
  },
  get screenHeight() {
    return window.innerHeight - this.offsetBottom - this.offsetTop;
  },
  imagesMap: [],
  offsetLeft: 0,
  offsetTop: 0,
  offsetRight: 0,
  offsetBottom: 0,
  offsetAspect: -0.265,
  debug: false,
  emulate: false,
}, onChange);

eventhandler.bind(state);

export default state;