/* basic event handling for non-dom elements & custom events

// create handler, bind it to 'this' (allows 'this.addListener', 'this.removeListener', etc...)
let myHandler = new EventHandler(this)

// add a listener (also 'creates' the event if it does not exist)
this.addListener('evt1', () => console.log('listener 1'))

// invoke an event
myHandler.invoke('evt1')

// with arguments
this.addListener('withArguments', (a,b)=>console.log(`First argument: ${a}, Second argument: ${b}`))
myHandler.invoke('withArguments', 3, 'red') // prints 'First argument: 3, Second argument: red'

// addListener() returns a 'eventListener reference' that can be passed to removeListener
// directly (type and callback function are contained in the reference)

// Middleware functions can be used to modify event contents before and after they are 
// sent, and cancel events: the middleware function should return the modified event
// data to cancel the event, throw a "cancelEvent" error: throw new Error("cancelEvent")
*/

export default class EventHandler {
  constructor (context) {
    this.events = {};
    this.contexts = [];
    this.bind(context);
    this.enabled = true;
    this.middleware = [];
  }
  invoke (evtType, data) {
    try {
      for (let middlewareFunc of this.middleware) data = middlewareFunc(data);
    } catch (error) {
      if (error.message === 'cancelEvent') {
        return; // cancel event. this is not a real error
      } else {
        throw error; // re-throw unknown errors
      }
    }
    if (!this.enabled || !(evtType in this.events)) return;
    for (var i = 0; i < this.events[evtType].length; i++) {
      this.events[evtType][i](data);
    }
  }
  addListener (evtType, func) {
    this.ensureExists(evtType).push(func);
    return {type: evtType, func: func};
  }
  removeListener (arg1, arg2) {
    let evtType = typeof arg1 === 'object' ? arg1.type : arg1;
    let func = typeof arg1 === 'object' ? arg1.func : arg2;

    if (!(evtType in this.events)) return;
    let index = this.events[evtType].indexOf(func);
    if (index !== -1) this.events[evtType].splice(index, 1);
  }
  hasListener (evtType) {
    return evtType in this.events;
  }
  ensureExists (evtType) {
    if (!(evtType in this.events)) this.events[evtType] = [];
    return this.events[evtType];
  }
  bind (context) {
    if (typeof context === 'undefined' || context == null) return;
    context.addListener = this.addListener.bind(this);
    context.removeListener = this.removeListener.bind(this);
    context.hasListener = this.hasListener.bind(this);
    context.invokeEvt = this.invoke.bind(this);
    this.contexts.push(context);
  }
  use (func) {
    this.middleware.push(func);
  }

  destroy () {
    this.events = null;
    // unbind evt handler functions
    this.contexts.forEach(ctx => {
      ctx.addListener = undefined;
      ctx.removeListener = undefined;
      ctx.hasListener = undefined;
      ctx.invokeEvt = undefined;
    });
  }
}