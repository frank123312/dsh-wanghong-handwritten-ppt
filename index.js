import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SKILL_NAME = 'wanghong-handwritten-ppt'
const SKILL_DESCRIPTION = '将文章、讲稿或技术主题制作成 16:9 Notability 学术手写风 HTML 幻灯片，并逐页导出 PNG。适用于王虹手写 PPT、数学家手写报告风、技术文章转演示文稿等任务。'
const SKILL_ROOT_URL = new URL('./skills/wanghong-handwritten-ppt/', import.meta.url)
const SKILL_FILE_URL = new URL('SKILL.md', SKILL_ROOT_URL)

function stripFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return markdown
  const end = markdown.indexOf('\n---\n', 4)
  return end === -1 ? markdown : markdown.slice(end + 5)
}

export const name = SKILL_NAME
export const inject = ['skills']

export function apply(ctx) {
  const skillPath = fileURLToPath(SKILL_FILE_URL)
  const resourcePath = fileURLToPath(SKILL_ROOT_URL)
  const content = stripFrontmatter(readFileSync(SKILL_FILE_URL, 'utf8'))

  return ctx.skills.register({
    name: SKILL_NAME,
    description: SKILL_DESCRIPTION,
    whenToUse: '用户要求王虹 PPT 风格、王虹手写 PPT、Notability 学术手写幻灯片、手写网页 PPT、手写 PPT 或数学家手写报告风时使用。',
    invocation: { modelInvocable: true, userInvocable: true },
    provider: 'dsh-wanghong-handwritten-ppt',
    source: 'bundled',
    resourceBase: { kind: 'directory', path: resourcePath },
    content,
    path: skillPath,
  })
}
