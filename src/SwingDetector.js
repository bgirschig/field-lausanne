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
    this.debounceValue = 0;
    this.active = false;

    this.onValue = onValue;
    
    this.ws = new WebSocket('ws://localhost:9000');
    this.ws.onmessage = (evt) => {
      const { type, value } = JSON.parse(evt.data);
      if (type === 'detectorValue') this.handleValue(value);
      else if (type === 'config') console.log('new config: ', value);
    }
  }

  send(data) {
    data.payload = data.payload || {}
    this.ws.send(JSON.stringify(data));
  }

  handleValue(value) {
    if (!this.active) return;
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
      if (this.debounceValue < DEBOUNCE_COUNT) this.debounceValue += 1;
      else {
        this.debounceValue = 0;
        this.currentDirection = direction;
        output.apogee = direction === -1 ? 'front' : 'back';
        console.log(output.apogee);
      }
    }
    
    this.onValue(output);

    this.prevDirection = direction;
    this.prevValue = value;
  }

  updateConfig(data) {
    this.send({ 'action': 'updateConfig', 'payload': data });
  }

  get camera() {
    return this._camera || null;
  }
  set camera(value) {
    value = parseInt(value);
    this._camera = value;
    this.updateConfig({ 'camera': value });
  }
  get display() {
    return this._display || false;
  }
  set display(value) {
    this._display = value;
    this.updateConfig({ 'display': value });
  }

  async getCameraList() {
    const list = await navigator.mediaDevices.enumerateDevices()
    return list.filter(device => device.kind === 'videoinput').map(device => device.label);
  }
}