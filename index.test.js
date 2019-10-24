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
    {
      label: 'places',
      itemSchema: {
        label: 'string',
        tags: 'strings',
        coordinates: 'coordinates',
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

test('query: results', () => {
  const users = db.table('users');
  users.add({
    id: 'alice-id',
    name: 'alice',
    age: 0,
    active: false,
  });
  users.add({
    id: 'bob-id',
    name: 'bob',
    age: 1,
    active: false,
  });
  users.add({
    id: 'cathy-id',
    name: 'cathy',
    age: 2,
    active: true,
  });
  users.add({
    id: 'erica-id',
    name: 'erica',
    age: 3,
    active: true,
  });
  users.add({
    id: 'fiona-id',
    name: 'fiona',
    age: 4,
    active: true,
  });
  expect(users.size()).toBe(5);
  expect(users.query().results().length).toBe(5);
});

test('query: filter gt', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .gt('age', 1)
    .results();
  expect(results.length).toBe(3);
});

test('query: filter gte', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .gte('age', 1)
    .results();
  expect(results.length).toBe(4);
});

test('query: filter lt', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .lt('age', 1)
    .results();
  expect(results.length).toBe(1);
});

test('query: filter lte', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .lte('age', 1)
    .results();
  expect(results.length).toBe(2);
});

test('query: filter eq number', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .eq('age', 0)
    .results();
  expect(results.length).toBe(1);
});

test('query: filter neq number', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .neq('age', 0)
    .results();
  expect(results.length).toBe(4);
});

test('query: filter eq string', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .eq('name', 'alice')
    .results();
  expect(results.length).toBe(1);
});

test('query: filter neq string', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .neq('name', 'alice')
    .results();
  expect(results.length).toBe(4);
});

test('query: filter eq boolean', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .eq('active', true)
    .results();
  expect(results.length).toBe(3);
});

test('query: filter neq boolean', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .neq('active', true)
    .results();
  expect(results.length).toBe(2);
});

test('query: sort ascend string', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .ascend('name')
    .results();
  expect(results.length).toBe(5);
  expect(results[0].name).toBe('alice');
  expect(results[1].name).toBe('bob');
  expect(results[2].name).toBe('cathy');
  expect(results[3].name).toBe('erica');
  expect(results[4].name).toBe('fiona');
});

test('query: sort descend string', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .descend('name')
    .results();
  expect(results.length).toBe(5);
  expect(results[0].name).toBe('fiona');
  expect(results[1].name).toBe('erica');
  expect(results[2].name).toBe('cathy');
  expect(results[3].name).toBe('bob');
  expect(results[4].name).toBe('alice');
});

test('query: sort ascend number', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .ascend('age')
    .results();
  expect(results.length).toBe(5);
  expect(results[0].name).toBe('alice');
  expect(results[1].name).toBe('bob');
  expect(results[2].name).toBe('cathy');
  expect(results[3].name).toBe('erica');
  expect(results[4].name).toBe('fiona');
});

test('query: sort descend number', () => {
  const users = db.table('users');
  expect(users.size()).toBe(5);
  const results = users.query()
    .descend('age')
    .results();
  expect(results.length).toBe(5);
  expect(results[0].name).toBe('fiona');
  expect(results[1].name).toBe('erica');
  expect(results[2].name).toBe('cathy');
  expect(results[3].name).toBe('bob');
  expect(results[4].name).toBe('alice');
});

test('table: setup strings, coordinates', () => {
  const places = db.table('places');
  places.clear();
  expect(places.size()).toBe(0);
  places.add({
    id: 'rizal-park-id',
    label: 'rizal park',
    tags: ['park'],
    coordinates: [14.5831, 120.9794],
  });
  places.add({
    id: 'ayala-triangle-gardens-id',
    label: 'ayala triangle gardens',
    tags: ['park'],
    coordinates: [14.5571, 121.0230],
  });
  places.add({
    id: 'sm-novaliches-id',
    label: 'sm novaliches',
    tags: ['mall'],
    coordinates: [14.7082, 121.0374],
  });
  places.add({
    id: 'greenbelt-1-id',
    label: 'greenbelt 1',
    tags: ['mall'],
    coordinates: [14.55452, 121.0204692],
  });
  expect(places.size()).toBe(4);
});

test('query: filter includes', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .includes('tags', 'mall')
    .results();
  expect(results.length).toBe(2);
});

test('query: filter excludes', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .excludes('tags', 'mall')
    .results();
  expect(results.length).toBe(2);
});

const makatiAveCorAyalaAve = [14.5546474, 121.0245846];

test('query: filter inside_h', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .inside_h('coordinates', makatiAveCorAyalaAve, 2000)
    .results();
  expect(results.length).toBe(2);
});

test('query: filter outside_h', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .outside_h('coordinates', makatiAveCorAyalaAve, 2000)
    .results();
  expect(results.length).toBe(2);
});

test('query: sort ascend_h', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .ascend_h('coordinates', makatiAveCorAyalaAve)
    .results();
  expect(results.length).toBe(4);
  expect(results[0].id).toBe('ayala-triangle-gardens-id');
  expect(results[1].id).toBe('greenbelt-1-id');
  expect(results[2].id).toBe('rizal-park-id');
  expect(results[3].id).toBe('sm-novaliches-id');
});

test('query: sort descend_h', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .descend_h('coordinates', makatiAveCorAyalaAve)
    .results();
  expect(results.length).toBe(4);
  expect(results[0].id).toBe('sm-novaliches-id');
  expect(results[1].id).toBe('rizal-park-id');
  expect(results[2].id).toBe('greenbelt-1-id');
  expect(results[3].id).toBe('ayala-triangle-gardens-id');
});

test('query: filter includes_some', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .includes_some('tags', ['mall'])
    .results();
  expect(results.length).toBe(2);
});

test('query: filter includes_all', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .includes_all('tags', ['mall'])
    .results();
  expect(results.length).toBe(2);
});

test('query: filter excludes_some', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .excludes_some('tags', ['mall'])
    .results();
  expect(results.length).toBe(2);
});

test('query: filter excludes_all', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .excludes_all('tags', ['mall'])
    .results();
  expect(results.length).toBe(2);
});
test('query: select fields', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .select(['label', 'tags'])
    .results();
  expect(results[0].coordinates).toBe(undefined);
  expect(results.length).toBe(4);
});
test('query: deselect fields', () => {
  const places = db.table('places');
  expect(places.size()).toBe(4);
  const results = places.query()
    .deselect(['label', 'tags'])
    .results();
  expect(results[0].label).toBe(undefined);
  expect(results[0].tags).toBe(undefined);
  expect(results.length).toBe(4);
});

afterAll(() => {
  const users = db.table('users');
  users.clear();
});
