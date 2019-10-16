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
  // sorts:
  ascend: (itemField) => {},
  descend: (itemField) => {},
  ascendh: (itemField, coordinates) => {},
  descendh: (itemField, coordinates) => {},
  // filters:
  gt: (itemField, value) => {},
  gte: (itemField, value) => {},
  lt: (itemField, value) => {},
  lte: (itemField, value) => {},
  eq: (itemField, value) => {},
  neq: (itemField, value) => {},
  has: (itemField, value) => {},
  // paginate:
  limit: (value) => {},
  offset: (value) => {},
  page: (value) => {},
  // results:
  results: () => {},
};

const stringify = Symbol('stringify');

function Table(tableOptions, database) {
  const {
    label,
    itemSchema,
    transformFunction,
  } = tableOptions;

  let modified = false;
  let list = [];
  let dictionary = {};

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
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.add = (newItem) => {
    const { id } = newItem;
    const duplicateItem = copy(newItem);
    list.push(duplicateItem);
    dictionary[id] = duplicateItem;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.update = (updatedItem) => {
    const { id } = updatedItem;
    const existingItem = dictionary[id];
    const existingItemIndex = list.indexOf(existingItem);
    const duplicateItem = copy(updatedItem);
    list[existingItemIndex] = duplicateItem;
    dictionary[id] = duplicateItem;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.get = (itemId) => dictionary[itemId];

  // [ ] typechecks?
  // [x] working?
  this.delete = (itemId) => {
    const existingItem = dictionary[itemId];
    const existingItemIndex = list.indexOf(existingItem);
    list.splice(existingItemIndex, 1);
    delete dictionary[itemId];
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.increment = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] += 1;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.decrement = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] -= 1;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.has = (itemId) => dictionary[itemId] !== undefined;

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
  this.modified = () => modified;

  // [x] typechecks?
  // [x] working?
  this[stringify] = () => {
    modified = false;
    JSON.stringify(list);
  };
}

function Database(databaseOptions) {
  const {
    tableSchemas,
    saveCheckInterval,
    saveMaxSkips,
  } = databaseOptions;
  const list = [];
  const dictionary = {};
  for (let i = 0, l = tableSchemas.length; i < l; i += 1) {
    const table = new Table(tableSchemas[i], this);
    list[i] = table;
    dictionary[table.label()] = table;
  }

  // [ ] typechecks?
  // [x] working?
  this.table = (label) => dictionary[label];

  const internalSave = list.map(async (table) => {
    if (table.modified() === true) {
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
      saveInterval = setInterval(() => {
        if (saveSkipNext === true) {
          saveSkipNext = false;
          if (saveSkips < saveMaxSkips) {
            saveSkips += 1;
          } else {
            saveSkips = 0;
            internalSave();
            clearInterval(saveInterval);
            saveInterval = undefined;
          }
        } else {
          internalSave();
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
  tableSchemas: [
    {
      label: 'users',
      listchema: {
        name: 'string',
        age: 'number',
        active: 'boolean',
      },
      transformFunction: () => {},
    },
  ],
});

const users = db.table('users');
