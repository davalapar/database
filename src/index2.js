
const crypto = require('crypto');

const copyObject = require('./copyObject');

let internalQuerylist = [];
let internalQuerySorts = [];
let internalQueryLimit = Infinity;
let internalQueryOffset = 0;
let internalQueryPage = 0;

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

function Table(tableOptions, database) {
  const {
    label,
    listchema,
    transformFunction,
  } = tableOptions;

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
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.add = (newItem) => {
    const { id } = newItem;
    const duplicateItem = copyObject(newItem);
    list.push(duplicateItem);
    dictionary[id] = duplicateItem;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [x] working?
  this.update = (updatedItem) => {
    const { id } = updatedItem;
    const existingItem = dictionary[id];
    const existingItemIndex = list.indexOf(existingItem);
    const duplicateItem = copyObject(updatedItem);
    list[existingItemIndex] = duplicateItem;
    dictionary[id] = duplicateItem;
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
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [ ] working?
  this.increment = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] += 1;
    database.save();
    return this;
  };

  // [ ] typechecks?
  // [ ] working?
  this.decrement = (itemId, itemField) => {
    const existingItem = dictionary[itemId];
    existingItem[itemField] -= 1;
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
}

function Database(databaseOptions) {
  const {
    tableSchemas,
    initialSaveTimeout,
    forcedSaveTimeout,
  } = databaseOptions;
  const dictionary = {};
  for (let i = 0, l = tableSchemas.length; i < l; i += 1) {
    const table = new Table(tableSchemas[i], this);
    dictionary[table.label()] = table;
  }
  this.table = (label) => dictionary[label];
  this.save = () => {};
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
