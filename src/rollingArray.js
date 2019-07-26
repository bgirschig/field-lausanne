export default class RollingArray {
  constructor(size) {
    this.data = [];
    this.size = size;
  }

  append(value) {
    this.data.push(value);
    if (this.data.length > this.size) this.data.shift();
  }
  
  get(index) {
    if (Math.sign(index) === -1) index = this.length + index;
    return this.data[index];
  }

  get length() {
    return this.data.length
  }

  get average() {
    return this.sum / this.length;
  }

  get sum() {
    return this.data.reduce((a,b) => a + b, 0);
  }
}

// const t = new RollingArray();
// t.append(10);
// t.append(14);
// t.append(19);
// console.log(t.sum);
// console.log(t.average);
// console.log(t.get(0));
// console.log(t.get(-1));