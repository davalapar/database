## @davalapar/database






/**
 * Query spec:
 * - should be a functional approach
 * - must not recreate new function instances
 * - instead we just replace the array we are using internally
 * const results = Query
 *  .using(table)
 *  .ascend('property')
 *  .results();
 */
/**
 * - add, increment, decrement, has, delete, get, query
 * - Consistent base types: string, number, boolean
 * - Automatic defaults, string: '', number: 0, boolean: false
 * - Queries are designed to be used synchronously
 * - Queries provide strong consistency
 */

const table = new Table({
  label: 'yeh',
  itemSchema: { name: 'string', age: 'number' },
  initialSaveTimeout: 500,
  transformFunction: (item) => ({
    ...item,
    blocked: undefined, // removes this property
  }),
});

table.clear();
for (let i = 0, l = 1000; i < l; i += 1) {
  table.add({ id: table.id(), age: i });
}

const results = table
  .query()
  .limit(5)
  .results();
console.log(results);