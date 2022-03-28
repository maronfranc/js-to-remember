/**
 * Accept obj and path joined with separator.
 * @param {Record<any, any>} obj
 * @param {string} path of nested obj keys separated with separator
 * @param {string} separator
 */
const getLastValidNestedValue = (obj, path, separator = '.') => {
  if (!path.includes(separator)) return obj[path];

  // let nestedValue = cloneDeep(obj);
  let nestedValue = { ...obj };

  for (const key of path.split(separator)) {
    if (!(key in nestedValue)) break;
    nestedValue = nestedValue[key];
  }

  return nestedValue;
}
