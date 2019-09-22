/* eslint-disable no-console, no-continue */

const zlib = require('zlib');
const crypto = require('crypto');
const fs = require('fs');

const acceptedItemPropertyTypes = ['boolean', 'number', 'string'];

const isValidObject = (value) => {
  if (typeof value !== 'object') {
    return false;
  }
  if (value === null) {
    return false;
  }
  return true;
};

const isValidNonEmptyString = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  if (value === '') {
    return false;
  }
  return true;
};

const isValidNumber = (value) => {
  if (typeof value !== 'number') {
    return false;
  }
  if (Number.isNaN(value) === true) {
    return false;
  }
  if (Number.isFinite(value) === false) {
    return false;
  }
  return true;
};

const isValidInteger = (value) => {
  if (isValidNumber(value) === false) {
    return false;
  }
  if (Math.floor(value) !== value) {
    return false;
  }
  return true;
};

let internalQueryDataList;
let internalQueryItemPropertyDictionary;
let internalQueryItemPropertyTypeDictionary;
let internalQueryPropertyList;
let internalQueryLimit = Infinity;
let internalQueryOffset = 0;
let internalQueryPage = 0;
let internalQuerySorts = [];

const Query = {

  // SORTS
  ascend: (itemProperty) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('ascend :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`ascend :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number' && internalQueryItemPropertyTypeDictionary[itemProperty] !== 'string') {
      throw Error(`ascend :: unexpected "${itemProperty}", expecting property with "number, string" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    internalQuerySorts.push([itemProperty, false]);
    return Query;
  },
  descend: (itemProperty) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('descend :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`descend :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number' && internalQueryItemPropertyTypeDictionary[itemProperty] !== 'string') {
      throw Error(`descend :: unexpected "${itemProperty}", expecting property with "number, string" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    internalQuerySorts.push([itemProperty, true]);
    return Query;
  },

  // FILTERS
  gt: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('gt :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('gt :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`gt :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`gt :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] > value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  gte: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('gte :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('gte :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`gte :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`gte :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] >= value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  lt: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('lt :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('lt :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`lt :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`lt :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] < value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  lte: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('lte :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('lte :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`lte :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`lte :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[itemProperty]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] <= value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  eq: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('eq :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('eq :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`eq :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] === value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  neq: (itemProperty, value) => {
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('neq :: 1st parameter "itemProperty" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('neq :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(itemProperty) === false) {
      throw Error(`neq :: unexpected property "${itemProperty}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] !== value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },

  // PAGINATION
  limit: (value) => {
    if (isValidInteger(value) === false || value <= 0) {
      throw Error('limit :: expecting "value" to be a valid integer greater than zero');
    }
    internalQueryLimit = value;
    return Query;
  },
  offset: (value) => {
    if (internalQueryPage !== 0) {
      throw Error('page :: cannot use offset() with page()');
    }
    if (isValidInteger(value) === false || value <= 0) {
      throw Error('offset :: expecting "value" to be a valid integer greater than zero');
    }
    internalQueryOffset = value;
    return Query;
  },
  page: (value) => {
    if (Number.isFinite(internalQueryLimit) === false) {
      throw Error('page :: limit() must be called first before offset');
    }
    if (internalQueryOffset !== 0) {
      throw Error('page :: cannot use page() with offset()');
    }
    if (isValidInteger(value) === false || value <= 0) {
      throw Error('page :: expecting "value" to be a valid integer greater than zero');
    }
    internalQueryPage = value;
    return Query;
  },

  // RESULTS
  results: () => {
    // apply sorts and filters
    if (internalQuerySorts.length > 0) {
      internalQueryDataList.sort((a, b) => {
        for (let i = 0, l = internalQuerySorts.length; i < l; i += 1) {
          const [itemProperty, shouldDescend] = internalQuerySorts[i];
          const itemPropertyIndex = internalQueryItemPropertyDictionary[itemProperty];
          const itemPropertyType = internalQueryItemPropertyTypeDictionary[itemProperty];
          if (a[itemPropertyIndex] === b[itemPropertyIndex]) { // If value of both slicedItems are equal: SKIP SORT
            continue;
          } else if (itemPropertyType === 'string') {
            return shouldDescend ? b[itemPropertyIndex].localeCompare(a[itemPropertyIndex]) : a[itemPropertyIndex].localeCompare(b[itemPropertyIndex]);
          } else if (itemPropertyType === 'number') {
            return shouldDescend ? b[itemPropertyIndex] - a[itemPropertyIndex] : a[itemPropertyIndex] - b[itemPropertyIndex];
          }
        }
        return 0;
      });
    }

    // apply pagination
    if (internalQueryOffset > 0) {
      internalQueryDataList = internalQueryDataList.slice(internalQueryOffset, internalQueryOffset + internalQueryLimit);
    } else if (internalQueryPage > 0) {
      internalQueryDataList = internalQueryDataList.slice(internalQueryLimit * (internalQueryPage - 1), (internalQueryLimit * (internalQueryPage - 1)) + internalQueryLimit);
    } else {
      internalQueryDataList = internalQueryDataList.slice(0, internalQueryLimit);
    }

    // hydrate and return
    const hydratedItems = internalQueryDataList.map((existingItemRecord) => {
      const tempItemRecord = {};
      for (let i = 0, l = internalQueryPropertyList.length; i < l; i += 1) {
        tempItemRecord[internalQueryPropertyList[i]] = existingItemRecord[i];
      }
      return tempItemRecord;
    });
    return hydratedItems;
  },
};

const encode = (decoded) => zlib.gzipSync(JSON.stringify(decoded));
const decode = (encoded) => JSON.parse(zlib.gunzipSync(encoded));

function Table(options) {
  if (isValidObject(options) === false) {
    throw Error('new Table :: 1st parameter "options" must be a plain object.');
  }
  const {
    label,
    itemSchema,
    initialSaveTimeout,
    forcedSaveTimeout,
    transformFunction,
  } = options;
  // PARAMETER TYPE CHECKS
  if (isValidNonEmptyString(label) === false) {
    throw Error('new Table :: "options.label" must be a non-empty string.');
  }
  if (isValidObject(itemSchema) === false) {
    throw Error('new Table :: "options.itemSchema" must be a plain object.');
  }
  if (itemSchema.id !== undefined) {
    throw Error('new Table :: "id" property in "options.itemSchema" must be undefined.');
  }
  if (initialSaveTimeout !== undefined && isValidInteger(initialSaveTimeout) === false) {
    throw Error('new Table :: "options.initialSaveTimeout" must be an integer.');
  }
  if (forcedSaveTimeout !== undefined && isValidInteger(forcedSaveTimeout) === false) {
    throw Error('new Table :: "options.forcedSaveTimeout" must be an integer.');
  }
  if (transformFunction !== undefined && typeof transformFunction !== 'function') {
    throw Error('new Table :: "options.transformFunction" must be a function.');
  }

  // INTERNAL VARIABLES
  const internalOldPath = `./tables/${label}-old.db`;
  const internalTempPath = `./tables/${label}-temp.db`;
  const internalMainPath = `./tables/${label}-main.db`;
  const internalInitialSaveTimeout = initialSaveTimeout || 5000;
  const internalForcedSaveTimeout = forcedSaveTimeout || 300000;
  let internalDataList = [];
  let internalDataDictionary = {};
  const internalItemPropertyList = ['id', ...Object.keys(itemSchema).sort((a, b) => a.localeCompare(b))];
  const internalItemPropertyListStringified = JSON.stringify(internalItemPropertyList);
  const internalItemPropertyDictionary = { id: 0 };
  const internalItemPropertyTypeList = ['string'];
  const internalItemPropertyTypeDictionary = { id: 'string' };
  for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
    const itemProperty = internalItemPropertyList[i];
    if (itemProperty === 'id') {
      continue;
    }
    const itemPropertyType = itemSchema[itemProperty];
    if (acceptedItemPropertyTypes.includes(itemPropertyType) === false) {
      throw Error(`new Table :: Unexpected "${itemPropertyType}" type for "${itemProperty}" property, expecting "${acceptedItemPropertyTypes.join(', ')}"`);
    }
    internalItemPropertyDictionary[itemProperty] = i;
    internalItemPropertyTypeList[i] = itemPropertyType;
    internalItemPropertyTypeDictionary[itemProperty] = itemPropertyType;
  }

  const itemRecordFromSource = (itemSource, externalMethod) => {
    if (isValidNonEmptyString(externalMethod) === false) {
      throw Error('internal :: "externalMethod" must be a non-empty string.');
    }
    if (isValidObject(itemSource) === false) {
      throw Error(`${externalMethod} :: "itemSource" must be a plain object.`);
    }
    const itemSourceKeys = Object.keys(itemSource);
    const itemRecord = new Array(internalItemPropertyList.length);
    for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
      const itemProperty = internalItemPropertyList[i];
      const itemPropertyType = internalItemPropertyTypeList[i];
      const itemSourcePropertyValue = itemSource[itemProperty];
      switch (itemPropertyType) {
        case 'number': {
          if (itemSourcePropertyValue === undefined) {
            if (externalMethod === 'load') {
              throw Error(`${externalMethod} :: expecting non-undefined "${itemProperty}" property`);
            }
            itemRecord[i] = 0;
            break;
          }
          if (isValidNumber(itemSourcePropertyValue) === false) {
            throw Error(`${externalMethod} :: expecting number for "${itemProperty}" property`);
          }
          break;
        }
        case 'string': {
          if (itemSourcePropertyValue === undefined) {
            if (itemProperty === 'id') {
              throw Error(`${externalMethod} :: expecting non-undefined "id" property`);
            }
            if (externalMethod === 'load') {
              throw Error(`${externalMethod} :: expecting non-undefined value for "${itemProperty}" property`);
            }
            itemRecord[i] = '';
            break;
          }
          if (typeof itemSourcePropertyValue !== 'string') {
            throw Error(`${externalMethod} :: expecting string-type value for "${itemProperty}" property`);
          }
          if (itemProperty === 'id') {
            if (itemSourcePropertyValue === '') {
              throw Error(`${externalMethod} :: expecting non-empty "id" property`);
            }
            if (externalMethod === 'add') {
              if (internalDataDictionary[itemSourcePropertyValue] !== undefined) {
                throw Error(`${externalMethod} :: expecting "id" property to NOT match existing items`);
              }
            } else if (externalMethod === 'update') {
              if (internalDataDictionary[itemSourcePropertyValue] === undefined) {
                throw Error(`${externalMethod} :: expecting "id" property to match existing items`);
              }
            }
          }
          break;
        }
        case 'boolean': {
          if (itemSourcePropertyValue === undefined) {
            if (externalMethod === 'load') {
              throw Error(`${externalMethod} :: expecting non-undefined "${itemProperty}" property`);
            }
            itemRecord[i] = false;
            break;
          }
          if (typeof itemSourcePropertyValue !== 'boolean') {
            throw Error(`${externalMethod} :: expecting boolean-type value for "${itemProperty}" property`);
          }
          break;
        }
        default: {
          throw Error(`${externalMethod} :: internal error, unexpected "${itemPropertyType}" type.`);
        }
      }
      if (itemSourcePropertyValue !== undefined) {
        itemRecord[i] = itemSourcePropertyValue;
        itemSourceKeys.splice(itemSourceKeys.indexOf(itemProperty), 1);
      }
    }
    for (let i = 0, l = itemSourceKeys.length; i < l; i += 1) {
      const itemProperty = itemSourceKeys[i];
      if (itemSource[itemProperty] === undefined) {
        itemSourceKeys.splice(itemSourceKeys.indexOf(itemProperty), 1);
      }
    }
    if (itemSourceKeys.length > 0) {
      throw Error(`${externalMethod} :: unexpected properties "${itemSourceKeys.join(', ')}"`);
    }
    return itemRecord;
  };

  const hydrateItemFromRecord = (itemRecord) => {
    const hydratedItem = {};
    for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
      hydratedItem[internalItemPropertyList[i]] = itemRecord[i];
    }
    return hydratedItem;
  };

  // FILE LOADING & INITIALIZATION
  if (fs.existsSync('./tables') === false) {
    fs.mkdirSync('./tables', { recursive: true });
    console.log('Table: "./tables" directory created.');
  }
  if (fs.existsSync(internalMainPath) === true) {
    const encoded = fs.readFileSync(internalMainPath);
    const decoded = decode(encoded);
    if (Array.isArray(decoded) === false) {
      throw Error('load :: unexpected non-array "decoded" data.');
    }
    const [loadedItemPropertyListStringified, loadedItemRecords] = decoded;
    if (typeof loadedItemPropertyListStringified !== 'string') {
      throw Error('load :: unexpected non-string "loadedItemPropertyListStringified" data.');
    }
    if (Array.isArray(loadedItemRecords) === false) {
      throw Error('load :: unexpected non-array "loadedItemRecords" data.');
    }
    internalDataList = new Array(loadedItemRecords.length);
    if (loadedItemPropertyListStringified === internalItemPropertyListStringified) {
      internalDataList = loadedItemRecords;
      for (let i = 0, l = loadedItemRecords.length; i < l; i += 1) {
        const itemRecord = loadedItemRecords[i];
        internalDataDictionary[itemRecord[0]] = itemRecord;
      }
    } else {
      const loadedSchemaItemPropertyList = JSON.parse(loadedItemPropertyListStringified);
      for (let i = 0, l = loadedItemRecords.length; i < l; i += 1) {
        const itemRecord = loadedItemRecords[i];
        if (transformFunction === undefined) {
          throw Error('load :: "options.transformFunction" is now required and must be a function.');
        }
        const staleHydratedItem = loadedSchemaItemPropertyList.reduce((previous, current, index) => ({ ...previous, [current]: itemRecord[index] }), {});
        const transformedItemRecord = itemRecordFromSource(transformFunction(staleHydratedItem), 'load');
        for (let x = 0, y = internalItemPropertyList.length; x < y; x += 1) {
          const itemRecordType = typeof transformedItemRecord[x];
          const itemProperty = internalItemPropertyList[x];
          const itemPropertyType = internalItemPropertyTypeDictionary[itemProperty];
          if (itemRecordType !== itemPropertyType) {
            throw Error(`load :: unexpected "${typeof transformedItemRecord[x]}" for "${itemProperty}" property, expecting "${itemPropertyType}"`);
          }
        }
        internalDataList[i] = transformedItemRecord;
        internalDataDictionary[transformedItemRecord[0]] = transformedItemRecord;
      }
    }
    console.log(`Table: Loaded ${internalDataList.length} items.`);
  } else {
    fs.writeFileSync(internalMainPath, encode([internalItemPropertyListStringified, internalDataList]));
    console.log(`Table: File created at "${internalMainPath}".`);
  }

  // TIMEOUT-BASED SAVING
  let internalCurrentInitialSaveTimeout;
  let internalCurrentForceSaveTimeout;
  process.on('SIGINT', () => {
    console.log('Table: SIGINT received.');
    try {
      console.log('Table: Graceful save START');
      if (internalCurrentInitialSaveTimeout !== undefined) {
        clearTimeout(internalCurrentInitialSaveTimeout);
        internalCurrentInitialSaveTimeout = undefined;
      }
      if (internalCurrentForceSaveTimeout !== undefined) {
        clearTimeout(internalCurrentForceSaveTimeout);
        internalCurrentForceSaveTimeout = undefined;
      }
      const encoded = encode([internalItemPropertyListStringified, internalDataList]);
      fs.writeFileSync(internalTempPath, encoded);
      fs.renameSync(internalMainPath, internalOldPath);
      fs.writeFileSync(internalMainPath, encoded);
      console.log('Table: Graceful save OK');
    } catch (e) {
      console.error(`Table: Graceful save ERROR, ${e.message}`);
      process.exit(1);
    }
    process.exit(0);
  });
  let internalCurrentSaveLastCreation = 0;
  const internalInitSaveTimeout = () => {
    // console.log(Date.now() - internalCurrentSaveLastCreation, internalInitialSaveTimeout * 0.95);
    if (internalCurrentInitialSaveTimeout !== undefined) {
      if (Date.now() - internalCurrentSaveLastCreation < internalInitialSaveTimeout * 0.95) {
        return;
      }
      clearTimeout(internalCurrentInitialSaveTimeout);
      internalCurrentInitialSaveTimeout = undefined;
      // console.log('initial: destroyed');
    }
    if (internalCurrentForceSaveTimeout === undefined) {
      // console.log('forced: created');
      internalCurrentForceSaveTimeout = setTimeout(() => {
        // console.log('forced: saving');
        clearTimeout(internalCurrentInitialSaveTimeout);
        internalCurrentInitialSaveTimeout = undefined;
        // console.log('initial: destroyed');
        const encoded = encode([internalItemPropertyListStringified, internalDataList]);
        fs.writeFileSync(internalTempPath, encoded);
        fs.renameSync(internalMainPath, internalOldPath);
        fs.writeFileSync(internalMainPath, encoded);
        internalCurrentForceSaveTimeout = undefined;
        // console.log('forced: saved');
      }, internalForcedSaveTimeout);
    }
    internalCurrentInitialSaveTimeout = setTimeout(() => {
      // console.log('initial: saving');
      clearTimeout(internalCurrentForceSaveTimeout);
      internalCurrentForceSaveTimeout = undefined;
      // console.log('forced: destroyed');
      const encoded = encode([internalItemPropertyListStringified, internalDataList]);
      fs.writeFileSync(internalTempPath, encoded);
      fs.renameSync(internalMainPath, internalOldPath);
      fs.writeFileSync(internalMainPath, encoded);
      internalCurrentInitialSaveTimeout = undefined;
      // console.log('initial: saved');
    }, internalInitialSaveTimeout);
    // console.log('initial: created');
    internalCurrentSaveLastCreation = Date.now();
  };

  // FUNCTIONS
  this.query = () => {
    internalQueryDataList = internalDataList;
    internalQueryItemPropertyDictionary = internalItemPropertyDictionary;
    internalQueryPropertyList = internalItemPropertyList;
    internalQueryItemPropertyTypeDictionary = internalItemPropertyTypeDictionary;
    internalQueryLimit = Infinity;
    internalQueryOffset = 0;
    internalQueryPage = 0;
    internalQuerySorts = [];
    return Query;
  };
  this.id = () => {
    let itemId = crypto.randomBytes(16).toString('hex');
    while (internalDataDictionary[itemId] !== undefined) {
      itemId = crypto.randomBytes(16).toString('hex');
    }
    return itemId;
  };
  this.clear = () => {
    internalDataList = [];
    internalDataDictionary = {};
    internalInitSaveTimeout();
    return this;
  };
  this.add = (itemSource) => {
    const itemRecord = itemRecordFromSource(itemSource, 'add');
    internalDataList.push(itemRecord);
    internalDataDictionary[itemRecord[0]] = itemRecord;
    internalInitSaveTimeout();
    return this;
  };
  this.update = (itemSource) => {
    const itemRecord = itemRecordFromSource(itemSource, 'update');
    const itemId = itemRecord[0];
    const existingItemRecord = internalDataDictionary[itemId];
    internalDataList[internalDataList.indexOf(existingItemRecord)] = itemRecord;
    internalDataDictionary[itemId] = itemRecord;
    internalInitSaveTimeout();
    return this;
  };
  this.get = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('get :: 1st parameter "itemId" must be a non-empty string.');
    }
    const existingItemRecord = internalDataDictionary[itemId];
    if (existingItemRecord === undefined) {
      throw Error(`get :: "${itemId}" itemId not found.`);
    }
    return hydrateItemFromRecord(existingItemRecord);
  };
  this.delete = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('delete :: 1st parameter "itemId" must be a non-empty string.');
    }
    const existingItemRecord = internalDataDictionary[itemId];
    if (existingItemRecord === undefined) {
      throw Error(`delete :: "${itemId}" itemId not found.`);
    }
    internalDataList.splice(internalDataList.indexOf(existingItemRecord), 1);
    delete internalDataDictionary[itemId];
    internalInitSaveTimeout();
    return this;
  };
  this.increment = (itemId, itemProperty) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('increment :: 1st parameter "itemId" must be a non-empty string.');
    }
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('increment :: 2nd parameter "itemProperty" must be a non-empty string.');
    }
    if (internalItemPropertyList.includes(itemProperty) === false) {
      throw Error(`increment :: unexpected "${itemProperty}", expecting "${internalItemPropertyList.join(', ')}"`);
    }
    if (internalItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`increment :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalItemPropertyTypeDictionary[itemProperty]}"`);
    }
    const existingItemRecord = internalDataDictionary[itemId];
    if (existingItemRecord === undefined) {
      throw Error(`increment :: "${itemId}" itemId not found.`);
    }
    existingItemRecord[internalItemPropertyDictionary[itemProperty]] += 1;
    internalInitSaveTimeout();
    return this;
  };
  this.decrement = (itemId, itemProperty) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('decrement :: 1st parameter "itemId" must be a non-empty string.');
    }
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('decrement :: 2nd parameter "itemProperty" must be a non-empty string.');
    }
    if (internalItemPropertyList.includes(itemProperty) === false) {
      throw Error(`decrement :: unexpected "${itemProperty}", expecting "${internalItemPropertyList.join(', ')}"`);
    }
    if (internalItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`decrement :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalItemPropertyTypeDictionary[itemProperty]}"`);
    }
    const existingItemRecord = internalDataDictionary[itemId];
    if (existingItemRecord === undefined) {
      throw Error(`decrement :: "${itemId}" itemId not found.`);
    }
    existingItemRecord[internalItemPropertyDictionary[itemProperty]] -= 1;
    internalInitSaveTimeout();
    return this;
  };
  this.has = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('has :: 1st parameter "itemId" must be a non-empty string.');
    }
    return internalDataDictionary[itemId] !== undefined;
  };
  this.size = () => internalDataList.length;
}

module.exports = { Table };
