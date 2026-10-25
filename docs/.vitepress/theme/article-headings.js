import MarkdownIt from 'markdown-it'

const parser = new MarkdownIt({ html: true, linkify: false })

function plainText(tokens = []) {
  return tokens.map((token) => {
    if (token.type === 'text' || token.type === 'code_inline') return token.content
    if (token.type === 'image') return plainText(token.children) || token.content
    if (token.type === 'softbreak' || token.type === 'hardbreak' || /^<br\b/i.test(token.content)) return ' '
    return ''
  }).join('').trim()
}

/** Post 的目录解析和 MarkDown 的 SSR/客户端渲染共同调用；同一正文独立解析也必须产生完全相同的 ID。 */
export function assignHeadingIds(tokens) {
  const used = new Set()
  const toc = []
  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return
    const title = plainText(tokens[index + 1]?.children)
    const base = title.normalize('NFKC').toLowerCase().replace(/\s+/gu, '-')
      .replace(/[^\p{L}\p{N}\p{M}_-]/gu, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'section'
    let id = base
    let suffix = 2
    // 连续重复标题和本身带 -2 的标题共用占用集合，避免拼接后再次撞名。
    while (used.has(id)) id = `${base}-${suffix++}`
    used.add(id)
    token.attrSet('id', id)
    const level = Number(token.tag.slice(1))
    if (level === 2 || level === 3) toc.push({ id, title: title || '未命名章节', level })
  })
  return toc
}

export function articleHeadings(content) {
  return assignHeadingIds(parser.parse(content || '', {}))
}
