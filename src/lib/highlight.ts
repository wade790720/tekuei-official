// Small syntax highlighter for code cards in journal posts.
// It knows C-like languages (JS, TS, JSX, CSS, JSON) and shell-style # comments.
// shortcut: one generic grammar, no language-specific rules; upgrade to Shiki when posts need exact highlighting.

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class extends ' +
    'import from export default async await try catch finally throw typeof instanceof in of this super ' +
    'null undefined true false void yield static get set type interface as enum implements satisfies'
  ).split(' '),
)

const HASH_COMMENT = new Set(['sh', 'bash', 'shell', 'zsh', 'py', 'python', 'yaml', 'yml', 'toml'])

const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?\*\//y
const HASH = /#[^\n]*/y
const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y
const NUMBER = /\d[\d_]*(?:\.\d+)?/y
const WORD = /[A-Za-z_$][\w$-]*/y
const SPACE = /\s+/y
const ARROW = /=>/y

function match(re: RegExp, src: string, at: number) {
  re.lastIndex = at
  const m = re.exec(src)
  return m ? m[0] : null
}

function nextChar(src: string, at: number) {
  SPACE.lastIndex = at
  const m = SPACE.exec(src)
  return src[m ? at + m[0].length : at]
}

export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'fn' | 'prop' | 'punct' | 'plain'
export interface Token {
  type: TokenType
  text: string
}

/** Joining every `text` gives back `src` exactly. */
export function tokenize(src: string, lang = 'ts'): Token[] {
  if (lang === 'text') return src ? [{ type: 'plain', text: src }] : []
  const out: Token[] = []
  const push = (type: TokenType, text: string) => {
    const last = out[out.length - 1]
    if (last && last.type === type) last.text += text
    else out.push({ type, text })
  }
  const hash = HASH_COMMENT.has(lang)
  let i = 0
  while (i < src.length) {
    let t
    if ((t = match(COMMENT, src, i)) || (hash && (t = match(HASH, src, i)))) push('comment', t)
    else if ((t = match(STRING, src, i))) push('string', t)
    else if ((t = match(SPACE, src, i))) push('plain', t)
    else if ((t = match(NUMBER, src, i))) push('number', t)
    else if ((t = match(WORD, src, i))) {
      const after = nextChar(src, i + t.length)
      // "-" is allowed inside words for CSS; give it back when it ends the word (a - b)
      if (t.endsWith('-')) t = t.replace(/-+$/, '')
      if (KEYWORDS.has(t)) push('keyword', t)
      else if (after === '(') push('fn', t)
      else if (after === ':') push('prop', t)
      else push('plain', t)
    } else if ((t = match(ARROW, src, i))) push('keyword', t)
    else push('punct', (t = src[i]))
    i += t.length
  }
  return out
}
