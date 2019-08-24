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
    this.prevValue = 0;
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

    this.loop();
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

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    
    if (!this.active) return;
    this.valueHistory.append(this.latestValue);
    const smoothedValue = this.valueHistory.average;

    const now = performance.now();
    // 
    const deltaTime = now - this.prevTime;
    const delta = smoothedValue - this.prevValue;
    // 
    this.prevValue = smoothedValue;
    this.prevTime = now;

    const speed = delta / deltaTime;
    this.speedHistory.append(speed);
    const smoothedSpeed = this.speedHistory.average;

    const output = {
      value: this.latestValue,
      deltaTime,
      speed,
      smoothedValue,
      smoothedSpeed,
    };

    // console.log(output);
    this.onValue(output);
  }

  handleValue(value) {
    if (!this.active) return;
    if (this.swap) value = -value;
    
    value = value - this.offset;
    this.latestValue = value;
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