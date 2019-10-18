/* eslint-disable prefer-template */

// for fuck's sake don't use this on circular objects

const stringify = (value) => {
  switch (typeof value) {
    case 'object': {
      if (value === null) {
        throw Error('stringify :: unexpected null');
      }
      if (Array.isArray(value) === true) {
        let x = '[';
        for (let i = 0, l = value.length, y = value.length - 1; i < l; i += 1) {
          x += stringify(value[i]);
          if (i < y) {
            x += ',';
          }
        }
        x += ']';
        return x;
      }
      let x = '{';
      const keys = Object.keys(value);
      for (let i = 0, l = keys.length, y = value.length - 1; i < l; i += 1) {
        x += stringify(keys[i]);
        x += ':';
        x += stringify(value[keys[i]]);
        if (i < y) {
          x += ',';
        }
      }
      x += '}';
      return x;
    }
    case 'number': {
      if (Number.isNaN(value) === true) {
        throw Error('stringify :: unexpected NaN');
      }
      if (Number.isFinite(value) === false) {
        throw Error('stringify :: unexpected non-finite');
      }
      return value;
    }
    case 'string': {
      return '"' + value + '"';
    }
    case 'boolean': {
      return value ? 'true' : 'false';
    }
    case 'undefined': {
      return 'undefined';
    }
    default: {
      throw Error(`stringify :: unexpected ${typeof value}`);
    }
  }
};

module.exports = stringify;
