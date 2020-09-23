export function lexer (str) {
  const tokens = []
  let i = 0
  while (i < str.length) {
    const char = str[i]
    if (char === '*' || char === '+' || char === '?') {
      tokens.push({ type: 'MODIFIER', index: i, value: str[i++] })
      continue
    }
    if (char === '\\') {
      tokens.push({ type: 'ESCAPED_CHAR', index: i++, value: str[i++] })
      continue
    }
    if (char === '{') {
      tokens.push({ type: 'OPEN', index: i, value: str[i++] })
      continue
    }
    if (char === '}') {
      tokens.push({ type: 'CLOSE', index: i, value: str[i++] })
      continue
    }
    if (char === ':') {
      let name = ''
      let j = i + 1
      while (j < str.length) {
        const code = str.charCodeAt(j)
        if (
          // `0-9`
          (code >= 48 && code <= 57) ||
          // `A-Z`
          (code >= 65 && code <= 90) ||
          // `a-z`
          (code >= 97 && code <= 122) ||
          // `_`
          code === 95) {
          name += str[j++]
          continue
        }
        break
      }
      if (!name) { throw new TypeError(`Missing parameter name at ${i}.`) }
      tokens.push({ type: 'NAME', index: i, value: name })
      i = j
      continue
    }
    if (char === '(') {
      let count = 1
      let pattern = ''
      let j = i + 1
      if (str[j] === '?') {
        throw new TypeError(`Pattern cannot start with "?" at ${j}.`)
      }
      while (j < str.length) {
        if (str[j] === '\\') {
          pattern += str[j++] + str[j++]
          continue
        }
        if (str[j] === ')') {
          count--
          if (count === 0) {
            j++
            break
          }
        } else if (str[j] === '(') {
          count++
          if (str[j + 1] !== '?') {
            throw new TypeError(`Capturing groups are not allowed at ${j}.`)
          }
        }
        pattern += str[j++]
      }
      if (count) { throw new TypeError(`Unbalanced pattern at ${i}.`) }
      if (!pattern) { throw new TypeError(`Missing pattern at ${i}.`) }
      tokens.push({ type: 'PATTERN', index: i, value: pattern })
      i = j
      continue
    }
    tokens.push({ type: 'CHAR', index: i, value: str[i++] })
  }
  tokens.push({ type: 'END', index: i, value: '' })
  return tokens
}
