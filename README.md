## @davalapar/database

Fast, performant, persistent database.

#### Usage notes

```sh
yarn add @davalapar/database
```

- Tables
  - Designed to be used synchronously
  - Internal variables are hidden / inaccessible
- Database file
  - Has `*-old.db`, `*-temp.db`, `*.main.db` files
  - Encodes with `JSON.stringify` & `zlib.gzip`
  - Decodes with `zlib.gunzip` & `JSON.parse`
- Queries
  - Designed to be used synchronously
  - Provides strong consistency

#### Table

```js
const t = new Table({
  label: 'yeh',
  itemSchema: {
    name: 'string',
    age: 'number',
    // active: 'boolean',
  },
  initialSaveTimeout: 5000, // defaults to 5k / 5 seconds
  forcedSaveTimeout: 300000, // defaults to 300k / 5 minutes
  transformFunction: (item) => ({
    ...item,
    active: undefined, // removes this property
  }),
}); // returns <Table>

t.id(); // returns <String>

t.clear(); // returns <Table>

t.add({
  id: t.id(),
  name: 'alice',
}); // returns <Table>

t.update({
  id: 'id-of-alice',
  name: 'alice',
  age: 23,
}); // returns <Table>

t.get('id-of-alice'); // returns <Object>

t.delete('id-of-alice'); // returns <Table>

t.increment('id-of-alice', 'age'); // returns <Table>

t.decrement('id-of-alice', 'age'); // returns <Table>

t.has('id-of-alice'); // returns <Boolean>
```

#### Query

```js
const q = t.query(); // returns <Object>

// Sorts
q.ascend('age'); // returns <Object>
q.descend('age'); // returns <Object>

// Filters
q.gt('age', 5); // returns <Object>
q.gte('age', 5); // returns <Object> 
q.lt('age', 5); // returns <Object> 
q.lte('age', 5); // returns <Object>
q.eq('age', 5); // returns <Object>
q.neq('age', 5); // returns <Object>

// Paginate
q.limit(5); // returns <Object>
q.offset(5); // returns <Object>
q.page(5); // returns <Object>

// Results
q.results(); // returns <Array>

```

#### License

MIT | @davalapar
