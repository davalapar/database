/* eslint-disable no-console */

const fs = require('fs');
const crypto = require('crypto');

// 1 byte, 0=json-stringify-parse, 1=cbor-encode-decode
const serialization = Buffer.alloc(1);
serialization.writeUInt8(255);

// 1 byte, 0=none, 1=gzip, 2=brotli
const compression = Buffer.alloc(1);
compression.writeUInt8(255);

// 1 byte, 0=none, 1=xsalsa20-poly1305
const encryption = Buffer.alloc(1);
encryption.writeUInt8(255);

// 1 byte, 0=sha256, 1=sha512-256
const hash = Buffer.alloc(1);
hash.writeUInt8(255);

// 1 byte, 0=random, 1=counter
const id = Buffer.alloc(1);
id.writeUInt8(255);

// 4 bytes
const counter = Buffer.alloc(4);
counter.writeUInt32BE((2 ** 32) - 1);

// 32 bytes
const schema = crypto.createHash('sha256').digest();

// n bytes
const items = Buffer.from(JSON.stringify([]));

const buffer = Buffer.concat([
  serialization,
  compression,
  encryption,
  hash,
  id,
  counter,
  schema,
  items,
]);

console.log({ buffer });
