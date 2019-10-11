/* eslint-disable no-console */

const cluster = require('cluster');
const os = require('os');

/**
 * Pointers:
 * - Uses worker processes to increase throughput
 * - Reads are served within worker processes
 * - Writes are propagated through master process
 * - Type-checks are done locally,
 *   and forwarded updates are fire-and-forget,
 *   meaning we don't check anymore if we encounter conflicts,
 *   we just assume they would work gracefully synchronously
 * Flow:
 * - Worker process applies changes to local copy
 * - Worker process forwards to master process
 * - Master process forwards to child processes
 * - Worker processes applies changes to their copy
 * - Master process initiates save
 * Table functions:
 * - id: locally
 * - clear: locally, forwarded
 * - add: locally, forwarded
 * - update: locally, forwarded
 * - get: locally
 * - delete: locally, forwarded
 * - increment: locally, forwarded
 * - decrement: locally, forwarded
 * - has: locally
 * Query functions: locally
 */

const database = (workerFn) => {
  // MASTER:
  if (cluster.isMaster === true) {
    console.log(`Master ${process.pid} :: Started.`);
    const cpusLength = 2 || os.cpus().length;
    const workers = new Array(cpusLength);
    const others = []; // other workers
    for (let i = 0; i < cpusLength; i += 1) {
      const worker = cluster.fork();
      workers[i] = worker;
      worker.on('message', (message) => {
        if (Array.isArray(message) === true && typeof message[0] === 'number' && Number.isNaN(message[0]) === false && Number.isFinite(message[0]) === true) {
          const [reqNum, fnName, ...params] = message;
          switch (fnName) {
            default: {
              worker.send([reqNum, null]);
              break;
            }
          }
          others[i].forEach((w) => w.send([-reqNum, fnName, ...params]));
        }
      });
    }
    for (let i = 0; i < cpusLength; i += 1) {
      others[i] = workers.filter((value, index) => index !== i);
    }
    return workers;
  }

  // WORKER:
  console.log(`Worker ${process.pid} :: Started.`);
  const requests = {};
  process.on('message', (message) => {
    if (Array.isArray(message) === true && typeof message[0] === 'number' && Number.isNaN(message[0]) === false && Number.isFinite(message[0]) === true) {
      if (message[0] > 0) { // response
        const [reqNum, error, ...params] = message;
        const [resolve, reject] = requests[reqNum];
        if (error !== null) {
          reject(error);
        } else {
          resolve(...params);
        }
        delete requests[reqNum];
      } else if (message[0] < 0) { // forwarded
        // console.log(process.pid, 'forwarded received');
      }
    }
  });
  let lastServed = 0;
  const db = {
    table: (label) => new Promise((resolve, reject) => {
      if (typeof label !== 'string' || label === '') {
        throw Error('db.table :: "label" must be a non-empty string.');
      }
      lastServed += 1;
      const reqNum = lastServed;
      process.send([reqNum, 'db.table', label]);
      requests[reqNum] = [resolve, reject];
    }),
  };
  workerFn(db);
  return undefined;
};

database(async (db) => {
  await db.table('yeh');
});
