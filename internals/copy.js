
/**
 * @param {*} value - value to copy
 * @returns {*}
 * - Designed for primitive values, plain arrays and plain objects
 * - Not as strict as lodash/isPlainObject
 * - Not designed for: NaN, +Infinity, -Infinity, BigInt, TypedArray, RegExp, Function, Symbol, Date, Map, Set, Promise, Error
 */
const copy = (value) => {
  switch (typeof value) {
    case 'object': {
      if (value === null) {
        throw Error('copy :: unexpected null');
      }
      if (Array.isArray(value) === true) {
        const temp = new Array(value.length);
        for (let i = 0, l = value.length; i < l; i += 1) {
          temp[i] = copy(value[i]);
        }
        return temp;
      }
      const temp = {};
      const keys = Object.keys(value);
      for (let i = 0, l = keys.length; i < l; i += 1) {
        temp[keys[i]] = copy(value[keys[i]]);
      }
      return temp;
    }
    case 'number': {
      if (Number.isNaN(value) === true) {
        throw Error('copy :: unexpected NaN');
      }
      if (Number.isFinite(value) === false) {
        throw Error('copy :: unexpected non-finite');
      }
      return value;
    }
    case 'string':
    case 'boolean':
    case 'undefined': {
      return value;
    }
    default: {
      throw Error(`copy :: unexpected ${typeof value}`);
    }
  }
};

module.exports = copy;
