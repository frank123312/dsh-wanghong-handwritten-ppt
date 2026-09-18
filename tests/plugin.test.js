import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
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

test('renderer uses deterministic preview URLs and gates export on layout audit', () => {
  const rendererUrl = new URL(
    '../skills/wanghong-handwritten-ppt/scripts/render.sh',
    import.meta.url,
  )
  const renderer = readFileSync(rendererUrl, 'utf8')

  assert.match(renderer, /\?preview=\$\{i\}/)
  assert.doesNotMatch(renderer, /file:\/\/\$RENDER_HTML#\/\$i/)
  assert.match(renderer, /\*, \*::before, \*::after \{/)
  assert.match(renderer, /animation: none !important;/)
  assert.match(renderer, /transition: none !important;/)
  assert.match(renderer, /check_layout\.js/)

  const syntax = spawnSync('bash', ['-n', rendererUrl.pathname])
  assert.equal(syntax.status, 0, syntax.stderr.toString())
})

test('layout audit is valid ESM and its injected browser program parses', () => {
  const source = readFileSync(
    new URL(
      '../skills/wanghong-handwritten-ppt/scripts/check_layout.js',
      import.meta.url,
    ),
    'utf8',
  )

  assert.match(source, /getBoundingClientRect\(\)/)
  assert.match(source, /materializeAnnotationProbes/)
  assert.match(source, /process\.exit\(2\)/)

  const embedded = source.match(
    /const auditScript = String\.raw`\n<script[^>]*>\n([\s\S]*?)\n<\/script>\n`;/,
  )

  assert.ok(embedded, 'embedded browser audit script not found')
  assert.doesNotThrow(() => new vm.Script(embedded[1]))
})
