/**
 * Deterministically canonicalizes a JavaScript object for hashing/signature verification.
 * Recursively sorts keys and formats standard types, dates, ObjectIds, and nested objects.
 */
const canonicalizeRecord = (obj) => {
  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return JSON.stringify(obj.toISOString());
  }

  // Handle Mongoose / BSON ObjectIds
  if (obj._bsontype || (obj.constructor && obj.constructor.name === 'ObjectId') || typeof obj.toHexString === 'function') {
    return JSON.stringify(obj.toString());
  }

  // Handle objects with toJSON method (e.g. Mongoose Documents)
  if (typeof obj.toJSON === 'function' && obj.constructor && obj.constructor.name !== 'Object' && !Array.isArray(obj)) {
    return canonicalizeRecord(obj.toJSON());
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalizeRecord(item)).join(',') + ']';
  }

  // Handle Plain Objects
  const sortedKeys = Object.keys(obj).sort();
  const parts = sortedKeys.map((key) => {
    const val = obj[key];
    if (val === undefined || typeof val === 'function') {
      return null;
    }
    return JSON.stringify(key) + ':' + canonicalizeRecord(val);
  }).filter(Boolean);

  return '{' + parts.join(',') + '}';
};

module.exports = canonicalizeRecord;
