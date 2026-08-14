import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { apply, inject, name } from '../index.js'

test('registers the packaged skill and exposes its resources', () => {
  let registered
  let disposed = false
  const ctx = {
    skills: {
      register(skill) {
        registered = skill
        return () => { disposed = true }
      },
    },
  }

  const dispose = apply(ctx)

  assert.equal(name, 'wanghong-handwritten-ppt')
  assert.deepEqual(inject, ['skills'])
  assert.equal(registered.name, 'wanghong-handwritten-ppt')
  assert.equal(registered.provider, 'dsh-wanghong-handwritten-ppt')
  assert.equal(registered.source, 'bundled')
  assert.deepEqual(registered.invocation, { modelInvocable: true, userInvocable: true })
  assert.equal(registered.resourceBase.kind, 'directory')
  assert.ok(existsSync(resolve(registered.resourceBase.path, 'templates/deck.html')))
  assert.ok(existsSync(resolve(registered.resourceBase.path, 'assets/preview-cover.png')))
  assert.match(registered.content, /王虹学术手写风 HTML 幻灯片/)
  assert.equal(registered.content.startsWith('---'), false)

  dispose()
  assert.equal(disposed, true)
})

test('declares an installable DSH bundle', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.match(patch, /id: wanghong-handwritten-ppt/)
  assert.match(patch, /name: dsh-wanghong-handwritten-ppt/)
})
