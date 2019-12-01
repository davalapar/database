## @davalapar/database

efficient, synchronous, prototyping database

#### highlights

- supported field types:
  - string, number, boolean
  - strings, numbers, booleans
  - coordinates
- database:
  - pretty json support
  - compression support
  - graceful interrupt support
  - graceful terminate support
  - only saves modified tables
- tables:
  - saved separately
  - item update helper function for schema updates
  - item id randomization helper (256-bit default)
- table items:
  - forced explicit property values by default
  - optional implicit default values property values
- table queries:
  - filter stacking (by multiple comparison operators)
  - sort stacking (by multiple columns / fields)
  - geolocation sorting & filtering

#### changelog

- 1.1.0
  - updated `table.id(bytes)` into `table.id(bits)` method
  - renamed `database.save()` to `database.commit()`
  - added `database.rollback()`
- 1.0.0
  - clean api
  - fully synchronous
  - stable release

#### installation

```sh
yarn add @davalapar/database
```

#### database

```js

const Database = require('@davalapar/database');

const db = new Database({
  // savePrettyJSON: true,
  // saveCompressionAlgo: 'gzip' or 'brotli',
  saveGracefulInterrupt: true,
  saveGracefulTerminate: true,
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

- `new Database(dbOptions) -> database`
- `database.table(label) -> table`
- `database.rollback() -> undefined`
- `database.commit() -> undefined`
- `dbOptions` : Object
  - `preferDevUrandom`: optional Boolean, generates id's from `/dev/urandom` if possible
  - `savePrettyJSON`: optional Boolean, prettifies output
  - `saveCompressionAlgo`: optional String, 'gzip' or 'brotli'
  - `saveGracefulInterrupt`: optional Boolean, saves gracefully upon `SIGINT`
  - `saveGracefulTerminate`: optional Boolean, saves gracefully upon `SIGTERM`
  - `tableConfigs` : required Array of `tableConfig`
- `tableConfig`: Object
  - `label` : required String, label of table
  - `itemSchema` : required Object, schema of items
  - `transformFunction` : optional Function, updater for items when `itemSchema` is updated

#### table

```js
const users = db.table('users');
```

- `table.label() -> string`
- `table.id(bits=256) -> string`
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

#### query tricks

```js
// extracting first result:
YourTable.query().results()[0];

// extracting results count:
YourTable.query().results().length;

// extracting if results exist:
YourTable.query().results().length < 0;

// other array methods you can use:
// filter, sort, map, reduce, forEach, some, every, find
```

#### License

MIT | @davalapar
