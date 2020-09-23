/**
 * Escape a regular expression string.
 */
export const escapeString = str => {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Get the flags for a regexp from the options.
 */
export const flags = options => {
  return options && options.sensitive ? '' : 'i'
}
