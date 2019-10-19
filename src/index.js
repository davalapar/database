/* eslint-disable no-console */

const crypto = require('crypto');
const fs = require('fs');
const copy = require('./copy');
const stringify = require('./stringify');
const haversine = require('./haversine');

let queryItemSchema = {};
let queryList = [];
let querySorts = [];
let queryLimit = Infinity;
let queryOffset = 0;
let queryPage = 0;

// sorting a coordinate field requires a third and fourth parameter

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
    queryList = queryList.filter((item) => item[itemFieldKey] > value);
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
    queryList = queryList.filter((item) => item[itemFieldKey] >= value);
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
    queryList = queryList.filter((item) => item[itemFieldKey] < value);
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
    queryList = queryList.filter((item) => item[itemFieldKey] <= value);
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
    queryList = queryList.filter((item) => item[itemFieldKey] === value);
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
    queryList = queryList.filter((item) => item[itemFieldKey] !== value);
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
    queryList = queryList.filter((item) => item[itemFieldKey].includes(value) === true);
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
    queryList = queryList.filter((item) => item[itemFieldKey].includes(value) === false);
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
    queryList = queryList.filter((item) => item[itemFieldKey].length === 2 && haversine(coordinates[0], coordinates[1], item[itemFieldKey][0], item[itemFieldKey][1]) < meters);
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
    queryList = queryList.filter((item) => item[itemFieldKey].length === 2 && haversine(coordinates[0], coordinates[1], item[itemFieldKey][0], item[itemFieldKey][1]) > meters);
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
    if (querySorts.length > 1) {
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

const modified = Symbol('modified');
const stringifyFn = Symbol('stringifyFn');

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

function Table(tableOptions, database) {
  const { label, transformFunction } = tableOptions;
  if (typeof label !== 'string' || label === '') {
    throw Error('table :: label :: unexpected non-empty string');
  }
  if (transformFunction !== undefined && typeof transformFunction !== 'function') {
    throw Error('table :: transformFunction :: unexpected non-function');
  }

  this[modified] = false;
  let list = [];
  let dictionary = {};

  const [itemFieldKeys, itemSchema] = validateSchema(tableOptions.itemSchema);

  // validate schema
  const itemFieldsStringified = stringify(itemFieldKeys);

  // load items

  // [x] typechecks?
  // [x] working?
  this.label = () => label;

  // [x] typechecks?
  // [x] working?
  this.id = () => {
    let itemId = crypto.randomBytes(16).toString('hex');
    while (dictionary[itemId] !== undefined) {
      itemId = crypto.randomBytes(16).toString('hex');
    }
    return itemId;
  };

  // [x] typechecks?
  // [x] working?
  this.clear = () => {
    list = [];
    dictionary = {};
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
  this.add = (newItem) => {
    validateItem('add', itemFieldKeys, itemSchema, newItem);
    const { id } = newItem;
    if (dictionary[id] !== undefined) {
      throw Error(`table :: add :: unexpected existing id "${id}"`);
    }
    const duplicateItem = copy(newItem);
    list.push(duplicateItem);
    dictionary[id] = duplicateItem;
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
  this.update = (updatedItem) => {
    validateItem('update', itemFieldKeys, itemSchema, updatedItem);
    const { id } = updatedItem;
    if (dictionary[id] === undefined) {
      throw Error(`table :: update :: unexpected non-existing id "${id}"`);
    }
    const existingItem = dictionary[id];
    const existingItemIndex = list.indexOf(existingItem);
    const duplicateItem = copy(updatedItem);
    list[existingItemIndex] = duplicateItem;
    dictionary[id] = duplicateItem;
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
  this.get = (itemId) => {
    if (typeof itemId !== 'string') {
      throw Error(`table :: get :: unexpected non-string id "${itemId}"`);
    }
    return dictionary[itemId];
  };

  // [x] typechecks?
  // [x] working?
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
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
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
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
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
    this[modified] = true;
    database.save();
    return this;
  };

  // [x] typechecks?
  // [x] working?
  this.has = (itemId) => {
    if (typeof itemId !== 'string') {
      throw Error(`table :: has :: unexpected non-string id "${itemId}"`);
    }
    return dictionary[itemId] !== undefined;
  };

  // [ ] typechecks?
  // [x] working?
  this.query = () => {
    queryItemSchema = itemSchema;
    queryList = [];
    querySorts = [];
    queryLimit = Infinity;
    queryOffset = 0;
    queryPage = 0;
    return Query;
  };

  // [x] typechecks?
  // [x] working?
  this[modified] = () => modified;

  // [x] typechecks?
  // [x] working?
  this[stringifyFn] = () => {
    this[modified] = false;
    JSON.stringify(list);
  };
}

function Database(databaseOptions) {
  const {
    tableOptions,
    saveCheckInterval,
    saveMaxSkips,
  } = databaseOptions;
  const list = [];
  const dictionary = {};
  for (let i = 0, l = tableOptions.length; i < l; i += 1) {
    const table = new Table(tableOptions[i], this);
    list[i] = table;
    dictionary[table.label()] = table;
  }

  // [ ] typechecks?
  // [x] working?
  this.table = (label) => dictionary[label];

  let saveIsSaving = false;
  const internalSave = async () => {
    const tables = list.filter((table) => table[modified] === true);
    const data = list.map((table) => table[stringifyFn]());
    saveIsSaving = true;
    await tables.map((table, index) => fs.promises.writeFile(`./tables/${table.label()}.table`, data[index]));
    saveIsSaving = false;
  };

  let saveInterval;
  let saveSkipNext = false;
  let saveSkips = 0;
  let saveQueued = false;
  this.save = () => {
    if (saveIsSaving === true) {
      saveQueued = true;
      console.log('save : currently saving, queueing save');
      return;
    }
    if (saveInterval === undefined) {
      saveInterval = setInterval(async () => {
        const tid = (Math.random() * 10000).floor().toString().padStart(4, '0');
        if (saveIsSaving === false) {
          if (saveSkipNext === true) {
            saveSkipNext = false;
            if (saveSkips < saveMaxSkips) {
              saveSkips += 1;
              console.log(tid, 'save tick : save skipped');
            } else {
              saveSkips = 0;
              console.log(tid, 'save tick : saving');
              await internalSave();
              console.log(tid, 'save tick : save ok');
              if (saveQueued === false) {
                console.log(tid, 'save tick : save tick cleared');
                clearInterval(saveInterval);
                saveInterval = undefined;
              }
            }
          } else {
            console.log(tid, 'save tick : saving');
            await internalSave();
            console.log(tid, 'save tick : save ok');
            if (saveQueued === false) {
              console.log(tid, 'save tick : save tick cleared');
              clearInterval(saveInterval);
              saveInterval = undefined;
            }
          }
        } else {
          console.log(tid, 'save tick : currently saving, doing nothing');
        }
      }, saveCheckInterval);
      console.log('save : creating save tick');
    } else {
      saveSkipNext = true;
      console.log('save : save tick exists, skipping save on next tick');
    }
  };
}

const db = new Database({
  saveCheckInterval: 1000,
  saveMaxSkips: 59,
  tableOptions: [
    {
      label: 'users',
      itemSchema: {
        name: 'string',
        age: 'number',
        active: 'boolean',
      },
      transformFunction: () => {},
    },
  ],
});

const users = db.table('users');
