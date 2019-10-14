
const crypto = require('crypto');

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

function Table(tableOptions) {
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
  // [ ] working?
  this.add = (newItem) => {
    list.push(newItem);
    listIndex[newItem.id] = list.length - 1;
    dictionary[newItem.id] = newItem;
    return this;
  };
  this.update = (updatedItem) => {
    const existingItem = dictionary[updatedItem.id];
    const index = list.indexOf(existingItem);
    list[index] = updatedItem;
  };
  this.get = (itemId) => dictionary[itemId];
  this.delete = (itemId) => {
    const index = list.indexOf(itemId);
    list.splice();
  };
  this.increment = () => {};
  this.decrement = () => {};
  this.has = () => {};
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
