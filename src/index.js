import { parse } from './parser.js'

export default function (url, data) {
  url = new URL(url)
  const tokens = parse(url.pathname)

  const encode = x => x
  const validate = true

  // Compile all the tokens into regexps.
  const matches = tokens.map(token => {
    if (typeof token === 'object') {
      return new RegExp(`^(?:${token.pattern})$`)
    }
  })

  let path = ''
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (typeof token === 'string') {
      path += token
      continue
    }
    const value = data ? data[token.name] : undefined
    if (value) delete data[token.name]

    const optional = token.modifier === '?' || token.modifier === '*'
    const repeat = token.modifier === '*' || token.modifier === '+'
    if (Array.isArray(value)) {
      if (!repeat) {
        throw new TypeError(`Expected "${token.name}" to not repeat, but got an array.`)
      }
      if (value.length === 0) {
        if (optional) { continue }
        throw new TypeError(`Expected "${token.name}" to not be empty.`)
      }
      for (let j = 0; j < value.length; j++) {
        const segment = encode(value[j], token)
        if (validate && !matches[i].test(segment)) {
          throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}".`)
        }
        path += token.prefix + segment + token.suffix
      }
      continue
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const segment = encode(String(value), token)
      if (validate && !matches[i].test(segment)) {
        throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}".`)
      }
      path += token.prefix + segment + token.suffix
      continue
    }
    if (optional) { continue }
    const typeOfMessage = repeat ? 'an array' : 'a string'
    throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}.`)
  }
  url.pathname = path
  return { url: url.toString(), body: data }
}
