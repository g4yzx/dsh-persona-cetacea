import { PERSONA_TEXT, PERSONA_ANCHOR_TEXT, PERSONA_THINKING_TEXT } from './persona.js'

/** Default section identity; config may rename it. */
const SECTION_NAME = 'persona:cetacea-loli'

/** Tail anchor and thinking-spec section identities. */
const ANCHOR_SECTION_NAME = 'persona:cetacea-anchor'
const THINKING_SECTION_NAME = 'persona:cetacea-thinking'

/**
 * Sits after the deployment persona prefix (order 0) and before the sparse
 * first-party policy sections (plan policy is 500), so the persona colors the
 * whole prompt without shadowing harness identity.
 */
const DEFAULT_ORDER = 100

/**
 * The full persona is mid-prompt: tens of KB of injected instructions and every
 * tool schema sit on top of it, and other plugins place their own format rules
 * at 10150 and 10200 (the deployment persona suffix). Reports of "the persona
 * fades once the task gets real" are this recency problem, not a loading bug.
 *
 * The anchor therefore registers *after* those slots — it is the last thing in
 * the system prompt, re-rendered on every request.
 */
const DEFAULT_ANCHOR_ORDER = 10250

/** 10240 keeps the thinking spec in front of the anchor, both after 10200. */
const DEFAULT_THINKING_ORDER = 10240

/** Accepted by `systemPrompt.section`; anything smaller is "keep the default". */
const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback)

/** Non-empty override text, else the built-in default. */
const textOr = (value, fallback) =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

export const inject = ['systemPrompt']

export function apply(ctx, config = {}) {
  const options = config && typeof config === 'object' ? config : {}
  if (options.enabled === false) return

  const text = textOr(options.content, PERSONA_TEXT)
  const order = finiteOr(options.order, DEFAULT_ORDER)
  const name = textOr(options.name, SECTION_NAME)

  ctx.effect(() => ctx.systemPrompt.section({
    name,
    order,
    text,
    interpolate: false,
  }))

  // The two tail sections render through a function so a config reload (or a
  // section switched off) takes effect on the next assembly instead of needing
  // a restart. Empty text is dropped by renderPrompt, so "" means "off".
  if (options.anchor !== false) {
    const anchorText = textOr(options.anchorContent, PERSONA_ANCHOR_TEXT)
    const anchorOrder = finiteOr(options.anchorOrder, DEFAULT_ANCHOR_ORDER)
    const anchorName = textOr(options.anchorName, ANCHOR_SECTION_NAME)
    ctx.effect(() => ctx.systemPrompt.section({
      name: anchorName,
      order: anchorOrder,
      text: () => anchorText,
      interpolate: false,
    }))
  }

  if (options.thinking !== false) {
    const thinkingText = textOr(options.thinkingContent, PERSONA_THINKING_TEXT)
    const thinkingOrder = finiteOr(options.thinkingOrder, DEFAULT_THINKING_ORDER)
    const thinkingName = textOr(options.thinkingName, THINKING_SECTION_NAME)
    ctx.effect(() => ctx.systemPrompt.section({
      name: thinkingName,
      order: thinkingOrder,
      text: () => thinkingText,
      interpolate: false,
    }))
  }
}
