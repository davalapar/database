/* eslint-disable no-console */

const { Table } = require('./index');

const t = new Table({
  label: 'yeh',
  itemSchema: {
    name: 'string',
    age: 'number',
    active: 'boolean',
    strs: 'strings',
    nums: 'numbers',
    bools: 'booleans',
  },
  transformFunction: (item) => ({
    ...item,
    active: item.active || false,
    bools: [],
    nums: [1, 2, 3],
    strs: [],
  }),
});

console.log(t.query().results());

t.clear();

console.log(t.id());

t.add({
  id: t.id(),
  name: 'alice',
  strs: ['yeh', 'fack', 'yehh'],
});

console.log(t.query().results());
