const copyObject = require('./copyObject');

const copyArray = (target) => {
  if (Array.isArray(target) === false) {
    throw Error('copyArray : "target" must be a plain array');
  }
  const item = new Array(target.length);
  for (let i = 0, l = target.length; i < l; i += 1) {
    switch (typeof target[i]) {
      case 'undefined':
      case 'boolean':
      case 'string': {
        item[i] = target[i];
        break;
      }
      case 'number': {
        if (Number.isNaN(target[i]) === true) {
          throw Error(`copyArray : Unexpected NaN at index "${i}"`);
        } else if (Number.isFinite(target[i]) === false) {
          throw Error(`copyArray : Unexpected non-finite at index "${i}"`);
        } else {
          item[i] = target[i];
        }
        break;
      }
      case 'object': {
        if (target[i] === null) {
          item[i] = null;
        } else if (Array.isArray(target[i]) === true) {
          item[i] = copyArray(target[i]);
        } else {
          item[i] = copyObject(target[i]);
        }
        break;
      }
      default: {
        throw Error(`copyArray : Unexpected type ${typeof target[i]}`);
      }
    }
  }
  return item;
};

module.exports = copyArray;
