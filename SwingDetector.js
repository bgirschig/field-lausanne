/** Handles connection with detector server and interprets the values */

let ws;

let prevValue;
let prevTime;
let prevDirection = 0;
let currentDirection = 1;
let dirty = false;
let debounceValue = 0;

// Values below this are not taken into account for apogee determination
const INERT_VALUE_RANGE = 0.15;
// How many frames to wait before confirming an apogee
const DEBOUNCE_COUNT = 3;


export function init(onValue) {
  ws = new WebSocket('ws://localhost:9000');
  
  ws.onopen = function() {
    console.log('connected to server');
  };

  ws.onmessage = function (event) {
    const payload = JSON.parse(event.data);
    const value = payload;

    const now = performance.now();
    const deltaTime = now-prevTime;
    prevTime = now;

    const speed = (prevValue - value) / deltaTime;
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
    if (absValue > INERT_VALUE_RANGE && direction != currentDirection ) {
      if (!dirty) {
        if (debounceValue < DEBOUNCE_COUNT) debounceValue += 1;
        else {
          debounceValue = 0;
          currentDirection = direction;
          output.apogee = direction === -1 ? 'front' : 'back';
          dirty = true;
          console.log(output.apogee);
        }
      }
    }
    if (dirty && value === what) {
      dirty = false;
    }
    
    onValue(output);

    prevDirection = direction;
    prevValue = payload;
  };
}