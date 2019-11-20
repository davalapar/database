
const os = require('os');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const crypto = require('crypto');
const cluster = require('cluster');
const copy = require('./internals/copy');
const haversine = require('./internals/haversine');

const osPlatform = os.platform();

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
      throw Error('query.ascend(field) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.ascend(field) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'string' && queryItemSchema[field] !== 'number') {
      throw Error('query.ascend(field) :: Unexpected non-string and non-number field');
    }
    querySorts.push([field, false]);
    return Query;
  },
  descend: (field) => {
    if (typeof field !== 'string') {
      throw Error('query.descend(field) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.descend(field) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'string' && queryItemSchema[field] !== 'number') {
      throw Error('query.descend(field) :: Unexpected non-string and non-number field');
    }
    querySorts.push([field, true]);
    return Query;
  },
  ascend_h: (field, coordinates) => {
    if (typeof field !== 'string') {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('query.ascend_h(field, coordinates) :: Unexpected non-2 length for coordinates');
    }
    querySorts.push([field, false, coordinates]);
    return Query;
  },
  descend_h: (field, coordinates) => {
    if (typeof field !== 'string') {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('query.descend_h(field, coordinates) :: Unexpected non-2 length for coordinates');
    }
    querySorts.push([field, true, coordinates]);
    return Query;
  },

  // FILTERS:
  gt: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.gt(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.gt(field, value) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('query.gt(field, value) :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('query.gt(field, value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.gt(field, value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.gt(field, value) :: Unexpected non-finite value');
    }
    queryFilters.push([1, field, value]);
    return Query;
  },
  gte: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.gte(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.gte(field, value) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('query.gte(field, value) :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('query.gte(field, value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.gte(field, value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.gte(field, value) :: Unexpected non-finite value');
    }
    queryFilters.push([2, field, value]);
    return Query;
  },
  lt: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.lt(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.lt(field, value) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('query.lt(field, value) :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('query.lt(field, value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.lt(field, value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.lt(field, value) :: Unexpected non-finite value');
    }
    queryFilters.push([3, field, value]);
    return Query;
  },
  lte: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.lte(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.lte(field, value) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'number') {
      throw Error('query.lte(field, value) :: Unexpected non-string and non-number field');
    }
    if (typeof value !== 'number') {
      throw Error('query.lte(field, value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.lte(field, value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.lte(field, value) :: Unexpected non-finite value');
    }
    queryFilters.push([4, field, value]);
    return Query;
  },
  eq: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.eq(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.eq(field, value) :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
      case 'boolean': {
        if (typeof value !== 'boolean') {
          throw Error('query.eq(field, value) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'string': {
        if (typeof value !== 'string') {
          throw Error('query.eq(field, value) :: Unexpected non-string value');
        }
        break;
      }
      case 'number': {
        if (typeof value !== 'number') {
          throw Error('query.eq(field, value) :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('query.eq(field, value) :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('query.eq(field, value) :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.eq(field, value) :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([5, field, value]);
    return Query;
  },
  neq: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.neq(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.neq(field, value) :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
      case 'boolean': {
        if (typeof value !== 'boolean') {
          throw Error('query.neq(field, value) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'string': {
        if (typeof value !== 'string') {
          throw Error('query.neq(field, value) :: Unexpected non-string value');
        }
        break;
      }
      case 'number': {
        if (typeof value !== 'number') {
          throw Error('query.neq(field, value) :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('query.neq(field, value) :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('query.neq(field, value) :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.neq(field, value) :: Unexpected non-string, non-number, and non-boolean field');
      }
    }
    queryFilters.push([6, field, value]);
    return Query;
  },
  includes: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.includes(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.includes(field, value) :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (typeof value !== 'boolean') {
          throw Error('query.includes(field, value) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (typeof value !== 'string') {
          throw Error('query.includes(field, value) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (typeof value !== 'number') {
          throw Error('query.includes(field, value) :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('query.includes(field, value) :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('query.includes(field, value) :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.includes(field, value) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([7, field, value]);
    return Query;
  },
  excludes: (field, value) => {
    if (typeof field !== 'string') {
      throw Error('query.excludes(field, value) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.excludes(field, value) :: Unexpected non-existing field');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (typeof value !== 'boolean') {
          throw Error('query.excludes(field, value) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (typeof value !== 'string') {
          throw Error('query.excludes(field, value) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (typeof value !== 'number') {
          throw Error('query.excludes(field, value) :: Unexpected non-number value');
        }
        if (Number.isNaN(value) === true) {
          throw Error('query.excludes(field, value) :: Unexpected NaN value');
        }
        if (Number.isFinite(value) === false) {
          throw Error('query.excludes(field, value) :: Unexpected non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.excludes(field, value) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([8, field, value]);
    return Query;
  },
  inside_h: (field, coordinates, meters) => {
    if (typeof field !== 'string') {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-2 length for coordinates');
    }
    if (typeof meters !== 'number') {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-number meters');
    }
    if (Number.isNaN(meters) === true) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected NaN meters');
    }
    if (Number.isFinite(meters) === false) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected non-finite meters');
    }
    if (meters <= 0) {
      throw Error('query.inside_h(field, coordinates, meters) :: Unexpected less-than-zero meters');
    }
    queryFilters.push([9, field, coordinates, meters]);
    return Query;
  },
  outside_h: (field, coordinates, meters) => {
    if (typeof field !== 'string') {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-existing field');
    }
    if (queryItemSchema[field] !== 'coordinates') {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-coordinates field');
    }
    if (Array.isArray(coordinates) === false) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-array coordinates');
    }
    if (coordinates.every((value) => typeof value === 'number') === false) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-number in coordinates');
    }
    if (coordinates.every((value) => Number.isNaN(value) === false) === false) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected NaN in coordinates');
    }
    if (coordinates.every((value) => Number.isFinite(value) === true) === false) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-finite in coordinates');
    }
    if (coordinates.length !== 2) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-2 length for coordinates');
    }
    if (typeof meters !== 'number') {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-number meters');
    }
    if (Number.isNaN(meters) === true) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected NaN meters');
    }
    if (Number.isFinite(meters) === false) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected non-finite meters');
    }
    if (meters <= 0) {
      throw Error('query.outside_h(field, coordinates, meters) :: Unexpected less-than-zero meters');
    }
    queryFilters.push([10, field, coordinates, meters]);
    return Query;
  },
  includes_some: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('query.includes_some(field, values) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.includes_some(field, values) :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('query.includes_some(field, values) :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('query.includes_some(field, values) :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('query.includes_some(field, values) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('query.includes_some(field, values) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('query.includes_some(field, values) :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.includes_some(field, values) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([11, field, values]);
    return Query;
  },
  includes_all: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('query.includes_all(field, values) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.includes_all(field, values) :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('query.includes_all(field, values) :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('query.includes_all(field, values) :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('query.includes_all(field, values) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('query.includes_all(field, values) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('query.includes_all(field, values) :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.includes_all(field, values) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([12, field, values]);
    return Query;
  },
  excludes_some: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('query.excludes_some(field, values) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.excludes_some(field, values) :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('query.excludes_some(field, values) :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('query.excludes_some(field, values) :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('query.excludes_some(field, values) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('query.excludes_some(field, values) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('query.excludes_some(field, values) :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.excludes_some(field, values) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([13, field, values]);
    return Query;
  },
  excludes_all: (field, values) => {
    if (typeof field !== 'string') {
      throw Error('query.excludes_all(field, values) :: Unexpected non-string field');
    }
    if (queryItemSchema[field] === undefined) {
      throw Error('query.excludes_all(field, values) :: Unexpected non-existing field');
    }
    if (Array.isArray(values) === false) {
      throw Error('query.excludes_all(field, values) :: Unexpected non-array values');
    }
    if (values.length === 0) {
      throw Error('query.excludes_all(field, values) :: Unexpected empty-array values');
    }
    switch (queryItemSchema[field]) {
      case 'booleans': {
        if (values.every((value) => typeof value === 'boolean') === false) {
          throw Error('query.excludes_all(field, values) :: Unexpected non-boolean value');
        }
        break;
      }
      case 'strings': {
        if (values.every((value) => typeof value === 'string') === false) {
          throw Error('query.excludes_all(field, values) :: Unexpected non-string value');
        }
        break;
      }
      case 'numbers': {
        if (values.every((value) => typeof value === 'number' && Number.isNaN(value) === false && Number.isFinite(value) === true) === false) {
          throw Error('query.excludes_all(field, values) :: Unexpected non-number / NaN / non-finite value');
        }
        break;
      }
      default: {
        throw Error('query.excludes_all(field, values) :: Unexpected non-strings, non-numbers, and non-booleans field');
      }
    }
    queryFilters.push([14, field, values]);
    return Query;
  },

  // PAGINATE:
  limit: (value) => {
    if (typeof value !== 'number') {
      throw Error('query.limit(value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.limit(value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.limit(value) :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('query.limit(value) :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('query.limit(value) :: Unexpected less-than-zero value');
    }
    queryLimit = value;
    return Query;
  },
  offset: (value) => {
    if (typeof value !== 'number') {
      throw Error('query.offset(value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.offset(value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.offset(value) :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('query.offset(value) :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('query.offset(value) :: Unexpected less-than-zero value');
    }
    if (queryPage !== 0) {
      throw Error('query.offset(value) :: cannot use offset() with page()');
    }
    queryOffset = value;
    return Query;
  },
  page: (value) => {
    if (typeof value !== 'number') {
      throw Error('query.page(value) :: Unexpected non-number value');
    }
    if (Number.isNaN(value) === true) {
      throw Error('query.page(value) :: Unexpected NaN value');
    }
    if (Number.isFinite(value) === false) {
      throw Error('query.page(value) :: Unexpected non-finite value');
    }
    if (Math.floor(value) !== value) {
      throw Error('query.page(value) :: Unexpected non-integer value');
    }
    if (value <= 0) {
      throw Error('query.page(value) :: Unexpected less-than-zero value');
    }
    if (queryOffset !== 0) {
      throw Error('query.page(value) :: cannot use page() with offset()');
    }
    queryPage = value;
    return Query;
  },

  // SELECT & DESELECT
  select: (fields) => {
    if (Array.isArray(fields) === false) {
      throw Error('query.select(fields) :: unexpected non-array fields');
    }
    if (fields.length === 0) {
      throw Error('query.select(fields) :: unexpected empty-array fields');
    }
    if (fields.every((field) => typeof field === 'string') === false) {
      throw Error('query.select(fields) :: unexpected non-string field');
    }
    if (fields.every((field) => queryItemSchema[field] !== undefined) === false) {
      throw Error('query.select(fields) :: Unexpected non-existing field');
    }
    querySelects = fields;
    return Query;
  },
  deselect: (fields) => {
    if (Array.isArray(fields) === false) {
      throw Error('query.deselect(fields) :: unexpected non-array fields');
    }
    if (fields.length === 0) {
      throw Error('query.deselect(fields) :: unexpected empty-array fields');
    }
    if (fields.every((field) => typeof field === 'string') === false) {
      throw Error('query.deselect(fields) :: unexpected non-string field');
    }
    if (fields.every((field) => queryItemSchema[field] !== undefined) === false) {
      throw Error('query.deselect(fields) :: Unexpected non-existing field');
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
const internalCompressionPath = Symbol('internalCompressionPath');
const internalOldPath = Symbol('internalOldPath');
const internalTempPath = Symbol('internalTempPath');
const internalCurrentPath = Symbol('internalCurrentPath');
const internalSchemaHash = Symbol('internalSchemaHash');

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

function Table(label, fields, itemSchema, transformFunction, randomBytes) {
  let list = [];
  let dictionary = {};
  this[internalLabel] = label;
  this[internalModified] = false;
  this[internalList] = list;
  this[internalCompressionPath] = `./tables/${label}-compression.tb`;
  this[internalOldPath] = `./tables/${label}-old.tb`;
  this[internalTempPath] = `./tables/${label}-temp.tb`;
  this[internalCurrentPath] = `./tables/${label}-current.tb`;
  const schemaHash = crypto.createHash('sha512-256').update(JSON.stringify(itemSchema)).digest('hex');
  this[internalSchemaHash] = schemaHash;

  let saveCompressionAlgo;
  if (fs.existsSync(this[internalCompressionPath]) === true) {
    saveCompressionAlgo = JSON.parse(fs.readFileSync(this[internalCompressionPath]));
  }

  if (fs.existsSync(this[internalCurrentPath]) === true) {
    let data = fs.readFileSync(this[internalCurrentPath]);
    if (saveCompressionAlgo === 'gzip') {
      data = zlib.gunzipSync(data);
    } else if (saveCompressionAlgo === 'brotli') {
      data = zlib.brotliDecompressSync(data);
    }
    data = JSON.parse(data);
    if (Array.isArray(data) === false) {
      throw Error('table :: load :: unexpected non-array "decoded" data.');
    }
    const [loadedSchemaHash, loadedList] = data;
    if (typeof loadedSchemaHash !== 'string') {
      throw Error('table :: load :: unexpected non-string "loadedSchemaHash" data.');
    }
    if (Array.isArray(loadedList) === false) {
      throw Error('table :: load :: unexpected non-array "loadedList" data.');
    }
    if (loadedSchemaHash === schemaHash) {
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
      this[internalModified] = true;
    }
  }

  this.label = () => label;

  this.id = (bytes) => {
    if (bytes !== undefined) {
      if (typeof bytes !== 'number' || Number.isNaN(bytes) === true || Number.isFinite(bytes) === false || Math.floor(bytes) !== bytes) {
        throw Error('table.id(bytes) :: invalid value for bytes');
      }
    }
    let id = randomBytes(bytes || 32).toString('hex');
    while (dictionary[id] !== undefined) {
      id = randomBytes(bytes || 32).toString('hex');
    }
    return id;
  };

  this.clear = () => {
    list = [];
    dictionary = {};
    this[internalModified] = true;
    this[internalList] = list;
    if (cluster.isWorker === true) {
      // ...
    }
    return this;
  };

  this.defaults = (sourceItem) => {
    if (typeof sourceItem !== 'object' || sourceItem === null) {
      throw Error('table.defaults(sourceItem) :: unexpected non-object sourceItem');
    }
    const updatedItem = copy(sourceItem);
    for (let i = 1, l = fields.length; i < l; i += 1) {
      const field = fields[i];
      if (updatedItem[field] === undefined) {
        switch (itemSchema[field]) {
          case 'boolean': {
            updatedItem[field] = false;
            break;
          }
          case 'string': {
            updatedItem[field] = '';
            break;
          }
          case 'number': {
            updatedItem[field] = 0;
            break;
          }
          case 'booleans':
          case 'strings':
          case 'numbers':
          case 'coordinates': {
            updatedItem[field] = [];
            break;
          }
          default: {
            throw Error(`table.defaults(item) :: unexpected field ${field}`);
          }
        }
      }
    }
    return updatedItem;
  };

  this.add = (newItem) => {
    validateItem('add', fields, itemSchema, newItem);
    const { id } = newItem;
    if (typeof id !== 'string' || id === '') {
      throw Error('table.add(newItem) :: unexpected non-string / empty string "id"');
    }
    if (dictionary[id] !== undefined) {
      throw Error(`table.add(newItem) :: unexpected existing id "${id}"`);
    }
    const duplicateItem = copy(newItem);
    list.push(duplicateItem);
    dictionary[id] = duplicateItem;
    this[internalModified] = true;
    if (cluster.isWorker === true) {
      // ...
    }
    return newItem;
  };

  this.update = (updatedItem) => {
    validateItem('update', fields, itemSchema, updatedItem);
    const { id } = updatedItem;
    if (typeof id !== 'string' || id === '') {
      throw Error('table.update(updatedItem) :: unexpected non-string / empty string "id"');
    }
    if (dictionary[id] === undefined) {
      throw Error(`table.update(updatedItem) :: unexpected non-existing id "${id}"`);
    }
    const existingItem = dictionary[id];
    const existingItemIndex = list.indexOf(existingItem);
    const duplicateItem = copy(updatedItem);
    list[existingItemIndex] = duplicateItem;
    dictionary[id] = duplicateItem;
    this[internalModified] = true;
    if (cluster.isWorker === true) {
      // ...
    }
    return updatedItem;
  };

  this.get = (id) => {
    if (typeof id !== 'string') {
      throw Error(`table.get(id) :: unexpected non-string id "${id}"`);
    }
    if (dictionary[id] === undefined) {
      throw Error(`table.get(id) :: unexpected non-existing id "${id}"`);
    }
    return dictionary[id];
  };

  this.delete = (id) => {
    if (typeof id !== 'string') {
      throw Error('table.delete(id) :: unexpected non-string id');
    }
    if (dictionary[id] === undefined) {
      throw Error(`table.delete(id) :: unexpected non-existing id "${id}"`);
    }
    list.splice(list.indexOf(dictionary[id]), 1);
    delete dictionary[id];
    this[internalModified] = true;
    return this;
  };

  this.increment = (id, field) => {
    if (typeof id !== 'string') {
      throw Error('table.increment(id, field) :: unexpected non-string id');
    }
    if (dictionary[id] === undefined) {
      throw Error(`table.increment(id, field) :: unexpected non-existing id "${id}"`);
    }
    if (fields.includes(field) === false) {
      throw Error(`table.increment(id, field) :: unexpected field "${field}"`);
    }
    if (itemSchema[field] !== 'number') {
      throw Error(`table.increment(id, field) :: unexpected non-number field "${field}"`);
    }
    const existingItem = dictionary[id];
    existingItem[field] += 1;
    this[internalModified] = true;
    if (cluster.isWorker === true) {
      // ...
    }
    return this;
  };
  this.incr = this.increment;

  this.decrement = (id, field) => {
    if (typeof id !== 'string') {
      throw Error('table.decrement(id, field) :: unexpected non-string id');
    }
    if (dictionary[id] === undefined) {
      throw Error(`table.decrement(id, field) :: unexpected non-existing id "${id}"`);
    }
    if (fields.includes(field) === false) {
      throw Error(`table.decrement(id, field) :: unexpected field "${field}"`);
    }
    if (itemSchema[field] !== 'number') {
      throw Error(`table.decrement(id, field) :: unexpected non-number field "${field}"`);
    }
    const existingItem = dictionary[id];
    existingItem[field] -= 1;
    this[internalModified] = true;
    if (cluster.isWorker === true) {
      // ...
    }
    return this;
  };
  this.decr = this.decrement;

  this.has = (id) => {
    if (typeof id !== 'string') {
      throw Error(`table.has(id) :: unexpected non-string id "${id}"`);
    }
    return dictionary[id] !== undefined;
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


function Database(dbOptions) {
  // type checks
  if (typeof dbOptions !== 'object' || dbOptions === null) {
    throw Error('new Database(dbOptions) :: unexpected non-object dbOptions');
  }

  const {
    tableConfigs,
    asyncSaveCheckInterval,
    asyncSaveMaxSkips,
    savePrettyJSON,
    saveCompressionAlgo,
    saveGracefulInterrupt,
    saveGracefulTerminate,
    preferDevUrandom,
  } = dbOptions;

  // more type checks
  if (Array.isArray(tableConfigs) === false) {
    throw Error('dbOptions.tableConfigs :: unexpected non-array value');
  }
  if (tableConfigs.every((tableConfig) => typeof tableConfig === 'object' && tableConfig !== null) === false) {
    throw Error('dbOptions.tableConfigs :: unexpected non-object value in array');
  }
  if (asyncSaveCheckInterval !== undefined) {
    if (typeof asyncSaveCheckInterval !== 'number' || Number.isNaN(asyncSaveCheckInterval) === true || Number.isFinite(asyncSaveCheckInterval) === false || Math.floor(asyncSaveCheckInterval) !== asyncSaveCheckInterval) {
      throw Error('dbOptions.asyncSaveCheckInterval :: unexpected non-number / NaN / non-finite / non-integer value');
    }
  }
  if (asyncSaveMaxSkips !== undefined) {
    if (typeof asyncSaveMaxSkips !== 'number' || Number.isNaN(asyncSaveMaxSkips) === true || Number.isFinite(asyncSaveMaxSkips) === false || Math.floor(asyncSaveMaxSkips) !== asyncSaveMaxSkips) {
      throw Error('dbOptions.asyncSaveMaxSkips :: unexpected non-number / NaN / non-finite / non-integer value');
    }
  }
  if (savePrettyJSON !== undefined) {
    if (saveCompressionAlgo !== undefined) {
      throw Error('dbOptions :: unexpected usage of savePrettyJSON & saveCompressionAlgo');
    }
    if (typeof savePrettyJSON !== 'boolean') {
      throw Error('dbOptions.savePrettyJSON :: unexpected non-boolean value');
    }
  }
  if (saveCompressionAlgo !== undefined) {
    if (saveCompressionAlgo !== 'gzip' && saveCompressionAlgo !== 'brotli') {
      throw Error('dbOptions.saveCompressionAlgo :: unexpected non-"gzip" & non-"brotli" value');
    }
  }
  if (saveGracefulInterrupt !== undefined) {
    if (typeof saveGracefulInterrupt !== 'boolean') {
      throw Error('dbOptions.saveGracefulInterrupt :: unexpected non-boolean value');
    }
  }
  if (saveGracefulTerminate !== undefined) {
    if (typeof saveGracefulTerminate !== 'boolean') {
      throw Error('dbOptions.saveGracefulTerminate :: unexpected non-boolean value');
    }
  }
  if (preferDevUrandom !== undefined) {
    if (typeof preferDevUrandom !== 'boolean') {
      throw Error('dbOptions.preferDevUrandom :: unexpected non-boolean value');
    }
  }

  let randomBytes;
  let randomBytesFd;

  if (preferDevUrandom === true) {
    if (osPlatform === 'linux' || osPlatform === 'darwin') {
      randomBytesFd = fs.openSync('/dev/urandom');
      randomBytes = (length) => {
        const buffer = Buffer.allocUnsafe(length);
        fs.readSync(randomBytesFd, buffer, 0, length, 0);
        return buffer;
      };
    } else {
      randomBytes = crypto.randomBytes;
    }
  } else {
    randomBytes = crypto.randomBytes;
  }


  if (fs.existsSync('./tables') === false) {
    fs.mkdirSync('./tables', { recursive: true });
  }

  const list = [];
  const dictionary = {};
  for (let i = 0, l = tableConfigs.length; i < l; i += 1) {
    const { label, itemSchema, transformFunction } = tableConfigs[i];
    if (typeof label !== 'string') {
      throw Error(`dbOptions.tableConfigs[${i}].label :: unexpected non-string value`);
    }
    if (dictionary[label] !== undefined) {
      throw Error(`dbOptions.tableConfigs[${i}].label :: unexpected duplicate value`);
    }
    if (transformFunction !== undefined) {
      if (typeof transformFunction !== 'function') {
        throw Error(`dbOptions.tableConfigs[${i}].transformFunction :: unexpected non-function`);
      }
    }
    const [fields, itemSchemaCopy] = validateSchema(itemSchema);
    const table = new Table(label, fields, itemSchemaCopy, transformFunction, randomBytes);
    list[i] = table;
    dictionary[label] = table;
  }

  this.table = (label) => {
    if (typeof label !== 'string') {
      throw Error('database.table(label) :: unexpected non-string label');
    }
    if (dictionary[label] === undefined) {
      throw Error(`database.table(label) :: unexpected non-existing table "${label}"`);
    }
    return dictionary[label];
  };

  let asyncSaveIsSaving = false;
  const zlibGzip = util.promisify(zlib.gzip);
  const zlibBrotliCompress = util.promisify(zlib.brotliCompress);
  const asyncSaveInternal = async () => {
    asyncSaveIsSaving = true;
    await Promise.all(list.map(async (table) => {
      if (table[internalModified] === true) {
        let data = [table[internalSchemaHash], table[internalList]];
        table[internalModified] = false; // eslint-disable-line no-param-reassign
        if (savePrettyJSON === true) {
          data = JSON.stringify(data, null, 2);
        } else if (saveCompressionAlgo === 'gzip') {
          data = await zlibGzip(JSON.stringify(data));
        } else if (saveCompressionAlgo === 'brotli') {
          data = await zlibBrotliCompress(JSON.stringify(data));
        } else {
          data = JSON.stringify(data);
        }
        if (saveCompressionAlgo !== undefined) {
          await fs.promises.writeFile(table[internalCompressionPath], JSON.stringify(saveCompressionAlgo));
        } else if (fs.existsSync(table[internalCompressionPath]) === true) {
          await fs.promises.unlink(table[internalCompressionPath]);
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
  this.asyncSave = async () => {
    if (asyncSaveIsSaving === true) {
      asyncSaveQueued = true;
      return;
    }
    if (asyncSaveInterval === undefined) {
      asyncSaveInterval = setInterval(async () => {
        if (asyncSaveIsSaving === false) {
          if (asyncSaveSkipNext === true) {
            asyncSaveSkipNext = false;
            if (asyncCurrentSaveSkips < (asyncSaveMaxSkips || 0)) {
              asyncCurrentSaveSkips += 1;
            } else {
              asyncCurrentSaveSkips = 0;
              await asyncSaveInternal();
              if (asyncSaveQueued === false) {
                clearInterval(asyncSaveInterval);
                asyncSaveInterval = undefined;
              }
            }
          } else {
            await asyncSaveInternal();
            if (asyncSaveQueued === false) {
              clearInterval(asyncSaveInterval);
              asyncSaveInterval = undefined;
            }
          }
        }
      }, (asyncSaveCheckInterval || 1000));
    } else {
      asyncSaveSkipNext = true;
    }
  };
  this.syncSave = () => {
    for (let i = 0, l = list.length; i < l; i += 1) {
      const table = list[i];
      if (table[internalModified] === true) {
        let data = [table[internalSchemaHash], table[internalList]];
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
        if (saveCompressionAlgo !== undefined) {
          fs.writeFileSync(table[internalCompressionPath], JSON.stringify(saveCompressionAlgo));
        } else if (fs.existsSync(table[internalCompressionPath]) === true) {
          fs.unlinkSync(table[internalCompressionPath]);
        }
        fs.writeFileSync(table[internalTempPath], data);
        if (fs.existsSync(table[internalCurrentPath]) === true) {
          fs.renameSync(table[internalCurrentPath], table[internalOldPath]);
        }
        fs.writeFileSync(table[internalCurrentPath], data);
      }
    }
  };
  const gracefulExit = () => {
    this.syncSave();
    if (preferDevUrandom === true) {
      if (osPlatform === 'linux' || osPlatform === 'darwin') {
        fs.closeSync(randomBytesFd);
      }
    }
  };
  if (saveGracefulInterrupt === true) {
    process.on('SIGINT', gracefulExit);
  }
  if (saveGracefulTerminate === true) {
    process.on('SIGTERM', gracefulExit);
  }

  if (cluster.isWorker === true) {
    this.hydrate = async () => {

    };
  }
}

/**
 * message[0] = 'db';
 * message[1] = 'add';
 * message[2] = '';
 * message[3] = '';
 *
 * table[internalAdd]
 * table[internalUpdate]
 * table[internalDelete]
 * table[internalIncrement]
 * table[internalDecrement]
 *
 */

if (cluster.isMaster === true) {
  // receive changes:
  process.on('message', (message) => {
    // check if message qualifies:
    if (Array.isArray(message) === true && message[0] === 'db') {
      // reflect changes locally
      switch (message[1]) {
        case 0: { // add
          const tableId = message[2];
          break;
        }
        case 1: { // update
          break;
        }
        case 2: { // delete
          break;
        }
        case 3: { // increment
          break;
        }
        case 4: { // decrement
          break;
        }
        case 5: { // clear
          break;
        }
        default: {
          throw Error('Unexpected!');
        }
      }
      // ...
      // save if necessary
      // ...
      // forward changes to worker threads
      const keys = Object.keys(cluster.workers);
      for (let i = 0, l = keys.length; i < l; i += 1) {
        cluster.workers[keys[i]].send(message);
      }
    }
  });
}
if (cluster.isWorker === true) {
  // receive changes:
  process.on('message', (message) => {
    // check if message qualifies:
    if (Array.isArray(message) === true && message[0] === 'db') {
      // reflect changes to cloned tables
    }
  });
}

module.exports = Database;
