
const copyArray = require('./copyArray');

const copyObject = (target) => {
  if (typeof target !== 'object' || target === null) {
    throw Error('copyObject : "target" must be a plain object');
  }
  if (typeof freeze !== 'boolean') {
    throw Error('copyObject : "freeze" must be a boolean');
  }
  const item = {};
  const keys = Object.keys(target);
  for (let i = 0, l = keys.length; i < l; i += 1) {
    const key = keys[i];
    switch (typeof target[key]) {
      case 'undefined': {
        break;
      }
      case 'boolean':
      case 'string': {
        item[key] = target[key];
        break;
      }
      case 'number': {
        if (Number.isNaN(target[key]) === true) {
          throw Error(`copyObject : Unexpected NaN at key "${key}"`);
        } else if (Number.isFinite(target[key]) === false) {
          throw Error(`copyObject : Unexpected non-finite at key "${key}"`);
        } else {
          item[key] = target[key];
        }
        break;
      }
      case 'object': {
        if (target[key] === null) {
          item[key] = null;
        } else if (Array.isArray(target[key]) === true) {
          item[key] = copyArray(target[key]);
        } else {
          item[key] = copyObject(target[key]);
        }
        break;
      }
      default: {
        throw Error(`copyObject : Unexpected type ${typeof target[i]}`);
      }
    }
  }
  return item;
};

module.exports = copyObject;
