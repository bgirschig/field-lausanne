export default class StateMachine {
  /**
   * Manages an app's state
   * @param {StateMachineOptions} options
   */
  constructor({ modes, beforeEach, onChange, logLevel }) {
    this.modes = modes;
    this.modeClasses = this.modes.map(mode => `mode-${mode}`);

    this.beforeEach = beforeEach;
    this.onChange = onChange;

    this.logLevels = ['quiet', 'normal', 'detailed'];
    this.logLevel = this.logLevels.indexOf(logLevel || 'normal');
    this.stackCount = -1;

    this.current = null;
    this.previous = null;
  }

  /**
   * Change to the required mode
   * @param {string} mode - the desired mode
   */
  goto(mode) {
    this._goto(mode, { cancelTemp: true });
  }

  /**
   * Tempoarily goes to the required mode, and comes back after the delay.
   * Edge cases:
   * - If the regular 'goto' is called before the delay expires, it is cancelled.
   * - If gotoTemp is called before the delay expires, the delay is 'reset' to
   * the new value
   * - The beforeEach and onChange methods are called as usual, when the mode
   * actually changes
   */
  gotoTemp(mode, delay) {
    // Clear current timeout so that we set the timeout to the new delay
    if (this.tempTimeout) clearTimeout(this.tempTimeout);
    if (!this.tempStartMode) this.tempStartMode = this.current;

    // setup the delay
    this.tempTimeout = setTimeout(() => {
      this.tempTimeout = null;
      this.goto(this.tempStartMode);
      this.tempStartMode = null;
    }, delay);

    // goto the temp mode, without cancelling the delay we just set up
    this._goto(mode, { cancelTemp: false });
  }

  /**
   * Internal goto method. Exposes more options than the public one (which calls
   * this one with preset options)
   * @private
   * @param {string} mode - The mode to go to
   * @param {GotoOptions} options
   */
  _goto(mode, { cancelTemp }) {
    if (typeof mode !== 'string') throw new Error('mode should be a string');
    if (mode.length === 0) throw new Error('mode can\'t be an empty string');
    if (this.stackCount > 50) throw new Error('Stack count > 50. This is probably an infinite recursion in the beforeEach method...');
    this.stackCount += 1;
    this.log(`${this.current} -> ${mode}`, 'detailed', this.stackCount);

    if (cancelTemp && this.tempTimeout) {
      this.log('cancel temp', 'detailed', this.stackCount);
      clearTimeout(this.tempTimeout);
    }

    if (mode === this.current) {
      this.stackCount -= 1;
      return;
    }
    if (!this.modes.includes(mode)) throw new Error(`unexpected mode: ${mode}`);

    if (this.beforeEach) {
      this.beforeEach(this.current, mode, () => {
        this._commitGoto(mode);
      }, this);
    } else this._commitGoto(mode);
    this.stackCount -= 1;
  }

  /**
   * Actually switches modes, after all the checks have been made
   * @private
   * @param {string} mode - The mode to go to
   */
  _commitGoto(mode) {
    if (typeof document !== 'undefined') {
      document.body.classList.remove(...this.modeClasses);
      document.body.classList.add(`mode-${mode}`);
    }

    this.previous = this.current;
    this.current = mode;

    this.log(`${this.previous} => ${this.current}`, 'normal');

    if (this.onChange) this.onChange(this.previous, this.current);

    if (!this.previous) this.previous = this.current;
  }

  /**
   * Toggles between the two given modes:
   * if mode1 is active, go to mode2 (and vice versa)
   * If none of the modes is active, go to mode1
   * If only mode1 is set, toggle between mode1 and previous mode
   * @param {Mode} mode1
   * @param {Mode} mode2
   */
  toggle(mode1, mode2 = null) {
    // eslint-disable-next-line no-param-reassign
    if (!mode2) mode2 = this.previous;
    if (this.current === mode1) this.goto(mode2);
    else if (this.current === mode2) this.goto(mode1);
    else this.goto(mode1);
  }

  /**
   * Returns true if currentMode matches one of the modes. This is a shorthand for
   * the equivalent: modes.includes(currentMode)
   * @param  {...String} modes strings to match with the current mode name
   */
  matchMode(...modes) {
    return modes.includes(this.current);
  }

  log(message, level = 'normal', indent = 0) {
    // get numeric log level
    const logLevel = this.logLevels.indexOf(level);
    // log when appropriate
    if (this.logLevel >= logLevel) {
      const indentStr = ' '.repeat(indent);
      console.log(`[State machine] ${indentStr}${message}`);
    }
  }
}

/**
 * @typedef {Object} GotoOptions
 * @property {boolean} cancelTemp - wether to cancel gotoTemp (if any is in progress)
 */

/**
 * @typedef {Object} StateMachineOptions
 * @property {string[]} modes - The list of modes this state machine may go to
 * @property {BeforeEachCallback} beforeEach
 * @property {OnChangeCallback} onChange
 * @property {'quiet'|'normal'|'detailed'} logLevel
*/

/**
 * A function that will be called to accept, reject or redirect a mode change.
 * @callback BeforeEachCallback
 * @param {string} currentMode - The current mode of the state machine
 * @param {string} targetMode - The requested mode
 * @param {function} next - Call this function to proceed with the mode change
 */

/**
  * A function called after every successfull mode change
  * @callback OnChangeCallback
  * @param {string} previous - The previous mode of the state machine
  * @param {string} current - The new mode of the state machine
  */