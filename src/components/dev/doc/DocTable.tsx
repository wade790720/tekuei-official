import type { ReactNode } from 'react'

/**
 * A spec table. Columns listed in `code` show their cells as code chips (tokens, values, prop names).
 * With `rowHeader`, the first cell of each row is a row heading.
 */
interface DocTableProps {
  head: string[]
  rows: ReactNode[][]
  code?: number[]
  rowHeader?: boolean
}

export function DocTable({ head, rows, code = [], rowHeader = false }: DocTableProps) {
  return (
    <div className="cl-table-wrap">
      <table className="cl-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const body = code.includes(c) && cell !== '' && cell != null ? <code>{cell}</code> : cell
                return rowHeader && c === 0 ? (
                  <th key={c} scope="row">
                    {body}
                  </th>
                ) : (
                  <td key={c}>{body}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
