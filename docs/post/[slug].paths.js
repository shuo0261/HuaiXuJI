import fs from 'node:fs'
import path from 'node:path'

/**
 * 文章动态路由（对应原 vue-router /post/:number）
 * 扫描 docs/posts/*.md 生成 /post/<slug> 页面
 */
const postsDir = path.resolve(__dirname, '../posts')

export default {
  paths() {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    return files.map((file) => {
      const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
      return { params: { slug } }
    })
  },
}
