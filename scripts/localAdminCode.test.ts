import assert from 'node:assert/strict'
import { it } from 'node:test'
import { localAdminCode } from './localAdminCode.ts'

const devVars = () => 'ADMIN_SECRET="123456"\n'

it('sends the code only to a server on this machine', () => {
  for (const base of ['http://localhost:4175', 'http://127.0.0.1:5173', 'http://[::1]:8788']) assert.equal(localAdminCode(base, {}, devVars), '123456', base)
  for (const base of ['https://tekuei-next.example.workers.dev', 'https://tekuei.com', 'http://localhost.evil.com', 'http://192.168.0.2:4175']) {
    assert.equal(localAdminCode(base, { ADMIN_SECRET: '654321' }, devVars), null, base)
  }
})

it('takes ADMIN_SECRET from the environment before .dev.vars, and none when neither has it', () => {
  assert.equal(localAdminCode('http://localhost:4175', { ADMIN_SECRET: '654321' }, devVars), '654321')
  assert.equal(localAdminCode('http://localhost:4175', {}, () => ''), null)
})
