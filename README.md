## @davalapar/database

fast, performant, persistent database.

#### Installation

```sh
yarn add @davalapar/database
```

#### highlights

- supported field types
  - string, number, boolean
  - strings, numbers, booleans
  - coordinates
- items: 128-bit id randomization
- items: forced explicit values
- queries: filter stacking (by multiple comparison operators)
- queries: sort stacking (by multiple columns / fields)
- queries: geolocation sorting & filtering
- database: asynchronous debounced saves
- database: supports compression
- database: tables are saved separately

#### database

```js

const Database = require('@davalapar/database');

const db = new Database({
  // savePrettyJSON: true,
  // saveCompressionAlgo: 'gzip' or 'brotli',
  asyncSaveCheckInterval: 100,
  asyncSaveMaxSkips: 2,
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
```

- `dbOptions`
  - `savePrettyJSON`: optional boolean, prettifies output
  - `saveCompressionAlgo`: optional string, 'gzip' or 'brotli'
  - `asyncSaveCheckInterval`: optional integer, in milliseconds, defaults to `1000`
  - `asyncSaveMaxSkips`: optional integer, defaults to `60`
  - `tableConfigs`: array of `tableConfig`
- `tableConfig`
  - `label`: label of table
  - `itemSchema`: schema of table
  - `transformFunction`: item transform function when you update `itemSchema`
- `new Database(dbOptions) -> database`
- `database.table(label) -> table`
- `database.asyncSave() -> undefined`
- `database.syncSave() -> undefined`

#### table

```js
const users = db.table('users');
```

- `table.label() -> string`
- `table.id() -> string`
- `table.clear() -> table`
- `table.defaults(sourceItem) -> updatedItem`
- `table.add(newItem) -> newItem`
- `table.update(updatedItem) -> updatedItem`
- `table.get(id) -> item`
- `table.delete(id) -> table`
- `table.increment(id, field) -> table`
- `table.decrement(id, field) -> table`
- `table.has(id) -> boolean`
- `table.query() -> query`
- `table.size() -> number`

#### query

```js
const users = db.table('users');
const items = users.query().results();
```

- `query.ascend(field) -> query`
- `query.descend(field) -> query`
- `query.ascend_h(field, coordinates) -> query`
- `query.descend_h(field, coordinates) -> query`
- `query.gt(field, value) -> query`
- `query.gte(field, value) -> query`
- `query.lt(field, value) -> query`
- `query.lte(field, value) -> query`
- `query.eq(field, value) -> query`
- `query.neq(field, value) -> query`
- `query.includes(field, value) -> query`
- `query.excludes(field, value) -> query`
- `query.includes_some(field, values) -> query`
- `query.includes_all(field, values) -> query`
- `query.excludes_some(field, values) -> query`
- `query.excludes_all(field, values) -> query`
- `query.inside_h(field, coordinates, meters) -> query`
- `query.outside_h(field, coordinates, meters) -> query`
- `query.limit(value) -> query`
- `query.offset(value) -> query`
- `query.page(value) -> query`
- `query.select(fields) -> query`
- `query.deselect(fields) -> query`
- `query.results() -> items[]`

#### License

MIT | @davalapar
