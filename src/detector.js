import RollingArray from "./utils/rollingArray";
import WatchableObject from "./utils/watchableObject";
import { download, millis, MILLIS_PER_MINUTE } from "./utils/utils";

// Connetion config
const BACKOFF_FACTOR = 1.2;
const MAX_BACKOFF_MILLIS = MILLIS_PER_MINUTE*5;
const MIN_BACKOFF = 100;
// sleep config
const SLEEP_DELAY = 3000;

/** Handles connection with detector server and interprets the values */
export default class SwingDetector {
  constructor(onValue, onSleep) {
    this.onValue = onValue;
    this.onSleep = onSleep;

    // sensor connection
    this.reconnectionDelay = 0;
    this.tryConnecting();

    // input config
    this._camera = 0;
    this.zone = new WatchableObject({minX: 0, maxX: 1, height: 10, y: 1.0}, this.onZoneChange.bind(this));
    // Values are smoothed over a few frames (using the average of the last x frames)
    this.valueHistory = new RollingArray(10);
    this.speedHistory = new RollingArray(3);
    this.latestValue = 0;
    // analysis parameters
    this.speedTreshold = 0.0007;
    this.inertRange = 0.06;
    // Basic detector state
    this.prevValue = 0;
    this.prevTime = null;
    this.active = true;
    this.swap = false;
    this.offset = 0.048;
    // amplitude state
    this.max_value = Number.NEGATIVE_INFINITY;
    this.min_value = Number.POSITIVE_INFINITY;
    this.amplitude = null;
    // recording config
    this.recording = '';
    this.recordingName = 'swing_values.csv';
    this.record = false;
    
    this.sleep = true;
    
    this.loop();
  }

  async tryConnecting() {
    if(this.reconnectionDelay > 0) await millis(this.reconnectionDelay);
    console.log('trying to connect');

    this.ws = new WebSocket('ws://localhost:9000');
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onopen = this.onConnect.bind(this);

    if (this.reconnectionDelay === 0) this.reconnectionDelay = MIN_BACKOFF;
    this.reconnectionDelay = Math.min(this.reconnectionDelay * BACKOFF_FACTOR, MAX_BACKOFF_MILLIS);
    this.ws.onclose = this.tryConnecting.bind(this);
  }

  onConnect() {
    console.log('connected');
    this.reconnectionDelay = 0;
    if (this.pendingConfig) this.updateConfig(this.pendingConfig);
    this.pendingConfig = null;
  }

  onMessage(evt) {
    let { type, value } = JSON.parse(evt.data);
    if (type === 'detectorValue') {
      if (!this.active) return;
      if (this.swap) value = -value;
      
      value = value - this.offset;
      this.latestValue = value;
      
      // Handle sleep cycle: if the swing is idle for a while, slow down the
      // detection rate and skip analysis (until the swing moves again)
      const isInert = Math.abs(value) < this.inertRange;
      if (!isInert) {
        // wake up as soon as we get a value outside the inert range
        this.sleep = false;
        if (this.sleepRequest) {
          clearTimeout(this.sleepRequest);
          this.sleepRequest = null;
        }
      } else if (!this.sleep && !this.sleepRequest) {
        this.sleepRequest = setTimeout(()=>{
          this.sleep = true;
          this.sleepRequest = null;
        }, SLEEP_DELAY);
      }
    } else if (type === 'detectorDisplay') {
      document.querySelector('.detectorDisplay').src = `data:image/jpeg;base64,${value}`;
    }
  }

  send(data) {
    data.payload = data.payload || {}
    this.ws.send(JSON.stringify(data));
  }


  onZoneChange(newZone) {
    this.updateConfig({zone: newZone});
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    
    if (!this.active || this.sleep) return;
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
    
    this.amplitude;
    if (speed >  this.speedTreshold) {
      if (this.min_value) {
        this.amplitude = this.max_value-this.min_value;
        this.min_value = null;
      }
      if (smoothedValue > this.max_value) this.max_value = smoothedValue;
    }
    if (speed < -this.speedTreshold) {
      if (this.max_value) {
        this.amplitude = this.max_value-this.min_value;
        this.max_value = null;
      }
      if (smoothedValue < this.min_value) this.min_value = smoothedValue;
    }

    let direction = 'still';
    if (smoothedSpeed > this.speedTreshold) direction = 'backward';
    if (smoothedSpeed < -this.speedTreshold) direction = 'forward';
    let side = 'center';
    if (smoothedValue > this.inertRange) side = 'back';
    if (smoothedValue < -this.inertRange) side = 'front';

    const output = {
      value: this.latestValue,
      deltaTime,
      delta,
      speed,
      smoothedValue,
      smoothedSpeed,
      amplitude: this.amplitude,
      min_value: this.min_value,
      max_value: this.max_value,
      direction,
      side,
      prevDirection: this.prevDirection,
    };

    if (direction != 'still') this.prevDirection = direction;

    this.onValue(output);
  }

  downloadRecording() {
    download(this.recordingName, this.recording, 'text/csv');
    this.record = false;
  }

  updateConfig(data) {
    if (this.connected) {
      this.send({ 'action': 'updateConfig', 'payload': data });
    } else {
      if (!this.pendingConfig) this.pendingConfig = {};
      this.pendingConfig = Object.assign(this.pendingConfig, data);
    }
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
    document.querySelector('.detectorDisplay').style.display = value ? '' : 'none';
    this.updateConfig({ 'display': value });
  }
  get zone() {
    return this._zone;
  }
  set zone(value) {
    this._zone = value;
  }

  get connected() {
    return this.ws.readyState === this.ws.OPEN;
  }
  async getCameraList() {
    const list = await navigator.mediaDevices.enumerateDevices()
    return list.filter(device => device.kind === 'videoinput').map(device => device.label);
  }

  get sleep() {
    return this._sleep;
  }
  set sleep(value) {
    if (this._sleep === value) return;
    this._sleep = value;
    this.onSleep(value);
    
    if (this.sleep) this.updateConfig({framesDelay: 300});
    else this.updateConfig({framesDelay: 20});
  }
  get active() {
    return this._active;
  }
  set active(value) {
    if (this._active === value) return;
    this._active = value;
    this.updateConfig({active: this.active});
  }
}