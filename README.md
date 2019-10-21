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
- queries: sort stacking
- queries: geolocation sorting & filtering
- database: asynchronous debounced saves
- database: supports compression
- database: tables are saved separately

#### database

```js

const Database = require('@davalapar/database');

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
```

- `databaseOptions.saveCompressionAlgo`: boolean, 'gzip' or 'brotli'
- `databaseOptions.saveCheckInterval`: optional integer, in milliseconds
- `databaseOptions.saveMaxSkips`: optional integer
- `databaseOptions.tableConfigs`: array of tabelConfig
- `tableConfig.label`: label of table
- `tableConfig.itemSchema`: schema of table
- `tableConfig.transformFunction`: transform function for table
- `new Database(databaseOptions) -> database`
- `database.table(label) -> table`

#### table

```js
const users = db.table('users');
```

- `table.label() -> string`
- `table.id() -> string`
- `table.clear() -> table`
- `table.add(newItem) -> newItem`
- `table.update(updatedItem) -> updatedItem`
- `table.get(itemId) -> item`
- `table.delete(itemId) -> table`
- `table.increment(itemId, itemFieldKey) -> table`
- `table.decrement(itemId, itemFieldKey) -> table`
- `table.has(itemId) -> boolean`
- `table.query() -> query`
- `table.size() -> number`

#### query

```js
const users = db.table('users');
const items = users.query().results();
```

- `query.ascend(itemFieldKey) -> query`
- `query.descend(itemFieldKey) -> query`
- `query.ascend_h(itemFieldKey, coordinates) -> query`
- `query.descend_h(itemFieldKey, coordinates) -> query`
- `query.gt(itemFieldKey, value) -> query`
- `query.gte(itemFieldKey, value) -> query`
- `query.lt(itemFieldKey, value) -> query`
- `query.lte(itemFieldKey, value) -> query`
- `query.eq(itemFieldKey, value) -> query`
- `query.neq(itemFieldKey, value) -> query`
- `query.includes(itemFieldKey, value) -> query`
- `query.excludes(itemFieldKey, value) -> query`
- `query.inside_h(itemFieldKey, coordinates, meters) -> query`
- `query.outside_h(itemFieldKey, coordinates, meters) -> query`
- `query.limit(value) -> query`
- `query.offset(value) -> query`
- `query.page(value) -> query`
- `query.results() -> items[]`

#### in progress

- key-value tables
- process clustering
- synchronous saves upon SIGINT

#### License

MIT | @davalapar
