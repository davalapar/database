/* eslint-disable no-console */

const crypto = require('crypto');
const fs = require('fs');
const copy = require('./copy');
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

  // [ ] typechecks?
  // [x] working?
  ascend: (itemFieldKey) => {
    querySorts.push([itemFieldKey, false]);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  descend: (itemFieldKey) => {
    querySorts.push([itemFieldKey, true]);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  ascendh: (itemFieldKey, coordinates) => {
    querySorts.push([itemFieldKey, false, coordinates]);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  descendh: (itemFieldKey, coordinates) => {
    querySorts.push([itemFieldKey, true, coordinates]);
    return Query;
  },

  // FILTERS:

  // [ ] typechecks?
  // [x] working?
  gt: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] > value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  gte: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] >= value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  lt: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] < value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  lte: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] <= value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  eq: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] === value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  neq: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey] !== value);
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  has: (itemFieldKey, value) => {
    queryList = queryList.filter((item) => item[itemFieldKey].includes(value));
    return Query;
  },

  // PAGINATE:

  // [ ] typechecks?
  // [x] working?
  limit: (value) => {
    queryLimit = value;
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  offset: (value) => {
    queryOffset = value;
    return Query;
  },

  // [ ] typechecks?
  // [x] working?
  page: (value) => {
    queryPage = value;
    return Query;
  },
  // results:

  // [ ] typechecks?
  // [ ] working?
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
  const itemFieldsStringified = JSON.stringify(itemFieldKeys);

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
