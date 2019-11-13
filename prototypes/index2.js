/* eslint-disable no-console */

const cluster = require('cluster');

function MainDatabase() {

}
function WorkerDatabase() {

}

if (cluster.isMaster === true) {
  module.exports = { Database: MainDatabase };
} else {
  module.exports = { Database: WorkerDatabase };
}
