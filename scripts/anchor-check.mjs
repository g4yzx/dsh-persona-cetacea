/**
 * 锚点回归检查：不开 DSH，只在本地复刻一次 system prompt 组装。
 *
 * 它证明的是三件事：三段都注册了、排序后锚点确实在最后、开关能关掉。
 * 它证明不了运行中的进程已经重载插件——那需要重启 DSH 后看新会话。
 *
 * 用法：node scripts/anchor-check.mjs
 */
import assert from 'node:assert/strict'
import { apply } from '../index.js'

/** 复刻 @deepseek-ai/dsh-system-prompt 的 section 排序与 renderPrompt 空段过滤。 */
function assemble(config) {
  const registered = []
  const ctx = {
    effect(fn) {
      return fn()
    },
    systemPrompt: {
      section(section) {
        assert.ok(Number.isFinite(section.order), `${section.name} order must be finite`)
        registered.push(section)
        return () => {}
      },
    },
  }
  apply(ctx, config)
  return registered
    .sort((a, b) => a.order - b.order || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((section) => ({
      name: section.name,
      order: section.order,
      text: typeof section.text === 'function' ? section.text() : section.text,
    }))
    .filter((section) => section.text.length > 0)
}

const full = assemble({})
const names = full.map((section) => section.name)

assert.deepEqual(
  names,
  ['persona:cetacea-loli', 'persona:cetacea-thinking', 'persona:cetacea-anchor'],
  'default assembly must be persona -> thinking -> anchor (anchor last)',
)
assert.ok(names.at(-1) === 'persona:cetacea-anchor', 'anchor must be the final section')
assert.ok(
  full.at(-1).order > 10200,
  'anchor order must exceed DEPLOYMENT_PERSONA_SUFFIX (10200), else a later section outranks it',
)
assert.match(full.at(-1).text, /沃/, 'anchor must pin the first-person pronoun')
assert.match(full.at(-1).text, /主人/, 'anchor must pin the user address')

const noAnchor = assemble({ anchor: false })
assert.ok(!noAnchor.some((section) => section.name === 'persona:cetacea-anchor'), 'anchor:false must drop the tail section')

const noThinking = assemble({ thinking: false })
assert.ok(!noThinking.some((section) => section.name === 'persona:cetacea-thinking'), 'thinking:false must drop the thinking spec')

assert.equal(assemble({ enabled: false }).length, 0, 'enabled:false must register nothing')

const total = full.reduce((sum, section) => sum + Buffer.byteLength(section.text, 'utf8'), 0)
console.log('sections:')
for (const section of full) {
  console.log(`  ${String(section.order).padStart(5)}  ${section.name.padEnd(26)} ${Buffer.byteLength(section.text, 'utf8')}B`)
}
console.log(`total persona bytes per request: ${total}B`)
console.log('\ntail of assembled prompt:\n---')
console.log(full.at(-1).text.split('\n').slice(0, 4).join('\n'))
console.log('---\nOK anchor-check')
