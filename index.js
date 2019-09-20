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
  ascend: (property) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('ascend :: 1st parameter "property" must be a non-empty string');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`ascend :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number' && internalQueryItemPropertyTypeDictionary[property] !== 'string') {
      throw Error(`ascend :: unexpected "${property}", expecting property with "number, string" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    internalQuerySorts.push([property, false]);
    return Query;
  },
  descend: (property) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('descend :: 1st parameter "property" must be a non-empty string');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`descend :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number' && internalQueryItemPropertyTypeDictionary[property] !== 'string') {
      throw Error(`descend :: unexpected "${property}", expecting property with "number, string" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    internalQuerySorts.push([property, true]);
    return Query;
  },

  // FILTERS
  gt: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('gt :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('gt :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`gt :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number') {
      throw Error(`gt :: unexpected "${property}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] > value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  gte: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('gte :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('gte :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`gte :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number') {
      throw Error(`gte :: unexpected "${property}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] >= value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  lt: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('lt :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('lt :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`lt :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number') {
      throw Error(`lt :: unexpected "${property}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] < value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  lte: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('lte :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('lte :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`lte :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    if (internalQueryItemPropertyTypeDictionary[property] !== 'number') {
      throw Error(`lte :: unexpected "${property}", expecting property with "number" type, not "${internalQueryItemPropertyTypeDictionary[property]}""`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] <= value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  eq: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('eq :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('eq :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`eq :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
    for (let i = 0, l = tempQueryDataList.length; i < l; i += 1) {
      if (tempQueryDataList[i][itemPropertyIndex] === value) {
        internalQueryDataList.push(tempQueryDataList[i]);
      }
    }
    return Query;
  },
  neq: (property, value) => {
    if (isValidNonEmptyString(property) === false) {
      throw Error('neq :: 1st parameter "property" must be a non-empty string');
    }
    if (isValidNumber(value) === false) {
      throw Error('neq :: 2nd parameter "value" must be a valid number');
    }
    if (internalQueryPropertyList.includes(property) === false) {
      throw Error(`neq :: unexpected property "${property}", expecting "${internalQueryPropertyList.join(', ')}"`);
    }
    const tempQueryDataList = internalQueryDataList;
    internalQueryDataList = [];
    const itemPropertyIndex = internalQueryItemPropertyDictionary[property];
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
      internalQueryDataList = internalQueryDataList.slice(internalQueryLimit * internalQueryPage, (internalQueryLimit * internalQueryPage) + internalQueryLimit);
    } else {
      internalQueryDataList = internalQueryDataList.slice(0, internalQueryLimit);
    }

    // hydrate and return
    const hydratedItems = internalQueryDataList.map((existingItem) => {
      const temporaryItem = {};
      for (let i = 0, l = internalQueryPropertyList.length; i < l; i += 1) {
        temporaryItem[internalQueryPropertyList[i]] = existingItem[i];
      }
      return temporaryItem;
    });
    return hydratedItems;
  },
};

const encode = (decoded) => zlib.gzipSync(JSON.stringify(decoded));
const decode = (encoded) => JSON.parse(zlib.gunzipSync(encoded));

function Table(label, itemSchema, initialSaveTimeout, forcedSaveTimeout) {
  // PARAMETER TYPE CHECKS
  if (isValidNonEmptyString(label) === false) {
    throw Error('new Table:: 1st parameter "label" must be a non-empty string.');
  }
  if (isValidObject(itemSchema) === false) {
    throw Error('new Table:: 2nd parameter "itemSchema" must be a plain object.');
  }
  if (itemSchema.id !== undefined) {
    throw Error('new Table:: "id" property in 2nd parameter "itemSchema" must be undefined.');
  }
  if (initialSaveTimeout !== undefined && isValidInteger(initialSaveTimeout) === false) {
    throw Error('new Table:: 3rd parameter "initialSaveTimeout" must be an integer.');
  }
  if (forcedSaveTimeout !== undefined && isValidInteger(forcedSaveTimeout) === false) {
    throw Error('new Table:: 3rd parameter "forcedSaveTimeout" must be an integer.');
  }

  // INTERNAL VARIABLES
  const internalOldPath = `./tables/${label}-old.db`;
  const internalTempPath = `./tables/${label}-temp.db`;
  const internalMainPath = `./tables/${label}-main.db`;
  let internalDataList = [];
  let internalDataDictionary = {};

  // FILE LOADING & INITIALIZATION
  if (fs.existsSync('./tables') === false) {
    fs.mkdirSync('./tables', { recursive: true });
    console.log('Table: "./tables" directory created.');
  }
  if (fs.existsSync(internalMainPath) === true) {
    try {
      const encoded = fs.readFileSync(internalMainPath);
      const decoded = decode(encoded);
      if (Array.isArray(decoded) === false) {
        throw Error('Unexpected non-array parsed data.');
      }
      internalDataList = new Array(decoded.length);
      for (let i = 0, l = decoded.length; i < l; i += 1) {
        const item = decoded[i];
        try {
          // validate
          // add to list and dictionary
          internalDataList[i] = item;
          internalDataDictionary[item[0]] = item;
        } catch (e) {
          // transform
          // validate again
          // add to list and dictionary
        }
      }
      console.log(`Table: Loaded ${internalDataList.length} items.`);
    } catch (e) {
      throw Error(`Table: Load error, ${e.message}`);
    }
  } else {
    fs.writeFileSync(internalMainPath, encode(internalDataList));
    console.log(`Table: File created at "${internalMainPath}".`);
  }

  // MORE INTERNAL VARIABLES
  const internalItemPropertyList = ['id', ...Object.keys(itemSchema).sort((a, b) => a.localeCompare(b))];
  console.log(internalItemPropertyList);
  const internalItemPropertyDictionary = { id: 0 };
  const internalItemPropertyTypeList = ['string'];
  const internalItemPropertyTypeDictionary = { id: 'string' };
  const internalInitialSaveTimeout = initialSaveTimeout || 5000;
  const internalForcedSaveTimeout = forcedSaveTimeout || 300000;
  for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
    const itemProperty = internalItemPropertyList[i];
    if (itemProperty === 'id') {
      continue;
    }
    const itemPropertyType = itemSchema[itemProperty];
    if (acceptedItemPropertyTypes.includes(itemPropertyType) === false) {
      throw Error(`new Table:: Unexpected "${itemPropertyType}" type for "${itemProperty}" property, expecting "${acceptedItemPropertyTypes.join(', ')}"`);
    }
    internalItemPropertyDictionary[itemProperty] = i;
    internalItemPropertyTypeList[i] = itemPropertyType;
    internalItemPropertyTypeDictionary[itemProperty] = itemPropertyType;
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
      const encoded = encode(internalDataList);
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
        const encoded = encode(internalDataList);
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
      const encoded = encode(internalDataList);
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
    const itemSourceKeys = Object.keys(itemSource);
    const itemRecord = new Array(internalItemPropertyList.length);
    for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
      const itemProperty = internalItemPropertyList[i];
      const itemPropertyType = internalItemPropertyTypeList[i];
      const itemSourcePropertyValue = itemSource[itemProperty];
      switch (itemPropertyType) {
        case 'number': {
          if (itemSourcePropertyValue === undefined) {
            itemRecord[i] = 0;
            break;
          }
          if (isValidNumber(itemSourcePropertyValue) === false) {
            throw Error(`add :: expecting number for "${itemProperty}" property`);
          }
          break;
        }
        case 'string': {
          if (itemSourcePropertyValue === undefined) {
            if (itemProperty === 'id') {
              throw Error('add :: expecting non-undefined "id" property');
            }
            itemRecord[i] = '';
            break;
          }
          if (typeof itemSourcePropertyValue !== 'string') {
            throw Error(`add :: expecting string for "${itemProperty}" property`);
          }
          if (itemProperty === 'id') {
            if (itemSourcePropertyValue === '') {
              throw Error('add :: expecting non-empty "id" property');
            }
            if (internalDataDictionary[itemSourcePropertyValue] !== undefined) {
              throw Error('add :: expecting non-existing "id" property');
            }
          }
          break;
        }
        case 'boolean': {
          if (itemSourcePropertyValue === undefined) {
            itemRecord[i] = false;
            break;
          }
          if (typeof itemSourcePropertyValue !== 'boolean') {
            throw Error(`add :: expecting boolean for "${itemProperty}" property`);
          }
          break;
        }
        default: {
          throw Error(`add :: internal error, unexpected "${itemPropertyType}" type.`);
        }
      }
      if (itemSourcePropertyValue !== undefined) {
        itemRecord[i] = itemSourcePropertyValue;
        itemSourceKeys.splice(itemSourceKeys.indexOf(itemProperty), 1);
      }
    }
    if (itemSourceKeys.length > 0) {
      throw Error(`add :: unexpected "${itemSourceKeys.join(', ')}" properties`);
    }
    internalDataList.push(itemRecord);
    internalDataDictionary[itemRecord[0]] = itemRecord;
    internalInitSaveTimeout();
    return this;
  };
  this.update = (itemSource) => {
    const itemSourceKeys = Object.keys(itemSource);
    const itemRecord = new Array(internalItemPropertyList.length);
    for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
      const itemProperty = internalItemPropertyList[i];
      const itemPropertyType = internalItemPropertyTypeList[i];
      const itemSourcePropertyValue = itemSource[itemProperty];
      switch (itemPropertyType) {
        case 'number': {
          if (itemSourcePropertyValue === undefined) {
            itemRecord[i] = 0;
            break;
          }
          if (isValidNumber(itemSourcePropertyValue) === false) {
            throw Error(`update :: expecting number for "${itemProperty}" property`);
          }
          break;
        }
        case 'string': {
          if (itemSourcePropertyValue === undefined) {
            if (itemProperty === 'id') {
              throw Error('update :: expecting non-undefined "id" property');
            }
            itemRecord[i] = '';
            break;
          }
          if (typeof itemSourcePropertyValue !== 'string') {
            throw Error(`update :: expecting string for "${itemProperty}" property`);
          }
          if (itemProperty === 'id') {
            if (itemSourcePropertyValue === '') {
              throw Error('update :: expecting non-empty "id" property');
            }
            if (internalDataDictionary[itemSourcePropertyValue] === undefined) {
              throw Error('update :: expecting "id" property to match existing items');
            }
          }
          break;
        }
        case 'boolean': {
          if (itemSourcePropertyValue === undefined) {
            itemRecord[i] = false;
            break;
          }
          if (typeof itemSourcePropertyValue !== 'boolean') {
            throw Error(`add :: expecting boolean for "${itemProperty}" property`);
          }
          break;
        }
        default: {
          throw Error(`add :: internal error, unexpected "${itemPropertyType}" type.`);
        }
      }
      if (itemSourcePropertyValue !== undefined) {
        itemRecord[i] = itemSourcePropertyValue;
        itemSourceKeys.splice(itemSourceKeys.indexOf(itemProperty), 1);
      }
    }
    if (itemSourceKeys.length > 0) {
      throw Error(`add :: unexpected "${itemSourceKeys.join(', ')}" properties`);
    }
    const itemId = itemRecord[0];
    const existingItem = internalDataDictionary[itemId];
    internalDataList[internalDataList.indexOf(existingItem)] = itemRecord;
    internalDataDictionary[itemId] = itemRecord;
    internalInitSaveTimeout();
    return this;
  };
  this.get = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('get :: 1st parameter "itemId" must be a non-empty string.');
    }
    const existingItem = internalDataDictionary[itemId];
    if (existingItem === undefined) {
      throw Error(`get :: "${itemId}" itemId not found.`);
    }
    const temporaryItem = {};
    for (let i = 0, l = internalItemPropertyList.length; i < l; i += 1) {
      temporaryItem[internalItemPropertyList[i]] = existingItem[i];
    }
    return temporaryItem;
  };
  this.delete = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('delete :: 1st parameter "itemId" must be a non-empty string.');
    }
    const existingItem = internalDataDictionary[itemId];
    if (existingItem === undefined) {
      throw Error(`delete :: "${itemId}" itemId not found.`);
    }
    internalDataList.splice(internalDataList.indexOf(existingItem), 1);
    delete internalDataDictionary[itemId];
    internalInitSaveTimeout();
    return this;
  };
  this.increment = (itemId, itemProperty) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('incrementItemProperty :: 1st parameter "itemId" must be a non-empty string.');
    }
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('incrementItemProperty :: 2nd parameter "itemProperty" must be a non-empty string.');
    }
    if (internalItemPropertyList.includes(itemProperty) === false) {
      throw Error(`incrementItemProperty :: unexpected "${itemProperty}", expecting "${internalItemPropertyList.join(', ')}"`);
    }
    if (internalItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`incrementItemProperty :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalItemPropertyTypeDictionary[itemProperty]}"`);
    }
    const existingItem = internalDataDictionary[itemId];
    if (existingItem === undefined) {
      throw Error(`incrementItemProperty :: "${itemId}" itemId not found.`);
    }
    existingItem[internalItemPropertyDictionary[itemProperty]] += 1;
    internalInitSaveTimeout();
    return this;
  };
  this.decrement = (itemId, itemProperty) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('incrementItemProperty :: 1st parameter "itemId" must be a non-empty string.');
    }
    if (isValidNonEmptyString(itemProperty) === false) {
      throw Error('incrementItemProperty :: 2nd parameter "itemProperty" must be a non-empty string.');
    }
    if (internalItemPropertyList.includes(itemProperty) === false) {
      throw Error(`incrementItemProperty :: unexpected "${itemProperty}", expecting "${internalItemPropertyList.join(', ')}"`);
    }
    if (internalItemPropertyTypeDictionary[itemProperty] !== 'number') {
      throw Error(`incrementItemProperty :: unexpected "${itemProperty}", expecting property with "number" type, not "${internalItemPropertyTypeDictionary[itemProperty]}"`);
    }
    const existingItem = internalDataDictionary[itemId];
    if (existingItem === undefined) {
      throw Error(`incrementItemProperty :: "${itemId}" itemId not found.`);
    }
    existingItem[internalItemPropertyDictionary[itemProperty]] -= 1;
    internalInitSaveTimeout();
    return this;
  };
  this.has = (itemId) => {
    if (isValidNonEmptyString(itemId) === false) {
      throw Error('has :: 1st parameter "itemId" must be a non-empty string.');
    }
    return internalDataDictionary[itemId] !== undefined;
  };
}


/**
 * - add, increment, decrement, has, delete, get, query
 * - Consistent base types: string, number, boolean
 * - Automatic defaults, string: '', number: 0, boolean: false
 * - Queries are designed to be used synchronously
 * - Queries provide strong consistency
 */

const table = new Table('yeh', { name: 'string', age: 'number' }, 500);
table.clear();

for (let i = 0, l = 1000; i < l; i += 1) {
  table.add({ id: table.id(), age: i });
}
const results = table
  .query()
  .ascend('age')
  .gte('age', 100)
  .limit(1)
  .results();
console.log(results);
