/* eslint-disable no-console */

const cluster = require('cluster');
const os = require('os');

const database = (workerFn) => {
  // MASTER:
  if (cluster.isMaster === true) {
    console.log(`Master ${process.pid} :: Started.`);
    const cpusLength = os.cpus().length;
    const workers = new Array(cpusLength);
    const others = []; // other workers
    for (let i = 0; i < cpusLength; i += 1) {
      const worker = cluster.fork();
      workers[i] = worker;
      worker.on('message', (message) => {
        console.log({ message });
        if (
          Array.isArray(message) === true
          && typeof message[0] === 'number'
          && Number.isNaN(message[0]) === false
          && Number.isFinite(message[0]) === true
          && typeof message[1] === 'string'
        ) {
          const [reqNum, fnName] = message;
          switch (fnName) {
            default: {
              worker.send([reqNum, null]);
              break;
            }
          }
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
    console.log({ message });
    if (
      Array.isArray(message) === true
      && typeof message[0] === 'number'
      && Number.isNaN(message[0]) === false
      && Number.isFinite(message[0]) === true
      && (message[1] === null || typeof message[1] === 'string')
    ) {
      const [reqNum, error, ...params] = message;
      const [resolve, reject] = requests[reqNum];
      if (error !== null) {
        reject(error);
      } else {
        resolve(...params);
      }
      delete requests[reqNum];
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
