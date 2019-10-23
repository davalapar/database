
const crypto = require('crypto');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const copy = require('./internals/copy');
const haversine = require('./internals/haversine');

let queryItemSchema = {};
let queryList = [];
let queryFilters = [];
let querySorts = [];
let queryLimit = Infinity;
let queryOffset = 0;
let queryPage = 0;

const Query = {

  // SORTS:
  ascend: (itemFieldKey) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('ascend :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('ascend :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'string' && queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('ascend :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    querySorts.push([itemFieldKey, false]);
    return Query;
  },
  descend: (itemFieldKey) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('descend :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('descend :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'string' && queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('descend :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    querySorts.push([itemFieldKey, true]);
    return Query;
  },
  ascend_h: (itemFieldKey, coordinates) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('ascend_h :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('ascend_h :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'coordinates') {
      throw Error('ascend_h :: coordinates :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('ascend_h :: coordinates :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('ascend_h :: coordinates :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('ascend_h :: coordinates :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('ascend_h :: coordinates :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('ascend_h :: coordinates :: Unexpected non-2 length for coordinates');
    }
    querySorts.push([itemFieldKey, false, coordinates]);
    return Query;
  },
  descend_h: (itemFieldKey, coordinates) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('descend_h :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('descend_h :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'coordinates') {
      throw Error('descend_h :: coordinates :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('descend_h :: coordinates :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('descend_h :: coordinates :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('descend_h :: coordinates :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('descend_h :: coordinates :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('descend_h :: coordinates :: Unexpected non-2 length for coordinates');
    }
    querySorts.push([itemFieldKey, true, coordinates]);
    return Query;
  },

  // FILTERS:
  gt: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('gt :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('gt :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('gt :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('gt :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('gt :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('gt :: value :: Unexpected non-finite value');
    }
    queryFilters.push([1, itemFieldKey, value]);
    return Query;
  },
  gte: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('gte :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('gte :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('gte :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('gte :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('gte :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('gte :: value :: Unexpected non-finite value');
    }
    queryFilters.push([2, itemFieldKey, value]);
    return Query;
  },
  lt: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('lt :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('lt :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('lt :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('lt :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('lt :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('lt :: value :: Unexpected non-finite value');
    }
    queryFilters.push([3, itemFieldKey, value]);
    return Query;
  },
  lte: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('lte :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('lte :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'number') {
      throw Error('lte :: itemFieldKey :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('lte :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('lte :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('lte :: value :: Unexpected non-finite value');
    }
    queryFilters.push([4, itemFieldKey, value]);
    return Query;
  },
  eq: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('eq :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('eq :: itemFieldKey :: Unexpected non-existing field');
    }
    switch (queryItemSchema[itemFieldKey]) {
      case 'boolean': {
        if (typeof value !== 'boolean') {
          throw Error('eq :: value :: Unexpected non-boolean value');
        }
        break;
      }
      case 'string': {
        if (typeof value !== 'string') {
          throw Error('eq :: value :: Unexpected non-string value');
        }
        break;
      }
      case 'number': {
        if (typeof value !== 'number') {
          throw Error('eq :: value :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('eq :: value :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('eq :: value :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('eq :: itemFieldKey :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([5, itemFieldKey, value]);
    return Query;
  },
  neq: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('neq :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('neq :: itemFieldKey :: Unexpected non-existing field');
    }
    switch (queryItemSchema[itemFieldKey]) {
      case 'boolean': {
        if (typeof value !== 'boolean') {
          throw Error('neq :: value :: Unexpected non-boolean value');
        }
        break;
      }
      case 'string': {
        if (typeof value !== 'string') {
          throw Error('neq :: value :: Unexpected non-string value');
        }
        break;
      }
      case 'number': {
        if (typeof value !== 'number') {
          throw Error('neq :: value :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('neq :: value :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('neq :: value :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('neq :: itemFieldKey :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([6, itemFieldKey, value]);
    return Query;
  },
  includes: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('includes :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('includes :: itemFieldKey :: Unexpected non-existing field');
    }
    switch (queryItemSchema[itemFieldKey]) {
      case 'booleans': {
        if (typeof value !== 'boolean') {
          throw Error('includes :: value :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (typeof value !== 'string') {
          throw Error('includes :: value :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (typeof value !== 'number') {
          throw Error('includes :: value :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('includes :: value :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('includes :: value :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('includes :: itemFieldKey :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([7, itemFieldKey, value]);
    return Query;
  },
  excludes: (itemFieldKey, value) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('excludes :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('excludes :: itemFieldKey :: Unexpected non-existing field');
    }
    switch (queryItemSchema[itemFieldKey]) {
      case 'booleans': {
        if (typeof value !== 'boolean') {
          throw Error('excludes :: value :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (typeof value !== 'string') {
          throw Error('excludes :: value :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (typeof value !== 'number') {
          throw Error('excludes :: value :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('excludes :: value :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('excludes :: value :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('excludes :: itemFieldKey :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([8, itemFieldKey, value]);
    return Query;
  },
  inside_h: (itemFieldKey, coordinates, meters) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('inside_h :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('inside_h :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'coordinates') {
      throw Error('inside_h :: coordinates :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('inside_h :: coordinates :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('inside_h :: coordinates :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('inside_h :: coordinates :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('inside_h :: coordinates :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('inside_h :: coordinates :: Unexpected non-2 length for coordinates');
    }
    if (typeof meters !== 'number') {
      throw Error('inside_h :: meters :: Unexpected non-number meters');
    }
    if (Number.isNaN(meters) === true) {
      throw Error('inside_h :: meters :: Unexpected NaN meters');
    }
    if (Number.isFinite(meters) === false) {
      throw Error('inside_h :: meters :: Unexpected non-finite meters');
    }
    queryFilters.push([9, itemFieldKey, coordinates, meters]);
    return Query;
  },
  outside_h: (itemFieldKey, coordinates, meters) => {
    if (typeof itemFieldKey !== 'string') {
      throw Error('outside_h :: itemFieldKey :: Unexpected non-string');
    }
    if (queryItemSchema[itemFieldKey] === undefined) {
      throw Error('outside_h :: itemFieldKey :: Unexpected non-existing field');
    }
    if (queryItemSchema[itemFieldKey] !== 'coordinates') {
      throw Error('outside_h :: coordinates :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('outside_h :: coordinates :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('outside_h :: coordinates :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('outside_h :: coordinates :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('outside_h :: coordinates :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('outside_h :: coordinates :: Unexpected non-2 length for coordinates');
    }
    if (typeof meters !== 'number') {
      throw Error('outside_h :: meters :: Unexpected non-number meters');
    }
    if (Number.isNaN(meters) === true) {
      throw Error('outside_h :: meters :: Unexpected NaN meters');
    }
    if (Number.isFinite(meters) === false) {
      throw Error('outside_h :: meters :: Unexpected non-finite meters');
    }
    queryFilters.push([10, itemFieldKey, coordinates, meters]);
    return Query;
  },

  // PAGINATE:
  limit: (value) => {
    if (typeof value !== 'number') {
      throw Error('limit :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('limit :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('limit :: value :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('limit :: value :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('limit :: value :: Unexpected less-than-zero value');
    }
    queryLimit = value;
    return Query;
  },
  offset: (value) => {
    if (typeof value !== 'number') {
      throw Error('offset :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('offset :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('offset :: value :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('offset :: value :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('offset :: value :: Unexpected less-than-zero value');
    }
    if (queryPage !== 0) {
      throw Error('offset :: cannot use offset() with page()');
    }
    queryOffset = value;
    return Query;
  },
  page: (value) => {
    if (typeof value !== 'number') {
      throw Error('page :: value :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('page :: value :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('page :: value :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('page :: value :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('page :: value :: Unexpected less-than-zero value');
    }
    if (queryOffset !== 0) {
      throw Error('page :: cannot use page() with offset()');
    }
    queryPage = value;
    return Query;
  },

  // RESULTS:
  results: () => {
    // console.log('queryList.length:', queryList.length, 'queryFilters.length:', queryFilters.length);
    if (queryFilters.length > 0) {
      queryList = queryList.filter((item) => {
        for (let i = 0, l = queryFilters.length; i < l; i += 1) {
          const [filterType, itemFieldKey, valueOrCoordinates, meters] = queryFilters[i];
          switch (filterType) {
            case 1: { // gt
              if (item[itemFieldKey] <= valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 2: { // gte
              if (item[itemFieldKey] < valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 3: { // lt
              if (item[itemFieldKey] >= valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 4: { // lte
              if (item[itemFieldKey] > valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 5: { // eq
              if (item[itemFieldKey] !== valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 6: { // neq
              if (item[itemFieldKey] === valueOrCoordinates) {
                return false;
              }
              break;
            }
            case 7: { // includes
              if (item[itemFieldKey].includes(valueOrCoordinates) === false) {
                return false;
              }
              break;
            }
            case 8: { // excludes
              if (item[itemFieldKey].includes(valueOrCoordinates) === true) {
                return false;
              }
              break;
            }
            case 9: { // inside_h
              if (item[itemFieldKey].length === 0) {
                return false;
              }
              if (item[itemFieldKey].includes(valueOrCoordinates) === true) {
                return false;
              }
              if (haversine(valueOrCoordinates[0], valueOrCoordinates[1], item[itemFieldKey][0], item[itemFieldKey][1]) > meters) {
                return false;
              }
              break;
            }
            case 10: { // outside_h
              if (item[itemFieldKey].length === 0) {
                return false;
              }
              if (item[itemFieldKey].includes(valueOrCoordinates) === true) {
                return false;
              }
              if (haversine(valueOrCoordinates[0], valueOrCoordinates[1], item[itemFieldKey][0], item[itemFieldKey][1]) <= meters) {
                return false;
              }
              break;
            }
            default: {
              throw Error('query :: unexpected unknown query filter type!');
            }
          }
        }
        return true;
      });
    }
    if (querySorts.length > 0) {
      queryList.sort((a, b) => {
        for (let i = 0, l = querySorts.length; i < l; i += 1) {
          const querySort = querySorts[i];
          const [itemFieldKey, descend, coordinates] = querySort;
          if (coordinates === undefined) {
            // type: string or number
            if (a[itemFieldKey] === b[itemFieldKey]) {
              continue; // eslint-disable-line no-continue
            }
            if (queryItemSchema[itemFieldKey] === 'string') {
              return descend
                ? b[itemFieldKey].localeCompare(a[itemFieldKey])
                : a[itemFieldKey].localeCompare(b[itemFieldKey]);
            }
            if (queryItemSchema[itemFieldKey] === 'number') {
              return descend
                ? b[itemFieldKey] - a[itemFieldKey]
                : a[itemFieldKey] - b[itemFieldKey];
            }
          } else {
            // type: coordinates
            return descend
              ? haversine(coordinates[0], coordinates[1], b[itemFieldKey][0], b[itemFieldKey][1]) - haversine(coordinates[0], coordinates[1], a[itemFieldKey][0], a[itemFieldKey][1])
              : haversine(coordinates[0], coordinates[1], a[itemFieldKey][0], a[itemFieldKey][1]) - haversine(coordinates[0], coordinates[1], b[itemFieldKey][0], b[itemFieldKey][1]);
          }
        }
        return 0;
      });
    }
    if (queryOffset > 0) {
      queryList = queryList.slice(queryOffset, queryOffset + queryLimit);
    } else if (queryPage > 0) {
      queryList = queryList.slice(queryLimit * (queryPage - 1), (queryLimit * (queryPage - 1)) + queryLimit);
    } else {
      queryList = queryList.slice(0, queryLimit);
    }
    return copy(queryList);
  },
};

const pointerLabel = Symbol('pointerLabel');
const pointerModified = Symbol('pointerModified');
const pointerList = Symbol('pointerList');
const pointerOldPath = Symbol('pointerOldPath');
const pointerTempPath = Symbol('pointerTempPath');
const pointerCurrentPath = Symbol('pointerCurrentPath');
const pointerItemFieldsStringified = Symbol('pointerItemFieldsStringified');
const pointerEncodeFn = Symbol('pointerEncodeFn');
const pointerDecodeFn = Symbol('pointerDecodeFn');

const validItemFieldTypes = [
  'boolean',
  'string',
  'number',
  'booleans',
  'strings',
  'numbers',
  'coordinates',
];

const validateItem = (method, itemFieldKeys, itemSchema, item) => {
  if (typeof item !== 'object' || item === null) {
    throw Error('table :: item :: unexpected non-object');
  }
  for (let i = 0, l = itemFieldKeys.length; i < l; i += 1) {
    const itemFieldKey = itemFieldKeys[i];
    const itemFieldType = itemSchema[itemFieldKey];
    switch (itemFieldType) {
      case 'boolean': {
        if (typeof item[itemFieldKey] !== 'boolean') {
          throw Error(`table :: ${method} :: unexpected non-boolean value for "${itemFieldKey}" field`);
        }
        break;
      }
      case 'string': {
        if (typeof item[itemFieldKey] !== 'string') {
          throw Error(`table :: ${method} :: unexpected non-string value for "${itemFieldKey}" field`);
        }
        break;
      }
      case 'number': {
        if (typeof item[itemFieldKey] !== 'number') {
          throw Error(`table :: ${method} :: unexpected non-number value for "${itemFieldKey}" field`);
        }
        if (Number.isNaN(item[itemFieldKey]) === true) {
          throw Error(`table :: ${method} :: unexpected NaN value for "${itemFieldKey}" field`);
        }
        if (Number.isFinite(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value for "${itemFieldKey}" field`);
        }
        break;
      }
      case 'booleans': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'boolean') === false) {
          throw Error(`table :: ${method} :: unexpected non-boolean value in "${itemFieldKey}" array field`);
        }
        break;
      }
      case 'strings': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'string') === false) {
          throw Error(`table :: ${method} :: unexpected non-string value in "${itemFieldKey}" array field`);
        }
        break;
      }
      case 'numbers': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'number') === false) {
          throw Error(`table :: ${method} :: unexpected non-number value in "${itemFieldKey}" array field`);
        }
        if (item[itemFieldKey].every((value) => Number.isNaN(value) === false) === false) {
          throw Error(`table :: ${method} :: unexpected NaN value in "${itemFieldKey}" array field`);
        }
        if (item[itemFieldKey].every((value) => Number.isFinite(value) === true) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value in "${itemFieldKey}" array field`);
        }
        break;
      }
      case 'coordinates': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'number') === false) {
          throw Error(`table :: ${method} :: unexpected non-number value in "${itemFieldKey}" array field`);
        }
        if (item[itemFieldKey].every((value) => Number.isNaN(value) === false) === false) {
          throw Error(`table :: ${method} :: unexpected NaN value in "${itemFieldKey}" array field`);
        }
        if (item[itemFieldKey].every((value) => Number.isFinite(value) === true) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value in "${itemFieldKey}" array field`);
        }
        if (item[itemFieldKey].length !== 2) {
          throw Error(`table :: ${method} :: unexpected array length for "${itemFieldKey}" field`);
        }
        break;
      }
      default: {
        break;
      }
    }
  }
};

const validateSchema = (itemSchema) => {
  if (typeof itemSchema !== 'object' || itemSchema === null) {
    throw Error('table :: validateSchema :: unexpected non-object');
  }
  const itemFieldKeys = ['id', ...Object.keys(itemSchema).sort((a, b) => a.localeCompare(b))];
  for (let i = 0, l = itemFieldKeys.length; i < l; i += 1) {
    const itemFieldKey = itemFieldKeys[i];
    if (itemFieldKey === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const itemFieldType = itemSchema[itemFieldKey];
    if (validItemFieldTypes.includes(itemFieldType) === false) {
      throw Error('table :: validateSchema :: unexpected field type');
    }
  }
  const itemSchemaCopy = copy(itemSchema);
  itemSchemaCopy.id = 'string';
  return [itemFieldKeys, itemSchemaCopy];
};


function Table(label, itemFieldKeys, itemSchema, transformFunction, database) {
  let list = [];
  let dictionary = {};
  this[pointerLabel] = label;
  this[pointerModified] = false;
  this[pointerList] = list;
  this[pointerOldPath] = `./tables/${label}-old.db`;
  this[pointerTempPath] = `./tables/${label}-temp.db`;
  this[pointerCurrentPath] = `./tables/${label}-current.db`;
  const itemFieldsStringified = JSON.stringify(itemFieldKeys);
  this[pointerItemFieldsStringified] = itemFieldsStringified;

  if (fs.existsSync(this[pointerCurrentPath]) === true) {
    const encoded = fs.readFileSync(this[pointerCurrentPath]);
    const decoded = database[pointerDecodeFn](encoded);
    if (Array.isArray(decoded) === false) {
      throw Error('table :: load :: unexpected non-array "decoded" data.');
    }
    const [loadedItemFieldKeysStringified, loadedList] = decoded;
    if (typeof loadedItemFieldKeysStringified !== 'string') {
      throw Error('table :: load :: unexpected non-string "loadedItemFieldKeysStringified" data.');
    }
    if (Array.isArray(loadedList) === false) {
      throw Error('table :: load :: unexpected non-array "loadedList" data.');
    }
    if (loadedItemFieldKeysStringified === itemFieldsStringified) {
      // console.log('table :: load :: loaded schema match ok');
      list = loadedList;
      this[pointerList] = list;
      for (let i = 0, l = loadedList.length; i < l; i += 1) {
        const item = loadedList[i];
        dictionary[item.id] = item;
      }
      // console.log('table :: load :: loaded', list.length.toString(), 'items');
    } else {
      // console.log('table :: load :: loaded schema match fail');
      if (transformFunction === undefined) {
        throw Error('table :: load :: "transformFunction" is now required and must be a function.');
      }
      list = new Array(loadedList.length);
      this[pointerList] = list;
      for (let i = 0, l = loadedList.length; i < l; i += 1) {
        const item = loadedList[i];
        const transformedItem = transformFunction(item);
        validateItem('load', itemFieldKeys, itemSchema, item);
        list[i] = transformedItem;
        dictionary[transformedItem.id] = transformedItem;
      }
      // console.log('table :: load :: loaded', list.length.toString(), 'items');
    }
  }

  this.label = () => label;

  this.id = () => {
    let itemId = crypto.randomBytes(16).toString('hex');
    while (dictionary[itemId] !== undefined) {
      itemId = crypto.randomBytes(16).toString('hex');
    }
    return itemId;
  };

  this.clear = () => {
    list = [];
    dictionary = {};
    this[pointerModified] = true;
    this[pointerList] = list;
    database.save();
    return this;
  };

  this.add = (newItem) => {
    validateItem('add', itemFieldKeys, itemSchema, newItem);
    const { id } = newItem;
    if (typeof id !== 'string' || id === '') {
      throw Error('table :: add :: unexpected non-string / empty string "id"');
    }
    if (dictionary[id] !== undefined) {
      throw Error(`table :: add :: unexpected existing id "${id}"`);
    }
    const duplicateItem = copy(newItem);
    list.push(duplicateItem);
    dictionary[id] = duplicateItem;
    this[pointerModified] = true;
    database.save();
    return newItem;
  };

  this.update = (updatedItem) => {
    validateItem('update', itemFieldKeys, itemSchema, updatedItem);
    const { id } = updatedItem;
    if (typeof id !== 'string' || id === '') {
      throw Error('table :: update :: unexpected non-string / empty string "id"');
    }
    if (dictionary[id] === undefined) {
      throw Error(`table :: update :: unexpected non-existing id "${id}"`);
    }
    const existingItem = dictionary[id];
    const existingItemIndex = list.indexOf(existingItem);
    const duplicateItem = copy(updatedItem);
    list[existingItemIndex] = duplicateItem;
    dictionary[id] = duplicateItem;
    this[pointerModified] = true;
    database.save();
    return updatedItem;
  };

  this.get = (itemId) => {
    if (typeof itemId !== 'string') {
      throw Error(`table :: get :: unexpected non-string id "${itemId}"`);
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: get :: unexpected non-existing id "${itemId}"`);
    }
    return dictionary[itemId];
  };

  this.delete = (itemId) => {
    if (typeof itemId !== 'string') {
      throw Error('table :: delete :: unexpected non-string itemId');
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: delete :: unexpected non-existing id "${itemId}"`);
    }
    const existingItem = dictionary[itemId];
    const existingItemIndex = list.indexOf(existingItem);
    list.splice(existingItemIndex, 1);
    delete dictionary[itemId];
    this[pointerModified] = true;
    database.save();
    return this;
  };

  this.increment = (itemId, itemFieldKey) => {
    if (typeof itemId !== 'string') {
      throw Error('table :: increment :: unexpected non-string itemId');
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: increment :: unexpected non-existing id "${itemId}"`);
    }
    if (itemFieldKeys.includes(itemFieldKey) === false) {
      throw Error(`table :: increment :: unexpected field "${itemFieldKey}"`);
    }
    if (itemSchema[itemFieldKey] !== 'number') {
      throw Error(`table :: increment :: unexpected non-number field "${itemFieldKey}"`);
    }
    const existingItem = dictionary[itemId];
    existingItem[itemFieldKey] += 1;
    this[pointerModified] = true;
    database.save();
    return this;
  };

  this.decrement = (itemId, itemFieldKey) => {
    if (typeof itemId !== 'string') {
      throw Error('table :: decrement :: unexpected non-string itemId');
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: decrement :: unexpected non-existing id "${itemId}"`);
    }
    if (itemFieldKeys.includes(itemFieldKey) === false) {
      throw Error(`table :: decrement :: unexpected field "${itemFieldKey}"`);
    }
    if (itemSchema[itemFieldKey] !== 'number') {
      throw Error(`table :: decrement :: unexpected non-number field "${itemFieldKey}"`);
    }
    const existingItem = dictionary[itemId];
    existingItem[itemFieldKey] -= 1;
    this[pointerModified] = true;
    database.save();
    return this;
  };

  this.has = (itemId) => {
    if (typeof itemId !== 'string') {
      throw Error(`table :: has :: unexpected non-string id "${itemId}"`);
    }
    return dictionary[itemId] !== undefined;
  };

  this.query = () => {
    queryItemSchema = itemSchema;
    queryList = list;
    queryFilters = [];
    querySorts = [];
    queryLimit = Infinity;
    queryOffset = 0;
    queryPage = 0;
    return Query;
  };

  this.size = () => list.length;
}

function Database(databaseOptions) {
  // type checks
  if (typeof databaseOptions !== 'object' || databaseOptions === null) {
    throw Error('table :: databaseOptions :: unexpected non-object databaseOptions');
  }

  const {
    tableConfigs,
    saveCheckInterval,
    saveMaxSkips,
    saveCompressionAlgo,
  } = databaseOptions;

  // more type checks
  if (Array.isArray(tableConfigs) === false) {
    throw Error('table :: tableConfigs :: unexpected non-array tableConfigs');
  }
  if (tableConfigs.every((tableConfig) => typeof tableConfig === 'object' && tableConfig !== null) === false) {
    throw Error('table :: tableConfigs :: unexpected non-object tableConfig in tableConfigs');
  }
  if (typeof saveCheckInterval !== 'number' || Number.isNaN(saveCheckInterval) === true || Number.isFinite(saveCheckInterval) === false || Math.floor(saveCheckInterval) !== saveCheckInterval) {
    throw Error('table :: saveCheckInterval :: unexpected non-number / NaN / non-finite / non-integer saveCheckInterval');
  }
  if (typeof saveMaxSkips !== 'number' || Number.isNaN(saveMaxSkips) === true || Number.isFinite(saveMaxSkips) === false || Math.floor(saveMaxSkips) !== saveMaxSkips) {
    throw Error('table :: saveMaxSkips :: unexpected non-number / NaN / non-finite / non-integer saveMaxSkips');
  }
  if (typeof saveCompressionAlgo !== 'undefined' && saveCompressionAlgo !== 'gzip' && saveCompressionAlgo !== 'brotli') {
    throw Error('table :: saveCompressionAlgo :: unexpected non-"gzip" & non-"brotli" saveCompressionAlgo');
  }

  // set encoderFn and decoderFn
  if (saveCompressionAlgo === 'gzip') {
    const asyncGzip = util.promisify(zlib.gzip);
    this[pointerEncodeFn] = (decoded) => asyncGzip(JSON.stringify(decoded));
    this[pointerDecodeFn] = (encoded) => JSON.parse(zlib.gunzipSync(encoded));
  } else if (saveCompressionAlgo === 'brotli') {
    const asyncBrotliCompress = util.promisify(zlib.brotliCompress);
    this[pointerEncodeFn] = (decoded) => asyncBrotliCompress(JSON.stringify(decoded));
    this[pointerDecodeFn] = (encoded) => JSON.parse(zlib.brotliDecompressSync(encoded));
  } else {
    this[pointerEncodeFn] = (decoded) => JSON.stringify(decoded);
    this[pointerDecodeFn] = (encoded) => JSON.parse(encoded);
  }

  if (fs.existsSync('./tables') === false) {
    fs.mkdirSync('./tables', { recursive: true });
    // console.log('table :: "./tables" directory created.');
  }

  const list = [];
  const dictionary = {};
  for (let i = 0, l = tableConfigs.length; i < l; i += 1) {
    const { label, itemSchema, transformFunction } = tableConfigs[i];
    if (typeof label !== 'string') {
      throw Error('database :: tableConfig :: unexpected non-string label');
    }
    if (transformFunction !== undefined && typeof transformFunction !== 'function') {
      throw Error('database :: tableConfig :: unexpected non-function');
    }
    const [itemFieldKeys, itemSchemaCopy] = validateSchema(itemSchema);
    const table = new Table(label, itemFieldKeys, itemSchemaCopy, transformFunction, this);
    list[i] = table;
    dictionary[table.label()] = table;
  }

  // [x] typechecks?
  // [x] working?
  this.table = (label) => {
    if (typeof label !== 'string') {
      throw Error('database :: table :: unexpected non-string label');
    }
    if (dictionary[label] === undefined) {
      throw Error(`database :: table :: unexpected non-existing table "${label}"`);
    }
    return dictionary[label];
  };

  let saveIsSaving = false;
  const internalSave = async () => {
    const tables = list.filter((table) => table[pointerModified] === true);
    const tableContents = await Promise.all(tables.map(async (table, index) => {
      const tableContent = await this[pointerEncodeFn]([table[pointerItemFieldsStringified], table[pointerList]]);
      tables[index][pointerModified] = false;
      return tableContent;
    }));
    saveIsSaving = true;
    await Promise.all(tables.map(async (table, index) => {
      await fs.promises.writeFile(table[pointerTempPath], tableContents[index]);
      if (fs.existsSync(table[pointerCurrentPath]) === true) {
        await fs.promises.rename(table[pointerCurrentPath], table[pointerOldPath]);
      }
      await fs.promises.writeFile(table[pointerCurrentPath], tableContents[index]);
    }));
    saveIsSaving = false;
  };

  let saveInterval;
  let saveSkipNext = false;
  let saveSkips = 0;
  let saveQueued = false;
  this.save = () => {
    if (saveIsSaving === true) {
      saveQueued = true;
      // console.log('save : currently saving, queueing save');
      return;
    }
    if (saveInterval === undefined) {
      saveInterval = setInterval(async () => {
        // const tid = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        if (saveIsSaving === false) {
          if (saveSkipNext === true) {
            saveSkipNext = false;
            if (saveSkips < saveMaxSkips) {
              saveSkips += 1;
              // console.log('save tick', tid, ': save skipped');
            } else {
              saveSkips = 0;
              // console.log('save tick', tid, ': saving');
              await internalSave();
              // console.log('save tick', tid, ': save ok');
              if (saveQueued === false) {
                // console.log('save tick', tid, ': save tick cleared');
                clearInterval(saveInterval);
                saveInterval = undefined;
              }
            }
          } else {
            // console.log('save tick', tid, ': saving');
            await internalSave();
            // console.log('save tick', tid, ': save ok');
            if (saveQueued === false) {
              // console.log('save tick', tid, ': save tick cleared');
              clearInterval(saveInterval);
              saveInterval = undefined;
            }
          }
        } else {
          // console.log('save tick', tid, ': currently saving, doing nothing');
        }
      }, saveCheckInterval);
      // console.log('save : creating save tick');
    } else {
      saveSkipNext = true;
      // console.log('save : save tick exists, skipping save on next tick');
    }
  };
}

module.exports = Database;
