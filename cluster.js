/* eslint-disable no-console */

const cluster = require('cluster');
const cpusLength = require('os').cpus().length;

/**
 * - IPC (Inter-process Communication) [OK]
 * - SENDING / FORWARDING CHANGE [PENDING]
 * - APPLYING RECEIVED CHANGE [PENDING]
 */

if (cluster.isMaster === true) {
  console.log(`master ${process.pid}`);
  for (let i = 0; i < cpusLength; i += 1) {
    const node = cluster.fork();
    node.on('message', (message) => {
      console.log({
        pid: node.process.pid,
        message,
        end: Date.now(),
      });
    });
  }
}

if (cluster.isMaster === false) {
  console.log(`node ${process.pid}`);
  setInterval(() => {
    process.send({
      rnd: Math.random(),
      start: Date.now(),
    });
  }, 1000);
  module.exports = { };
}
