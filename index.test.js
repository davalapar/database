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

t.clear();

t.add({
  id: t.id(),
  name: 'alice',
  strs: ['yeh', 'fack', 'yehh'],
});

test('random id', () => {
  expect(typeof t.id()).toBe('string');
  expect(t.id().length).toBe(32);
});
