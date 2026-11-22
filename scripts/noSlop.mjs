// Comment patterns AI keeps writing. Runs as an ESLint rule for JS, as a CLI for CSS,
// and as a Claude Code PostToolUse hook (`--hook`) so the edit fails the moment it is written.
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename, extname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const CHECKS = [
  [/(──|-{3,}|={3,})\s*\S.*?(──|-{3,}|={3,})/, '區塊橫幅：刪掉，或改成一般註解'],
  [/\b20\d\d-\d\d-\d\d\b/, '日期：決策歷史寫在 commit message'],
  [/eslint-disable|@ts-ignore|@ts-expect-error/, 'lint 抑制：改程式碼讓規則通過'],
  [/—/, 'em dash：英文改用句號或逗號，中文寫「──」'],
  [/\b(utili[sz]e|leverag|delve|seamless|pivotal|crucial|showcas|testament|tapestry|vibrant|additionally|furthermore)/i, 'AI 用詞：換成簡單的字'],
]

let known
function fileExists(name) {
  known ??= new Set(
    execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').map((f) => basename(f)),
  )
  return known.has(name)
}

/** Problems in one comment's text. */
export function slopIn(text) {
  const found = CHECKS.filter(([re]) => re.test(text)).map(([, msg]) => msg)
  // Capitalised .js names are libraries (Editor.js, Three.js); our components are .jsx.
  const stale = [...text.matchAll(/\b[\w.-]+\.(?:css|jsx|js|mjs)\b/g)]
    .map(([name]) => name)
    .filter((name) => !/^[A-Z]\w*\.js$/.test(name) && !fileExists(name))
  if (stale.length) found.push(`指向不存在的檔案：${stale.join('、')}`)
  return found
}

export const noSlopPlugin = {
  rules: {
    comments: {
      meta: { type: 'problem' },
      create: (ctx) => ({
        Program() {
          for (const c of ctx.sourceCode.getAllComments())
            for (const message of slopIn(c.value)) ctx.report({ loc: c.loc, message })
        },
      }),
    },
  },
}

function cssProblems(file) {
  const src = readFileSync(file, 'utf8')
  return [...src.matchAll(/\/\*[\s\S]*?\*\//g)].flatMap((m) => {
    const line = src.slice(0, m.index).split('\n').length
    return slopIn(m[0]).map((msg) => `${file}:${line}  ${msg}`)
  })
}

async function jsProblems(file) {
  const { ESLint } = await import('eslint')
  const eslint = new ESLint()
  if (await eslint.isPathIgnored(file)) return []
  const [result] = await eslint.lintFiles([file])
  return result.messages.map((m) => `${file}:${m.line}  ${m.message}${m.ruleId ? ` (${m.ruleId})` : ''}`)
}

async function hook() {
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  const path = JSON.parse(input).tool_input?.file_path
  if (!path) return
  const file = relative(process.cwd(), path)
  if (file.startsWith('..')) return
  const ext = extname(file)
  const problems = ext === '.css' ? cssProblems(file) : ['.js', '.jsx', '.mjs'].includes(ext) ? await jsProblems(file) : []
  if (problems.length) {
    console.error(`${problems.join('\n')}\n規則見 AGENTS.md「註解」。`)
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
