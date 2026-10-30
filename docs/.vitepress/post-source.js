import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const directory = fileURLToPath(new URL('../posts/', import.meta.url))
/** 路由、SEO 和 OG 构建共同读取现有文章源；在输出文件前拒绝危险路径与重复 slug。 */
export function readPostSources() {
  const seen = new Set()
  return fs.readdirSync(directory).filter(file => file.endsWith('.md')).sort().map(file => {
    const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
    const key = slug.normalize('NFC').toLowerCase()
    if (!/^[\p{L}\p{N}_-]+$/u.test(slug) || seen.has(key)) throw new Error(`[文章] 无效或重复 slug：${file}`)
    seen.add(key)
    return { slug, ...matter(fs.readFileSync(`${directory}/${file}`, 'utf8'), {}) }
  })
}
