/* eslint-disable no-console */

const crypto = require('crypto');
const fs = require('fs');
const copy = require('./copy');

let internalQuerylist = [];
let internalQuerySorts = [];
let internalQueryLimit = Infinity;
let internalQueryOffset = 0;
let internalQueryPage = 0;

// sorting a coordinate field requires a third and fourth parameter

const Query = {
  // SORTS:

  // [ ] typechecks?
  // [ ] working?
  ascend: (itemFieldKey) => {},

  // [ ] typechecks?
  // [ ] working?
  descend: (itemFieldKey) => {},

  // [ ] typechecks?
  // [ ] working?
  ascendh: (itemFieldKey, coordinates) => {},

  // [ ] typechecks?
  // [ ] working?
  descendh: (itemFieldKey, coordinates) => {},

  // FILTERS:

  // [ ] typechecks?
  // [ ] working?
  gt: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  gte: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  lt: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  lte: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  eq: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  neq: (itemFieldKey, value) => {},

  // [ ] typechecks?
  // [ ] working?
  has: (itemFieldKey, value) => {},

  // PAGINATE:

  // [ ] typechecks?
  // [ ] working?
  limit: (value) => {},

  // [ ] typechecks?
  // [ ] working?
  offset: (value) => {},

  // [ ] typechecks?
  // [ ] working?
  page: (value) => {},
  // results:

  // [ ] typechecks?
  // [ ] working?
  results: () => {},
};

const modified = Symbol('modified');
const stringify = Symbol('stringify');

const validItemFieldTypes = [
  'boolean',
  'string',
  'number',
  'booleans',
  'strings',
  'numbers',
  'coordinates',
];

const validateItem = (method, itemFieldKeys, itemFieldTypes, item) => {
  if (typeof item !== 'object' || item === null) {
    throw Error('table :: item :: unexpected non-object');
  }
  for (let i = 0, l = itemFieldKeys.length; i < l; i += 1) {
    const itemFieldKey = itemFieldKeys[i];
    const itemFieldType = itemFieldTypes[i];
    switch (itemFieldType) {
      case 'boolean': {
        if (typeof item[itemFieldKey] !== 'boolean') {
          throw Error(`table :: ${method} :: unexpected non-boolean value for "${itemFieldKey}" field`);
        }
        return;
      }
      case 'string': {
        if (typeof item[itemFieldKey] !== 'string') {
          throw Error(`table :: ${method} :: unexpected non-string value for "${itemFieldKey}" field`);
        }
        return;
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
        return;
      }
      case 'booleans': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'boolean') === false) {
          throw Error(`table :: ${method} :: unexpected non-boolean value in "${itemFieldKey}" array field`);
        }
        return;
      }
      case 'strings': {
        if (Array.isArray(item[itemFieldKey]) === false) {
          throw Error(`table :: ${method} :: unexpected non-array value for "${itemFieldKey}" field`);
        }
        if (item[itemFieldKey].every((value) => typeof value === 'string') === false) {
          throw Error(`table :: ${method} :: unexpected non-string value in "${itemFieldKey}" array field`);
        }
        return;
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
        return;
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
        return;
      }
      default: {
        return;
      }
    }
  }
};

function Table(tableOptions, database) {
  const {
    label,
    itemSchema,
    transformFunction,
  } = tableOptions;

  if (typeof label !== 'string' || label === '') {
    throw Error('table :: label :: unexpected non-empty string');
  }
  if (typeof itemSchema !== 'object' || itemSchema === null) {
    throw Error('table :: itemSchema :: unexpected non-object');
  }
  if (transformFunction !== undefined && typeof transformFunction !== 'function') {
    throw Error('table :: transformFunction :: unexpected non-function');
  }

  this[modified] = false;
  let list = [];
  let dictionary = {};

  // validate schema
  const itemFieldKeys = ['id', ...Object.keys(itemSchema).sort((a, b) => a.localeCompare(b))];
  const itemFieldsStringified = JSON.stringify(itemFieldKeys);
  for (let i = 0, l = itemFieldKeys.length; i < l; i += 1) {
    const itemFieldKey = itemFieldKeys[i];
    if (itemFieldKey === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const itemFieldType = itemSchema[itemFieldKey];
    if (validItemFieldTypes.includes(itemFieldType) === false) {
      throw Error('table :: transformFunction :: unexpected field type');
    }
  }
  const itemFieldTypes = itemFieldKeys.map((itemFieldKey) => itemSchema[itemFieldKey] || 'string');

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
    validateItem('add', itemFieldKeys, itemFieldTypes, newItem);
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
    validateItem('update', itemFieldKeys, itemFieldTypes, updatedItem);
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
    internalQuerylist = [];
    internalQuerySorts = [];
    internalQueryLimit = Infinity;
    internalQueryOffset = 0;
    internalQueryPage = 0;
    return Query;
  };

  // [x] typechecks?
  // [x] working?
  this[modified] = () => modified;

  // [x] typechecks?
  // [x] working?
  this[stringify] = () => {
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

  const internalSave = list.map(async (table) => {
    if (table[modified] === true) {
      await fs.promises.writeFile(`./tables/${table.label()}.table`, table[stringify]());
      console.log(`${table.label()} : modified`);
      return;
    }
    console.log(`${table.label()} : not modified`);
  });
  let saveInterval;
  let saveSkipNext = false;
  let saveSkips = 0;
  this.save = () => {
    if (saveInterval === undefined) {
      saveInterval = setInterval(async () => {
        if (saveSkipNext === true) {
          saveSkipNext = false;
          if (saveSkips < saveMaxSkips) {
            saveSkips += 1;
          } else {
            saveSkips = 0;
            await internalSave();
            clearInterval(saveInterval);
            saveInterval = undefined;
          }
        } else {
          await internalSave();
          clearInterval(saveInterval);
          saveInterval = undefined;
        }
      }, saveCheckInterval);
    } else {
      saveSkipNext = true;
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
