/* eslint-disable no-console */

const cluster = require('cluster');

function MainDatabase() {

}
function WorkerDatabase() {

}

if (cluster.isMaster === true) {
  const Database = MainDatabase;
  module.exports = { Database };
  const db = new Database();
} else {
  const Database = WorkerDatabase;
  module.exports = { Database };
  const db = new Database();
}
(async () => {
  const { Database } = module.exports;
  if (cluster.isMaster === true) {
    // main thread
  } else {
    // worker thread
  }
})();
