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

beforeAll(() => {
  const users = db.table('users');
  users.clear();
});

test('table: random id', () => {
  const users = db.table('users');
  expect(typeof users.id()).toBe('string');
  expect(users.id().length).toBe(32);
});

test('table: add', () => {
  const users = db.table('users');
  expect(users.size()).toBe(0);
  const alice = users.add({
    id: 'alice-id',
    name: 'alice',
    age: 0,
    active: false,
  });
  expect(alice.name).toBe('alice');
  expect(alice.age).toBe(0);
  expect(alice.active).toBe(false);
  expect(users.size()).toBe(1);
  const bob = users.add({
    id: 'bob-id',
    name: 'bob',
    age: 1,
    active: true,
  });
  expect(bob.name).toBe('bob');
  expect(bob.age).toBe(1);
  expect(bob.active).toBe(true);
  expect(users.size()).toBe(2);
});

test('table: get, update', () => {
  const users = db.table('users');
  const bob1 = users.get('bob-id');
  expect(bob1.name).toBe('bob');
  expect(bob1.age).toBe(1);
  expect(bob1.active).toBe(true);
  bob1.age = 2;
  const bob2 = users.update(bob1);
  expect(bob2.name).toBe('bob');
  expect(bob2.age).toBe(2);
  expect(bob2.active).toBe(true);
});

test('table: delete', () => {
  const users = db.table('users');
  users.delete('bob-id');
  expect(users.size()).toBe(1);
});

test('table: increment', () => {
  const users = db.table('users');
  users.increment('alice-id', 'age');
  const alice = users.get('alice-id');
  expect(alice.age).toBe(1);
});

test('table: decrement', () => {
  const users = db.table('users');
  users.decrement('alice-id', 'age');
  const alice = users.get('alice-id');
  expect(alice.age).toBe(0);
});

test('table: has', () => {
  const users = db.table('users');
  expect(users.has('alice-id')).toBe(true);
  expect(users.has('bob-id')).toBe(false);
});

test('table: clear, size', () => {
  const users = db.table('users');
  expect(users.size()).toBe(1);
  users.clear();
  expect(users.size()).toBe(0);
});

afterAll(() => {
  const users = db.table('users');
  users.clear();
});
