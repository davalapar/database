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
  ascend: () => {},
  descend: () => {},
  // filters:
  gt: () => {},
  gte: () => {},
  lt: () => {},
  lte: () => {},
  eq: () => {},
  neq: () => {},
  has: () => {},
  // paginate:
  limit: () => {},
  offset: () => {},
  page: () => {},
  // results:
  results: () => {},
};

const stringify = Symbol('stringify');

function Table(tableOptions, database) {
  const {
    label,
    listchema,
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
  // [ ] working?
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
  // [ ] working?
  this.increment = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] += 1;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [ ] working?
  this.decrement = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] -= 1;
    modified = true;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [ ] working?
  this.has = (itemId) => dictionary[itemId] !== undefined;

  // [ ] typechecks?
  // [ ] working?
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
    initialSaveTimeout,
    forcedSaveTimeout,
  } = databaseOptions;
  const list = [];
  const dictionary = {};
  for (let i = 0, l = tableSchemas.length; i < l; i += 1) {
    const table = new Table(tableSchemas[i], this);
    list[i] = table;
    dictionary[table.label()] = table;
  }
  const internalSave = async () => {
    await list.map(async (table) => {
      if (table.modified() === true) {
        await fs.promises.writeFile(`./tables/${table.label().table}`, table[stringify]());
      }
    });
  };
  this.table = (label) => dictionary[label];
  // use skip counter instead of forced timeout
  // use internal interval instead of internal timeouts

  let saveTimeout;
  let skipNextSave = false;
  let skips = 0;
  this.save = () => {
    if (saveTimeout === undefined) { // if timeout does not exist, create it
      saveTimeout = setTimeout(() => {
        saveTimeout = undefined; // if this timeout hits, we reset that var
        if (skipNextSave === true) { // if next saved is skipped
          skipNextSave = false; // we reset that var first
          if (skips < 60) { // we check if we have already skipped 59 times
            skips += 1; // if not, we increment a counter
            this.save(); // we re-create the timeout
          } else {
            skips = 0; // we reset the counter
            internalSave(); // we save changes
          }
        } else { // if next save is not skipped
          internalSave(); // we save changes
        }
      }, 1000);
    } else { // if timeout exists, we try to skip next save
      skipNextSave = true;
    }
  };
}

const db = new Database({
  initialSaveTimeout: 5000,
  forcedSaveTimeout: 300000,
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
