import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import subsetFont from 'subset-font'
import opentype from '@shuding/opentype.js'
import { readPostSources } from './post-source.js'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const slogan = '槐序初霁，花落满径。'
const textNode = (text, style = {}) => ({ type: 'div', props: { style: { width: 1048, flexShrink: 0, wordBreak: 'break-all', ...style }, children: text } })
/** npm 构建准备阶段调用；全批次只做一轮字体子集，保留原 WOFF2/CSS/许可不动。 */
export async function generateOg() {
  const posts = readPostSources().map(post => ({ ...post,
    title: String(post.data.title || '未命名文章'),
    description: Array.from(String(post.data.description || post.content.trim().split('\n').find(line => line.trim() && !line.trim().startsWith('<')) || '')).slice(0, 84).join(''),
    category: String(post.data.category || '未分类'),
    date: new Date(post.data.date).toISOString().slice(0, 10),
  }))
  const characters = [...new Set(Array.from(`槐序霁${slogan}${posts.map(p => p.title + p.description + p.category + p.date).join('')}`))].join('')
  const fonts = []
  const missing = new Set(Array.from(characters).filter(char => !/\s/u.test(char)))
  // 读取已有合法分包并在内存转为 Satori 支持的 SFNT；不会往 public 写字体或增加浏览器请求。
  for (const part of ['latin-symbols', 'cjk-common', 'cjk-extended']) {
    const source = await fs.readFile(`${publicDir}/fonts/maple-mono-nf-cn/MapleMono-NF-CN-Regular-${part}.woff2`)
    const data = await subsetFont(source, characters, { targetFormat: 'sfnt' })
    let parsed
    try { parsed = opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)) }
    catch (error) {
      // 某些分包不含本批文章字符，HarfBuzz 会输出空 cmap；仅此情况允许跳过。
      if (error.message === 'No valid cmap sub-tables found.') continue
      throw error
    }
    for (const char of missing) if (parsed.charToGlyphIndex(char)) missing.delete(char)
    fonts.push({ name: `Maple${fonts.length}`, data, weight: 400, style: 'normal' })
  }
  if (missing.size) throw new Error(`[OG] 字体缺少字符：${[...missing].join('')}`)
  await fs.mkdir(`${publicDir}/og`, { recursive: true })
  for (const post of posts) {
    // 标题按字符数缩放而不截断；超出画布能力时明确失败，避免发布缺字或被裁切的分享图。
    if (Array.from(post.title).length > 100) throw new Error(`[OG] 标题过长，请调整排版：${post.slug}`)
    const tree = { type: 'div', props: { style: { width: 1200, height: 630, padding: '48px 64px', display: 'flex', flexDirection: 'column', backgroundColor: '#edf4e9', color: '#304737', fontFamily: fonts.map(f => f.name).join(', '), border: '12px solid #c4d8b9' }, children: [
      textNode('槐序霁', { fontSize: 28, color: '#60805a', marginBottom: 30 }),
      textNode(post.title, { fontSize: post.title.length > 45 ? 36 : 48, lineHeight: 1.35, marginBottom: 22 }),
      textNode(post.description, { fontSize: 23, lineHeight: 1.6, color: '#607362' }),
      textNode(`${post.category}   ${post.date}`, { position: 'absolute', left: 64, bottom: 96, fontSize: 20 }),
      textNode(slogan, { position: 'absolute', left: 64, bottom: 48, fontSize: 22, color: '#60805a' }),
    ] } }
    const svg = await satori(tree, { width: 1200, height: 630, fonts })
    const png = new Resvg(svg).render().asPng()
    await fs.writeFile(`${publicDir}/og/${post.slug}.png`, png)
    console.log(`[OG] ${post.slug}: 1200×630 / ${png.length} bytes`)
  }
}
