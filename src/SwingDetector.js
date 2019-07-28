import RollingArray from "./rollingArray";
import WatchableObject from "./watchableObject";
import { download, toFloatStr } from "./utils";

const RESET_DELAY = 500;
// How many frames to wait before confirming an apogee
const DEBOUNCE_COUNT = 3;

/** Handles connection with detector server and interprets the values */
export default class SwingDetector {
  constructor(onValue) {
    this._camera = 0;
    this.zone = new WatchableObject({minX: 0, maxX: 1, height: 10, y: 0.5}, this.onZoneChange.bind(this));
    this.valueHistory = new RollingArray(10);
    this.speedHistory = new RollingArray(3);
    this.apogeeSpeedTreshold = 0.1;
    this.inertRange = 0.15;
    this.resetRange = 0.1;
    this.prevValue = null;
    this.prevTime = null;
    this.prevDirection = 0;
    this.currentDirection = 1;
    this.active = true;
    this.resetStart;
    this.swap = true;
    this.offset = 0;

    this.recording = '';
    this.recordingName = 'swing_values.csv';
    this.record = false;

    this.onValue = onValue;
    
    this.ws = new WebSocket('ws://localhost:9000');
    this.ws.onmessage = (evt) => {
      const { type, value } = JSON.parse(evt.data);
      if (type === 'detectorValue') this.handleValue(value);
      if (type === 'detectorDisplay') this.handleDisplay(value);
    }
  }

  waitConnection() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    else return new Promise(resolve => this.ws.onopen = resolve);
  }

  send(data) {
    data.payload = data.payload || {}
    this.ws.send(JSON.stringify(data));
  }

  handleDisplay(display) {
    document.querySelector('img.view').src = `data:image/jpeg;base64,${display}`;
  }

  onZoneChange(newZone) {
    this.updateConfig({zone: newZone});
  }

  handleValue(value) {
    if (!this.active) return;
    if (this.swap) value = -value;

    const now = performance.now();
    const deltaTime = now - this.prevTime;
    this.prevTime = now;
    if (this.record) {
      if (!this.recordStartTime) this.recordStartTime = now;
      const time = now - this.recordStartTime;
      this.recording += `${toFloatStr(time)},${toFloatStr(value)}\n`;
    } else if (this.recordStartTime) {
      this.recording = '';
      this.recordStartTime = null;
    }
    
    value = value - this.offset;
    this.valueHistory.append(value);

    const smoothedValue = this.valueHistory.average;
    const speed = (this.prevValue - smoothedValue) / deltaTime;
    const direction = Math.sign(speed);
    const absValue = Math.abs(value);
    const side = Math.sign(value);
    const sideLabel = side === -1 ? 'front' : 'back';
    
    this.speedHistory.append(speed);
    const smoothedSpeed = this.speedHistory.average;

    const output = {
      value,
      absValue,
      deltaTime,
      speed,
      apogee: null,
      prevApogee: null,
      side: sideLabel,
      smoothedValue,
      smoothedSpeed,
    };
    
    // Detect apogees
    // Ignore anything inside the inert range
    const isApogeeRange = absValue > this.inertRange && this.prevApogee != side;
    const isApogeeSpeed = Math.abs(smoothedSpeed) > this.apogeeSpeedTreshold && direction === side;
    const isResetRange = absValue < this.resetRange;

    if (isApogeeRange) {
      // Reset if we're on the other side, far enough
      this.prevApogee = null;
      this.prevApogeeValue = null;
    }
    if (isApogeeRange && isApogeeSpeed) {
      this.prevApogee = side;
      this.prevApogeeValue = value;
      output.apogee = sideLabel;
    }
    
    // Reset when sitting in the inert range for a while
    if (isResetRange) {
      if (!this.resetStart) this.resetStart = now;
      if (now - this.resetStart > RESET_DELAY) {
        this.prevApogee = null;
        this.prevApogeeValue = null;
      }
    } else {
      this.resetStart = null;
    }
    
    output.prevApogeeValue = this.prevApogeeValue;
    
    this.onValue(output);

    this.prevDirection = direction;
    this.prevValue = smoothedValue;
  }

  downloadRecording() {
    download(this.recordingName, this.recording, 'text/csv');
    this.record = false;
  }

  updateConfig(data) {
    this.send({ 'action': 'updateConfig', 'payload': data });
  }

  get camera() {
    return this._camera;
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
    document.querySelector('img.view').style.display = value ? '' : 'none';
    this.updateConfig({ 'display': value });
  }
  get zone() {
    return this._zone;
  }
  set zone(value) {
    this._zone = value;
  }

  async getCameraList() {
    const list = await navigator.mediaDevices.enumerateDevices()
    return list.filter(device => device.kind === 'videoinput').map(device => device.label);
  }
}