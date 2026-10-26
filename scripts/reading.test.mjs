import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import MarkdownIt from 'markdown-it'
import { articleHeadings, assignHeadingIds } from '../docs/.vitepress/theme/article-headings.js'
import { coverFallback, localCovers, resolveArticleCover } from '../docs/.vitepress/theme/article-covers.js'

// Node 原生 JSON 导入与 Vite 的处理不同；测试注入同一份 JSON，避免为运行测试改动浏览器模块的导入方式。
const messagesSource = fs.readFileSync(new URL('../docs/.vitepress/theme/live2d/messages.js', import.meta.url), 'utf8')
  .replace("import tips from './tips.json'", `const tips = ${fs.readFileSync(new URL('../docs/.vitepress/theme/live2d/tips.json', import.meta.url), 'utf8')}`)
const { messageFor, tipSource } = await import(`data:text/javascript;base64,${Buffer.from(messagesSource).toString('base64')}`)

test('目录与渲染锚点一致，处理中文、格式、重复、保留字尾及纯符号', () => {
  const body = '## 中文 标题\n\n### **Bold** 和 `Code`\n\n## 重复\n\n### 重复\n\n## 重复-2\n\n## !!!\n\n#### 其他'
  const toc = articleHeadings(body)
  assert.deepEqual(toc.map(item => item.id), ['中文-标题', 'bold-和-code', '重复', '重复-2', '重复-2-2', 'section'])
  assert.deepEqual(toc.map(item => item.level), [2, 3, 2, 3, 2, 2])
  const md = new MarkdownIt({ html: true, linkify: false })
  md.core.ruler.after('inline', 'test_anchors', state => assignHeadingIds(state.tokens))
  const html = md.render(body)
  for (const item of toc) assert.ok(html.includes(`id="${item.id}"`))
  assert.deepEqual(articleHeadings(body), toc)
  assert.equal(articleHeadings('正文，没有章节').length, 0)
  assert.equal(articleHeadings('## 仅一节').length, 1)
})

test('显式本地/HTTPS封面优先，默认按slug稳定映射，不随文章顺序变化', () => {
  const slugs = ['about-huaixuji', 'markdown-writing-guide', 'huaixuji-deployment-guide']
  const defaults = slugs.map(coverFallback)
  assert.equal(new Set(defaults).size, 3)
  assert.ok(defaults.every(src => localCovers.includes(src)))
  assert.deepEqual([...slugs].reverse().map(coverFallback).reverse(), defaults)
  for (const src of ['/images/my-cover.webp', 'https://img.example.com/covers/a.webp?v=1']) {
    assert.equal(resolveArticleCover(src, slugs[0]), src)
  }
  assert.equal(resolveArticleCover('', slugs[0]), defaults[0])
})

test('封面解析不发fetch/HEAD，三篇正式文章绑定不同且存在的本地封面', async () => {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (...args) => { calls.push(args); throw new Error('封面不能进行跨域探测') }
  try {
    for (const src of ['', '/images/my-cover.webp', 'https://img.example.com/covers/a.webp']) {
      assert.equal(await resolveArticleCover(src, 'future-post'), src || coverFallback('future-post'))
    }
    const covers = ['about-huaixuji', 'markdown-writing-guide', 'huaixuji-deployment-guide'].map(slug => {
      const raw = fs.readFileSync(new URL(`../docs/posts/2026-10-25-${slug}.md`, import.meta.url), 'utf8')
      const cover = raw.match(/^cover: "([^"]+)"/m)?.[1]
      assert.ok(cover?.startsWith('/images/covers/'), `${slug} 应使用本地封面`)
      assert.ok(fs.existsSync(new URL(`../docs/public${cover}`, import.meta.url)))
      return cover
    })
    assert.equal(new Set(covers).size, 3)
    assert.equal(calls.length, 0)
  } finally { globalThis.fetch = original }
})

test('28 条新增文案按页面/点击选择，旧操作提示保持操作类型，字符只需现有常用分包', () => {
  const tips = JSON.parse(fs.readFileSync(new URL('../docs/.vitepress/theme/live2d/tips.json', import.meta.url), 'utf8'))
  const texts = Object.values(tips.seasonal).flat()
  assert.equal(texts.length, 28)
  assert.equal(new Set(texts).size, 28)
  for (const page of ['post/note.html', 'archive.html', 'category.html', 'tag.html', 'friend.html', 'about.html']) {
    assert.ok(texts.includes(messageFor('page', `/${page}`, 8)))
  }
  assert.equal(tipSource(tips.clickTips.close), 'operation')
  assert.equal(tipSource(tips.waifuClick[0]), 'interaction')
  assert.equal(tipSource(tips.hitokotos[0].hitokoto), 'ambient')
  assert.notEqual(messageFor('click', '/', 8, tips.seasonal.click[0], () => 0), tips.seasonal.click[0])
  const css = fs.readFileSync(new URL('../docs/.vitepress/theme/assets/maple-mono-nf-cn.css', import.meta.url), 'utf8')
  const covered = new Set()
  for (const face of css.match(/@font-face\s*\{[^}]*\}/g)) {
    if (!face.includes('font-weight: 400;') || !/-(latin-symbols|cjk-common)\.woff2/.test(face)) continue
    for (const [, start, end] of face.matchAll(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/g)) {
      for (let cp = parseInt(start, 16); cp <= parseInt(end || start, 16); cp++) covered.add(cp)
    }
  }
  for (const char of texts.join('')) assert.ok(covered.has(char.codePointAt(0)), `新增文案字符不在常用包：${char}`)
})
