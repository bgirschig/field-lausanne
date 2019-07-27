export default class WatchableObject {
  constructor(data, onChange) {
    this.onChange = onChange;
    this.data = data;
    for(let key in data) {
      Object.defineProperty(this, key, {
        set(value) {
          this.data[key] = value;
          onChange(this.data);
        },
        get() {
          return this.data[key];
        }
      })
    }
  }
}