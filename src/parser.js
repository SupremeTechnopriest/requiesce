import { lexer } from './lexer.js'
import { escapeString } from './utils.js'

/**
 * Parse a string for the raw tokens.
 */
export function parse (str, options = {}) {
  const tokens = lexer(str)
  const prefixes = './'
  const defaultPattern = `[^${escapeString(options.delimiter || '/#?')}]+?`
  const result = []
  let key = 0
  let i = 0
  let path = ''
  const tryConsume = (type) => {
    if (i < tokens.length && tokens[i].type === type) { return tokens[i++].value }
  }
  const mustConsume = (type) => {
    const value = tryConsume(type)
    if (value !== undefined) { return value }
    const { type: nextType, index } = tokens[i]
    throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`)
  }
  const consumeText = () => {
    let result = ''
    let value
    // tslint:disable-next-line
    while ((value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR'))) {
      result += value
    }
    return result
  }
  while (i < tokens.length) {
    const char = tryConsume('CHAR')
    const name = tryConsume('NAME')
    const pattern = tryConsume('PATTERN')
    if (name || pattern) {
      let prefix = char || ''
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix
        prefix = ''
      }
      if (path) {
        result.push(path)
        path = ''
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: '',
        pattern: pattern || defaultPattern,
        modifier: tryConsume('MODIFIER') || ''
      })
      continue
    }
    const value = char || tryConsume('ESCAPED_CHAR')
    if (value) {
      path += value
      continue
    }
    if (path) {
      result.push(path)
      path = ''
    }
    const open = tryConsume('OPEN')
    if (open) {
      const prefix = consumeText()
      const name = tryConsume('NAME') || ''
      const pattern = tryConsume('PATTERN') || ''
      const suffix = consumeText()
      mustConsume('CLOSE')
      result.push({
        name: name || (pattern ? key++ : ''),
        pattern: name && !pattern ? defaultPattern : pattern,
        prefix,
        suffix,
        modifier: tryConsume('MODIFIER') || ''
      })
      continue
    }
    mustConsume('END')
  }
  return result
}
