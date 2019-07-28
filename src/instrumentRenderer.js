const canvas = document.querySelector('.instruments canvas.dials');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

const angleScale = 3.0;

const width = 300;
const height = width;
const dialHeight = height/2;

canvas.width = width;
canvas.height = height;

let active = true;
let state = {};

const exported = {
  get active() {
    return active;
  },
  set active(value) {
    active = Boolean(value);
    if (active) {
      canvas.style.display = '';
    } else {
      canvas.style.display = 'none';
    }
  },
  update(e) {
    state = Object.assign(state, e);
    render();
  }
}

function render() {
  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // Position instrument
  ctx.translate(width/2, 10);
  drawZone(-state.inertRange, state.inertRange, 'green');
  drawZone(-state.resetRange, state.resetRange, 'orange');
  drawNeedle(state.smoothedValue, 'red');
  drawNeedle(state.value);
  if (state.prevApogeeValue) drawNeedle(state.prevApogeeValue, 'yellow');
  drawDial();

  // Speed instruments
  const speedScale = 3;
  ctx.translate(0, height-20);
  ctx.scale(1, -1);
  drawZone(-state.apogeeSpeedTreshold*speedScale, state.apogeeSpeedTreshold*speedScale, 'green');
  drawNeedle(state.speed*speedScale, 'white');
  drawNeedle(state.smoothedSpeed*speedScale, 'red');
  drawDial();

  ctx.restore();
}

function drawDial() {
  ctx.strokeStyle = 'rgb(150,150,150)';
  ctx.beginPath();
  ctx.arc(0, 0, dialHeight - 20, 0, Math.PI);
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawNeedle(value, color='white', long=false) {
  ctx.save();
  // ctx.translate(0, 0);
  ctx.rotate(value * angleScale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(0, 0, 3, 0, Math.PI*2);
  ctx.fill();
  const length = long ? dialHeight - 15 : dialHeight - 20;
  ctx.fillRect(-1, -5, 2, length);
  ctx.restore();
}

function drawZone(start, end, color='white') {
  ctx.save();
  ctx.beginPath();
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.arc(0, 0, dialHeight - 20, start*angleScale, end*angleScale);
  ctx.lineTo(0,0);
  ctx.fill();
  ctx.restore();
  drawNeedle(start, color, true);
  drawNeedle(end, color, true);
}

export const data = {
  value: 0,
}

export default exported;