
// Values below this are not taken into account for apogee determination
const INERT_VALUE_RANGE = 0.15;
// How many frames to wait before confirming an apogee
const DEBOUNCE_COUNT = 3;

/** Handles connection with detector server and interprets the values */
export default class SwingDetector {
  constructor(onValue) {
    this.prevValue = null;
    this.prevTime = null;
    this.prevDirection = 0;
    this.currentDirection = 1;
    this.dirty = false;
    this.debounceValue = 0;

    this.onValue = onValue;
    this.ws = new WebSocket('ws://localhost:9000');
  
    this.ws.onopen = function() {
      console.log('connected to socket server');
    };

    this.ws.onmessage = () => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  handleMessage(message) {
    console.log(message);
    const value = message;

    const now = performance.now();
    const deltaTime = now - this.prevTime;
    this.prevTime = now;

    const speed = (this.prevValue - value) / deltaTime;
    const direction = Math.sign(speed);
    const absValue = Math.abs(value);

    const output = {
      value,
      absValue,
      deltaTime,
      speed,
      apogee: null,
    };

    // Detect apogees
    if (absValue > INERT_VALUE_RANGE && direction != this.currentDirection ) {
      if (!this.dirty) {
        if (this.debounceValue < DEBOUNCE_COUNT) this.debounceValue += 1;
        else {
          this.debounceValue = 0;
          this.currentDirection = direction;
          output.apogee = direction === -1 ? 'front' : 'back';
          this.dirty = true;
          console.log(output.apogee);
        }
      }
    }
    // if (this.dirty && value === what) {
    //   this.dirty = false;
    // }
    
    this.onValue(output);

    this.prevDirection = direction;
    this.prevValue = value;
  }

  get camera() {
    return this._camera || null;
  }
  set camera(index) {
    this._camera = index;
    console.log('Set camera index to', index);
    this.send({ 'action': 'setCamera', 'value': index });
  }

  async getCameraList() {
    const list = await navigator.mediaDevices.enumerateDevices()
    return list.filter(device => device.kind === 'videoinput').map(device => device.label);
  }
  send(payload) {
    console.log("sending", payload);
    this.ws.send(JSON.stringify(payload));
  }
}