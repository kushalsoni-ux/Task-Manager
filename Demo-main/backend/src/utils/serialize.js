const SNAKE_CASE_SEGMENT = /_([a-z])/g;

const toCamelKey = (key) => key.replace(SNAKE_CASE_SEGMENT, (_, char) => char.toUpperCase());

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const serialize = (value) => {
  if (value === null || value === undefined || value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce((acc, [key, nestedValue]) => {
    acc[toCamelKey(key)] = serialize(nestedValue);
    return acc;
  }, {});
};

module.exports = { serialize };
