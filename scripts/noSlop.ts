// Comment patterns AI keeps writing, and the design rules a stylesheet keeps breaking. Runs as an ESLint rule for JS, as a CLI for CSS,
// and as a Claude Code PostToolUse hook (`--hook`) so the edit fails the moment it is written.
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename, extname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Rule } from 'eslint'

const CHECKS: [RegExp, string][] = [
  [/(──|-{3,}|={3,})\s*\S.*?(──|-{3,}|={3,})/, '區塊橫幅：刪掉，或改成一般註解'],
  [/\b20\d\d-\d\d-\d\d\b/, '日期：決策歷史寫在 commit message'],
  [/eslint-disable|@ts-ignore|@ts-expect-error/, 'lint 抑制：改程式碼讓規則通過'],
  [/—/, 'em dash：英文改用句號或逗號，中文寫「──」'],
  [/\b(utili[sz]e|leverag|delve|seamless|pivotal|crucial|showcas|testament|tapestry|vibrant|additionally|furthermore)/i, 'AI 用詞：換成簡單的字'],
]

let known: Set<string> | undefined
function fileExists(name: string) {
  known ??= new Set(
    execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').map((f) => basename(f)),
  )
  return known.has(name)
}

/** Problems in one comment's text. */
export function slopIn(text: string): string[] {
  const found = CHECKS.filter(([re]) => re.test(text)).map(([, msg]) => msg)
  // Capitalised .js names are libraries (Editor.js, Three.js); our components are .tsx.
  const stale = [...text.matchAll(/\b[\w.-]+\.(?:css|tsx|ts|mts|jsx|js|mjs)\b/g)]
    .map(([name]) => name)
    .filter((name) => !/^[A-Z]\w*\.js$/.test(name) && !fileExists(name))
  if (stale.length) found.push(`指向不存在的檔案：${stale.join('、')}`)
  return found
}

export const noSlopPlugin = {
  rules: {
    comments: {
      meta: { type: 'problem' },
      create: (ctx: Rule.RuleContext) => ({
        Program() {
          for (const c of ctx.sourceCode.getAllComments())
            for (const message of slopIn(c.value)) if (c.loc) ctx.report({ loc: c.loc, message })
        },
      }),
    },
  },
}

// Design rules a stylesheet can break without anyone noticing (DESIGN.md "Don't"). They were written down
// and broken anyway, so they are checked here. Spacing in px must be a step of the scale.
const SCALE = new Set([0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 96])
interface Declaration {
  prop: string
  value: string
}
type Baseline = Record<string, Record<string, number> | undefined>

const DESIGN: [string, (d: Declaration, file: string) => boolean, string][] = [
  ['色碼', (d, file) => !file.endsWith('tokens.css') && /#[0-9a-f]{3,8}\b/i.test(d.value), '色碼：改用 tokens.css 的語意 token'],
  ['字重', (d) => d.prop === 'font-weight' && /^(bold|[5-9]00)$/.test(d.value), '字重：只有 300 和 400'],
  [
    '間距',
    (d) => /^(margin|padding|gap|row-gap|column-gap)/.test(d.prop) && [...d.value.matchAll(/(\d*\.?\d+)px/g)].some(([, n]) => !SCALE.has(Number(n))),
    '間距：用 --space-* 或 --gap-*，刻度外的數字改成最近的一階',
  ],
]

/** Design-rule breaks in one stylesheet's text: `{ line, rule, msg }` for each declaration that breaks one. */
export function designIn(css: string, file = '') {
  // Comments become spaces, so a hex in a comment is not a colour and line numbers hold.
  const src = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  return [...src.matchAll(/([\w-]+)\s*:\s*([^;{}]+);/g)].flatMap((m) => {
    const d = { prop: m[1], value: m[2].trim() }
    const line = src.slice(0, m.index).split('\n').length
    return DESIGN.filter(([, broken]) => broken(d, file)).map(([rule, , msg]) => ({ line, rule, msg }))
  })
}

// What was already there when the check arrived, per file and rule. A file may break a rule that many
// times and no more, so the count can only go down: lower it there when you fix one.
const BASELINE: Baseline = JSON.parse(readFileSync(new URL('./designBaseline.json', import.meta.url), 'utf8'))

/** A file's breaks of each rule, when there are more of them than the baseline allows. */
export function designProblems(file: string, baseline: Baseline = BASELINE) {
  const key = file.replaceAll('\\', '/')
  const found = designIn(readFileSync(file, 'utf8'), key)
  return [...new Set(found.map((f) => f.rule))].flatMap((rule) => {
    const hits = found.filter((f) => f.rule === rule)
    const allowed = baseline[key]?.[rule] ?? 0
    if (hits.length <= allowed) return []
    return hits.map((f) => `${file}:${f.line}  ${f.msg}${allowed ? `（這個檔案原本有 ${allowed} 處，現在 ${hits.length} 處）` : ''}`)
  })
}

function cssProblems(file: string) {
  const src = readFileSync(file, 'utf8')
  const comments = [...src.matchAll(/\/\*[\s\S]*?\*\//g)].flatMap((m) => {
    const line = src.slice(0, m.index).split('\n').length
    return slopIn(m[0]).map((msg) => `${file}:${line}  ${msg}`)
  })
  return [...comments, ...designProblems(file)]
}

async function jsProblems(file: string) {
  const { ESLint } = await import('eslint')
  const eslint = new ESLint()
  if (await eslint.isPathIgnored(file)) return []
  const [result] = await eslint.lintFiles([file])
  return result.messages.map((m) => `${file}:${m.line}  ${m.message}${m.ruleId ? ` (${m.ruleId})` : ''}`)
}

async function hook() {
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  const path: unknown = JSON.parse(input).tool_input?.file_path
  if (!path || typeof path !== 'string') return
  const file = relative(process.cwd(), path)
  if (file.startsWith('..')) return
  const ext = extname(file)
  const problems = ext === '.css' ? cssProblems(file) : ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.mts'].includes(ext) ? await jsProblems(file) : []
  if (problems.length) {
    console.error(`${problems.join('\n')}\n規則見 AGENTS.md「註解」和 DESIGN.md「Don't」。`)
    process.exit(2)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Not awaited at the top level: ESLint loads eslint.config.js, which imports this module.
  if (process.argv[2] === '--hook') hook()
  else {
    const css = execSync('git ls-files --cached --others --exclude-standard "*.css"', { encoding: 'utf8' })
      .split('\n')
      .filter((f) => f && !f.startsWith('public/'))
    const problems = css.flatMap(cssProblems)
    if (problems.length) {
      console.error(problems.join('\n'))
      process.exit(1)
    }
  }
}
