/* eslint-disable no-console */

const fs = require('fs');
const crypto = require('crypto');

// 1 byte, 0=json-stringify-parse, 1=cbor-encode-decode, max: (2 ** 8) - 1
const serialization = Buffer.alloc(1);
serialization.writeUInt8(0);

// 1 byte, 0=none, 1=gzip, 2=brotli, max: (2 ** 8) - 1
const compression = Buffer.alloc(1);
compression.writeUInt8(0);

// 1 byte, 0=none, 1=xsalsa20-poly1305, max: (2 ** 8) - 1
const encryption = Buffer.alloc(1);
encryption.writeUInt8(0);

// 1 byte, 0=sha256, 1=sha512-256, max: (2 ** 8) - 1
const hash = Buffer.alloc(1);
hash.writeUInt8(0);

// 1 byte, 0=random, 1=counter, max: (2 ** 8) - 1
const id = Buffer.alloc(1);
id.writeUInt8(0);

// 4 bytes, max: (2 ** 32) - 1
const counter = Buffer.alloc(4);
counter.writeUInt32BE(0);

// n bytes, max byte length: (2 ** 16) - 1
const label = Buffer.from('yeh');

// 2 bytes, max: (2 ** 16) - 1
const labelByteLength = Buffer.alloc(2);
labelByteLength.writeUInt16BE(label.byteLength);

// 32 bytes, or 64 bytes
const schema = crypto.createHash('sha256').digest();

// n bytes
const items = Buffer.from(JSON.stringify(['']));

const buffer = Buffer.concat([
  labelByteLength,
  label,
  serialization,
  compression,
  encryption,
  hash,
  id,
  counter,
  schema,
  items,
]);

console.log({ label });

console.log({ buffer });
