
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
let querySelects = [];
let queryLimit = Infinity;
let queryOffset = 0;
let queryPage = 0;

const Query = {

  // SORTS:
  ascend: (field) => {
    if (typeof field !== 'string') {
      throw Error('ascend :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('ascend :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'string' && queryItemSchema[field] !== 'number') {
      throw Error('ascend :: field :: Unexpected non-string and non-number field');
    }
    querySorts.push([field, false]);
    return Query;
  },
  descend: (field) => {
    if (typeof field !== 'string') {
      throw Error('descend :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('descend :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'string' && queryItemSchema[field] !== 'number') {
      throw Error('descend :: field :: Unexpected non-string and non-number field');
    }
    querySorts.push([field, true]);
    return Query;
  },
  ascend_h: (field, coordinates) => {
    if (typeof field !== 'string') {
      throw Error('ascend_h :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('ascend_h :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
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
    querySorts.push([field, false, coordinates]);
    return Query;
  },
  descend_h: (field, coordinates) => {
    if (typeof field !== 'string') {
      throw Error('descend_h :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('descend_h :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
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
    querySorts.push([field, true, coordinates]);
    return Query;
  },

  // FILTERS:
  gt: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('gt :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('gt :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('gt :: field :: Unexpected non-string and non-number field');
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
    queryFilters.push([1, field, value]);
    return Query;
  },
  gte: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('gte :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('gte :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('gte :: field :: Unexpected non-string and non-number field');
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
    queryFilters.push([2, field, value]);
    return Query;
  },
  lt: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('lt :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('lt :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('lt :: field :: Unexpected non-string and non-number field');
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
    queryFilters.push([3, field, value]);
    return Query;
  },
  lte: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('lte :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('lte :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('lte :: field :: Unexpected non-string and non-number field');
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
    queryFilters.push([4, field, value]);
    return Query;
  },
  eq: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('eq :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('eq :: field :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
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
        throw Error('eq :: field :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([5, field, value]);
    return Query;
  },
  neq: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('neq :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('neq :: field :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
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
        throw Error('neq :: field :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([6, field, value]);
    return Query;
  },
  includes: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('includes :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('includes :: field :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
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
        throw Error('includes :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([7, field, value]);
    return Query;
  },
  excludes: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('excludes :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('excludes :: field :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
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
        throw Error('excludes :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([8, field, value]);
    return Query;
  },
  inside_h: (field, coordinates, meters) => {
    if (typeof field !== 'string') {
      throw Error('inside_h :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('inside_h :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
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
    if (meters <= 0) {
      throw Error('outside_h :: meters :: Unexpected less-than-zero meters');
    }
    queryFilters.push([9, field, coordinates, meters]);
    return Query;
  },
  outside_h: (field, coordinates, meters) => {
    if (typeof field !== 'string') {
      throw Error('outside_h :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('outside_h :: field :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
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
    if (meters <= 0) {
      throw Error('outside_h :: meters :: Unexpected less-than-zero meters');
    }
    queryFilters.push([10, field, coordinates, meters]);
    return Query;
  },
  includes_some: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('includes_some :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('includes_some :: field :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('includes_some :: values :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('includes_some :: values :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('includes_some :: values :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('includes_some :: values :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('includes_some :: values :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('includes_some :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([11, field, values]);
    return Query;
  },
  includes_all: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('includes_all :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('includes_all :: field :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('includes_all :: values :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('includes_all :: values :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('includes_all :: values :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('includes_all :: values :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('includes_all :: values :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('includes_all :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([12, field, values]);
    return Query;
  },
  excludes_some: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('excludes_some :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('excludes_some :: field :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('excludes_some :: values :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('excludes_some :: values :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('excludes_some :: values :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('excludes_some :: values :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('excludes_some :: values :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('excludes_some :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([13, field, values]);
    return Query;
  },
  excludes_all: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('excludes_all :: field :: Unexpected non-string');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('excludes_all :: field :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('excludes_all :: values :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('excludes_all :: values :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('excludes_all :: values :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('excludes_all :: values :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('excludes_all :: values :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('excludes_all :: field :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([14, field, values]);
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

  // SELECT & DESELECT
  select: (fields) => {
    if (Array.isArray(fields) === false) {
      throw Error('select :: fields :: unexpected non-array fields');
    }
    if (fields.length === 0) {
      throw Error('select :: fields :: unexpected empty-array fields');
    }
    if (fields.every((field) => typeof field === 'string') === false) {
      throw Error('select :: fields :: unexpected non-string field');
    }
    if (fields.every((field) => queryItemSchema[field] !== undefined) === false) {
      throw Error('select :: fields :: Unexpected non-existing field');
    }
    querySelects = fields;
    return Query;
  },
  deselect: (fields) => {
    if (Array.isArray(fields) === false) {
      throw Error('deselect :: fields :: unexpected non-array fields');
    }
    if (fields.length === 0) {
      throw Error('deselect :: fields :: unexpected empty-array fields');
    }
    if (fields.every((field) => typeof field === 'string') === false) {
      throw Error('deselect :: fields :: unexpected non-string field');
    }
    if (fields.every((field) => queryItemSchema[field] !== undefined) === false) {
      throw Error('select :: fields :: Unexpected non-existing field');
    }
    querySelects = Object.keys(queryItemSchema).filter((field) => fields.includes(field) === false);
    return Query;
  },

  // RESULTS:
  results: () => {
    // console.log('queryList.length:', queryList.length, 'queryFilters.length:', queryFilters.length);
    if (queryFilters.length > 0) {
      queryList = queryList.filter((item) => {
        for (let i = 0, l = queryFilters.length; i < l; i += 1) {
          const [filterType, field, valueOrCoordinatesOrValues, meters] = queryFilters[i];
          switch (filterType) {
            case 1: { // gt
              if (item[field] <= valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 2: { // gte
              if (item[field] < valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 3: { // lt
              if (item[field] >= valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 4: { // lte
              if (item[field] > valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 5: { // eq
              if (item[field] !== valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 6: { // neq
              if (item[field] === valueOrCoordinatesOrValues) {
                return false;
              }
              break;
            }
            case 7: { // includes
              if (item[field].includes(valueOrCoordinatesOrValues) === false) {
                return false;
              }
              break;
            }
            case 8: { // excludes
              if (item[field].includes(valueOrCoordinatesOrValues) === true) {
                return false;
              }
              break;
            }
            case 9: { // inside_h
              if (item[field].length === 0) {
                return false;
              }
              if (item[field].includes(valueOrCoordinatesOrValues) === true) {
                return false;
              }
              if (haversine(valueOrCoordinatesOrValues[0], valueOrCoordinatesOrValues[1], item[field][0], item[field][1]) > meters) {
                return false;
              }
              break;
            }
            case 10: { // outside_h
              if (item[field].length === 0) {
                return false;
              }
              if (item[field].includes(valueOrCoordinatesOrValues) === true) {
                return false;
              }
              if (haversine(valueOrCoordinatesOrValues[0], valueOrCoordinatesOrValues[1], item[field][0], item[field][1]) <= meters) {
                return false;
              }
              break;
            }
            case 11: { // includes_some
              if (valueOrCoordinatesOrValues.some((value) => item[field].includes(value)) === false) {
                return false;
              }
              break;
            }
            case 12: { // includes_all
              if (valueOrCoordinatesOrValues.every((value) => item[field].includes(value)) === false) {
                return false;
              }
              break;
            }
            case 13: { // excludes_some
              if (valueOrCoordinatesOrValues.some((value) => item[field].includes(value)) === true) {
                return false;
              }
              break;
            }
            case 14: { // excludes_all
              if (valueOrCoordinatesOrValues.every((value) => item[field].includes(value)) === true) {
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
          const [field, descend, coordinates] = querySort;
          if (coordinates === undefined) {
            // type: string or number
            if (a[field] === b[field]) {
              continue; // eslint-disable-line no-continue
            }
            if (queryItemSchema[field] === 'string') {
              return descend
                ? b[field].localeCompare(a[field])
                : a[field].localeCompare(b[field]);
            }
            if (queryItemSchema[field] === 'number') {
              return descend
                ? b[field] - a[field]
                : a[field] - b[field];
            }
          } else {
            // type: coordinates
            if (a[field].length === 0 && b[field].length === 0) {
              return 0;
            }
            if (a[field].length === 0) {
              return -1;
            }
            if (b[field].length === 0) {
              return 1;
            }
            if (a[field][0] === b[field][0] && a[field][1] === b[field][1]) {
              return 0;
            }
            return descend
              ? haversine(coordinates[0], coordinates[1], b[field][0], b[field][1]) - haversine(coordinates[0], coordinates[1], a[field][0], a[field][1])
              : haversine(coordinates[0], coordinates[1], a[field][0], a[field][1]) - haversine(coordinates[0], coordinates[1], b[field][0], b[field][1]);
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
    if (querySelects.length > 0) {
      return queryList.map((item) => {
        const itemCopy = {};
        for (let i = 0, l = querySelects.length; i < l; i += 1) {
          const field = querySelects[i];
          switch (queryItemSchema[field]) {
            case 'strings':
            case 'numbers':
            case 'booleans':
            case 'coordinates': {
              itemCopy[field] = copy(item[querySelects[i]]);
              break;
            }
            default: {
              itemCopy[field] = item[querySelects[i]];
              break;
            }
          }
        }
        return itemCopy;
      });
    }
    return copy(queryList);
  },
};

const internalLabel = Symbol('internalLabel');
const internalModified = Symbol('internalModified');
const internalList = Symbol('internalList');
const internalOldPath = Symbol('internalOldPath');
const internalTempPath = Symbol('internalTempPath');
const internalCurrentPath = Symbol('internalCurrentPath');
const internalItemFieldsStringified = Symbol('internalItemFieldsStringified');
const internalEncodeFn = Symbol('internalEncodeFn');
const internalDecodeFn = Symbol('internalDecodeFn');

const validItemFieldTypes = [
  'boolean',
  'string',
  'number',
  'booleans',
  'strings',
  'numbers',
  'coordinates',
];

const validateItem = (method, fields, itemSchema, item) => {
  if (typeof item !== 'object' || item === null) {
    throw Error('table :: item :: unexpected non-object');
  }
  for (let i = 0, l = fields.length; i < l; i += 1) {
    const field = fields[i];
    const itemFieldType = itemSchema[field];
    switch (itemFieldType) {
      case 'boolean': {
        if (typeof item[field] !== 'boolean') {
          throw Error(`table :: ${method} :: unexpected non-boolean value for "${field}" field`);
        }
        break;
      }
      case 'string': {
        if (typeof item[field] !== 'string') {
          throw Error(`table :: ${method} :: unexpected non-string value for "${field}" field`);
        }
        break;
      }
      case 'number': {
        if (typeof item[field] !== 'number') {
          throw Error(`table :: ${method} :: unexpected non-number value for "${field}" field`);
        }
        if (Number.isNaN(item[field]) === true) {
          throw Error(`table :: ${method} :: unexpected NaN value for "${field}" field`);
        }
        if (Number.isFinite(item[field]) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value for "${field}" field`);
        }
        break;
      }
      case 'booleans': {
        if (Array.isArray(item[field]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${field}" field`);
        }
        if (item[field].every((value) => typeof value === 'boolean') === false) {
          throw Error(`table :: ${method} :: unexpected non-boolean value in "${field}" array field`);
        }
        break;
      }
      case 'strings': {
        if (Array.isArray(item[field]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${field}" field`);
        }
        if (item[field].every((value) => typeof value === 'string') === false) {
          throw Error(`table :: ${method} :: unexpected non-string value in "${field}" array field`);
        }
        break;
      }
      case 'numbers': {
        if (Array.isArray(item[field]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${field}" field`);
        }
        if (item[field].every((value) => typeof value === 'number') === false) {
          throw Error(`table :: ${method} :: unexpected non-number value in "${field}" array field`);
        }
        if (item[field].every((value) => Number.isNaN(value) === false) === false) {
          throw Error(`table :: ${method} :: unexpected NaN value in "${field}" array field`);
        }
        if (item[field].every((value) => Number.isFinite(value) === true) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value in "${field}" array field`);
        }
        break;
      }
      case 'coordinates': {
        if (Array.isArray(item[field]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${field}" field`);
        }
        if (item[field].every((value) => typeof value === 'number') === false) {
          throw Error(`table :: ${method} :: unexpected non-number value in "${field}" array field`);
        }
        if (item[field].every((value) => Number.isNaN(value) === false) === false) {
          throw Error(`table :: ${method} :: unexpected NaN value in "${field}" array field`);
        }
        if (item[field].every((value) => Number.isFinite(value) === true) === false) {
          throw Error(`table :: ${method} :: unexpected non-finite value in "${field}" array field`);
        }
        if (item[field].length !== 2) {
          throw Error(`table :: ${method} :: unexpected array length for "${field}" field`);
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
  const fields = ['id', ...Object.keys(itemSchema).sort((a, b) => a.localeCompare(b))];
  for (let i = 0, l = fields.length; i < l; i += 1) {
    const field = fields[i];
    if (field === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const itemFieldType = itemSchema[field];
    if (validItemFieldTypes.includes(itemFieldType) === false) {
      throw Error('table :: validateSchema :: unexpected field type');
    }
  }
  const itemSchemaCopy = copy(itemSchema);
  itemSchemaCopy.id = 'string';
  return [fields, itemSchemaCopy];
};


function Table(label, fields, itemSchema, transformFunction, database) {
  let list = [];
  let dictionary = {};
  this[internalLabel] = label;
  this[internalModified] = false;
  this[internalList] = list;
  this[internalOldPath] = `./tables/${label}-old.tb`;
  this[internalTempPath] = `./tables/${label}-temp.tb`;
  this[internalCurrentPath] = `./tables/${label}-current.tb`;
  const itemFieldsStringified = JSON.stringify(fields);
  this[internalItemFieldsStringified] = itemFieldsStringified;

  if (fs.existsSync(this[internalCurrentPath]) === true) {
    const encoded = fs.readFileSync(this[internalCurrentPath]);
    const decoded = database[internalDecodeFn](encoded);
    if (Array.isArray(decoded) === false) {
      throw Error('table :: load :: unexpected non-array "decoded" data.');
    }
    const [loadedfieldsStringified, loadedList] = decoded;
    if (typeof loadedfieldsStringified !== 'string') {
      throw Error('table :: load :: unexpected non-string "loadedfieldsStringified" data.');
    }
    if (Array.isArray(loadedList) === false) {
      throw Error('table :: load :: unexpected non-array "loadedList" data.');
    }
    if (loadedfieldsStringified === itemFieldsStringified) {
      list = loadedList;
      this[internalList] = list;
      for (let i = 0, l = loadedList.length; i < l; i += 1) {
        const item = loadedList[i];
        dictionary[item.id] = item;
      }
    } else {
      if (transformFunction === undefined) {
        throw Error('table :: load :: "transformFunction" is now required and must be a function.');
      }
      list = new Array(loadedList.length);
      this[internalList] = list;
      for (let i = 0, l = loadedList.length; i < l; i += 1) {
        const item = loadedList[i];
        const transformedItem = transformFunction(item);
        validateItem('load', fields, itemSchema, item);
        list[i] = transformedItem;
        dictionary[transformedItem.id] = transformedItem;
      }
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
    this[internalModified] = true;
    this[internalList] = list;
    return this;
  };

  this.add = (newItem) => {
    validateItem('add', fields, itemSchema, newItem);
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
    this[internalModified] = true;
    return newItem;
  };

  this.update = (updatedItem) => {
    validateItem('update', fields, itemSchema, updatedItem);
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
    this[internalModified] = true;
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
    this[internalModified] = true;
    return this;
  };

  this.increment = (itemId, field) => {
    if (typeof itemId !== 'string') {
      throw Error('table :: increment :: unexpected non-string itemId');
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: increment :: unexpected non-existing id "${itemId}"`);
    }
    if (fields.includes(field) === false) {
      throw Error(`table :: increment :: unexpected field "${field}"`);
    }
    if (itemSchema[field] !== 'number') {
      throw Error(`table :: increment :: unexpected non-number field "${field}"`);
    }
    const existingItem = dictionary[itemId];
    existingItem[field] += 1;
    this[internalModified] = true;
    return this;
  };

  this.decrement = (itemId, field) => {
    if (typeof itemId !== 'string') {
      throw Error('table :: decrement :: unexpected non-string itemId');
    }
    if (dictionary[itemId] === undefined) {
      throw Error(`table :: decrement :: unexpected non-existing id "${itemId}"`);
    }
    if (fields.includes(field) === false) {
      throw Error(`table :: decrement :: unexpected field "${field}"`);
    }
    if (itemSchema[field] !== 'number') {
      throw Error(`table :: decrement :: unexpected non-number field "${field}"`);
    }
    const existingItem = dictionary[itemId];
    existingItem[field] -= 1;
    this[internalModified] = true;
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
    querySelects = [];
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
    asyncSaveCheckInterval,
    asyncSaveMaxSkips,
    savePrettyJSON,
    saveCompressionAlgo,
  } = databaseOptions;

  // more type checks
  if (Array.isArray(tableConfigs) === false) {
    throw Error('table :: tableConfigs :: unexpected non-array value');
  }
  if (tableConfigs.every((tableConfig) => typeof tableConfig === 'object' && tableConfig !== null) === false) {
    throw Error('table :: tableConfigs :: unexpected non-object value in array');
  }
  if (typeof asyncSaveCheckInterval !== 'number' || Number.isNaN(asyncSaveCheckInterval) === true || Number.isFinite(asyncSaveCheckInterval) === false || Math.floor(asyncSaveCheckInterval) !== asyncSaveCheckInterval) {
    throw Error('table :: asyncSaveCheckInterval :: unexpected non-number / NaN / non-finite / non-integer value');
  }
  if (typeof asyncSaveMaxSkips !== 'number' || Number.isNaN(asyncSaveMaxSkips) === true || Number.isFinite(asyncSaveMaxSkips) === false || Math.floor(asyncSaveMaxSkips) !== asyncSaveMaxSkips) {
    throw Error('table :: asyncSaveMaxSkips :: unexpected non-number / NaN / non-finite / non-integer value');
  }
  if (typeof savePrettyJSON !== 'undefined' && typeof saveCompressionAlgo !== 'undefined') {
    throw Error('table :: unexpected usage of savePrettyJSON & saveCompressionAlgo');
  }
  if (typeof savePrettyJSON !== 'undefined' && typeof savePrettyJSON !== 'boolean') {
    throw Error('table :: savePrettyJSON :: unexpected non-boolean value');
  }
  if (typeof saveCompressionAlgo !== 'undefined' && saveCompressionAlgo !== 'gzip' && saveCompressionAlgo !== 'brotli') {
    throw Error('table :: saveCompressionAlgo :: unexpected non-"gzip" & non-"brotli" value');
  }

  // set encoderFn and decoderFn
  if (saveCompressionAlgo === 'gzip') {
    const asyncGzip = util.promisify(zlib.gzip);
    this[internalEncodeFn] = (decoded) => asyncGzip(JSON.stringify(decoded));
    this[internalDecodeFn] = (encoded) => JSON.parse(zlib.gunzipSync(encoded));
  } else if (saveCompressionAlgo === 'brotli') {
    const asyncBrotliCompress = util.promisify(zlib.brotliCompress);
    this[internalEncodeFn] = (decoded) => asyncBrotliCompress(JSON.stringify(decoded));
    this[internalDecodeFn] = (encoded) => JSON.parse(zlib.brotliDecompressSync(encoded));
  } else {
    this[internalEncodeFn] = (decoded) => JSON.stringify(decoded);
    this[internalDecodeFn] = (encoded) => JSON.parse(encoded);
  }

  if (fs.existsSync('./tables') === false) {
    fs.mkdirSync('./tables', { recursive: true });
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
    const [fields, itemSchemaCopy] = validateSchema(itemSchema);
    const table = new Table(label, fields, itemSchemaCopy, transformFunction, this);
    list[i] = table;
    dictionary[table.label()] = table;
  }

  this.table = (label) => {
    if (typeof label !== 'string') {
      throw Error('database :: table :: unexpected non-string label');
    }
    if (dictionary[label] === undefined) {
      throw Error(`database :: table :: unexpected non-existing table "${label}"`);
    }
    return dictionary[label];
  };

  let asyncSaveIsSaving = false;
  const zlibGzip = util.promisify(zlib.gzip);
  const zlibBrotliCompress = util.promisify(zlib.brotliCompress);
  const internalSave = async () => {
    asyncSaveIsSaving = true;
    await Promise.all(list.map(async (table) => {
      if (table[internalModified] === true) {
        let data = [table[internalItemFieldsStringified], table[internalList]];
        table[internalModified] = false;
        if (savePrettyJSON === true) {
          data = JSON.stringify(data, null, 2);
        } else if (saveCompressionAlgo === 'gzip') {
          data = await zlibGzip(JSON.stringify(data));
        } else if (saveCompressionAlgo === 'brotli') {
          data = await zlibBrotliCompress(JSON.stringify(data));
        } else {
          data = JSON.stringify(data);
        }
        await fs.promises.writeFile(table[internalTempPath], data);
        if (fs.existsSync(table[internalCurrentPath]) === true) {
          await fs.promises.rename(table[internalCurrentPath], table[internalOldPath]);
        }
        await fs.promises.writeFile(table[internalCurrentPath], data);
      }
    }));
    asyncSaveIsSaving = false;
  };

  let asyncSaveInterval;
  let asyncSaveSkipNext = false;
  let asyncCurrentSaveSkips = 0;
  let asyncSaveQueued = false;
  this.asyncSave = () => {
    if (asyncSaveIsSaving === true) {
      asyncSaveQueued = true;
      return;
    }
    if (asyncSaveInterval === undefined) {
      asyncSaveInterval = setInterval(async () => {
        if (asyncSaveIsSaving === false) {
          if (asyncSaveSkipNext === true) {
            asyncSaveSkipNext = false;
            if (asyncCurrentSaveSkips < asyncSaveMaxSkips) {
              asyncCurrentSaveSkips += 1;
            } else {
              asyncCurrentSaveSkips = 0;
              await internalSave();
              if (asyncSaveQueued === false) {
                clearInterval(asyncSaveInterval);
                asyncSaveInterval = undefined;
              }
            }
          } else {
            await internalSave();
            if (asyncSaveQueued === false) {
              clearInterval(asyncSaveInterval);
              asyncSaveInterval = undefined;
            }
          }
        }
      }, asyncSaveCheckInterval);
    } else {
      asyncSaveSkipNext = true;
    }
  };
  this.syncSave = () => {
    for (let i = 0, l = list.length; i < l; i += 1) {
      const table = list[i];
      if (table[internalModified] === true) {
        let data = [table[internalItemFieldsStringified], table[internalList]];
        table[internalModified] = false;
        if (savePrettyJSON === true) {
          data = JSON.stringify(data, null, 2);
        } else if (saveCompressionAlgo === 'gzip') {
          data = zlib.gzipSync(JSON.stringify(data));
        } else if (saveCompressionAlgo === 'brotli') {
          data = zlib.brotliCompressSync(JSON.stringify(data));
        } else {
          data = JSON.stringify(data);
        }
        fs.writeFileSync(table[internalTempPath], data);
        if (fs.existsSync(table[internalCurrentPath]) === true) {
          fs.renameSync(table[internalCurrentPath], table[internalOldPath]);
        }
        fs.writeFileSync(table[internalCurrentPath], data);
      }
    }
  };
}

module.exports = Database;
