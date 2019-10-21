/* eslint-disable no-console */

const Database = require('./index');


const db = new Database({
  // saveCompressionAlgo: 'brotli',
  saveCheckInterval: 100,
  saveMaxSkips: 2,
  tableConfigs: [
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


test('table clear', () => {
  const users = db.table('users');
  users.clear();
  expect(users.size()).toBe(0);
  users.add({
    id: users.id(),
    name: 'alice',
    age: 0,
    active: false,
  });
  expect(users.size()).toBe(1);
  users.clear();
  expect(users.size()).toBe(0);
});

test('table random id', () => {
  const users = db.table('users');
  users.clear();
  expect(typeof users.id()).toBe('string');
  expect(users.id().length).toBe(32);
});
