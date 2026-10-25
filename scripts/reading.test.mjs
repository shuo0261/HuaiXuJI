import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import MarkdownIt from 'markdown-it'
import { articleHeadings, assignHeadingIds } from '../docs/.vitepress/theme/article-headings.js'
import { coverFallback, isRandomCover } from '../docs/.vitepress/theme/article-covers.js'

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

test('普通显式封面和带自定义参数的地址保持优先，本地三张封面不同', () => {
  assert.equal(isRandomCover('https://t.alcy.cc/ysz'), true)
  assert.equal(isRandomCover('https://t.alcy.cc/ysz?fixed=1'), false)
  assert.equal(isRandomCover('/images/my-cover.webp'), false)
  assert.equal(new Set([0, 1, 2].map(coverFallback)).size, 3)
})

test('随机接口一次取池，重复和超预算回退；同次浏览复用选择，不使用时间戳', async () => {
  const { resolveArticleCover, cachedArticleCover } = await import('../docs/.vitepress/theme/article-covers.js?test-pool')
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method || 'GET' })
    if (url.includes('/json?')) return new Response(JSON.stringify({ links: ['https://images.test/small.webp', 'https://images.test/small.webp', 'https://images.test/large.webp'] }))
    return new Response(null, { headers: { 'content-type': 'image/webp', 'content-length': url.includes('large') ? '3000000' : '1024' } })
  }
  try {
    const url = 'https://t.alcy.cc/ysz'
    const covers = await Promise.all([0, 1, 2].map(index => resolveArticleCover(url, `post-${index}`, index)))
    assert.deepEqual(covers, ['https://images.test/small.webp', coverFallback(1), coverFallback(2)])
    assert.equal(await resolveArticleCover(url, 'post-0', 0), covers[0])
    assert.equal(cachedArticleCover(url, 'post-0'), covers[0])
    assert.equal(await resolveArticleCover('/my.webp', 'explicit', 0), '/my.webp')
    assert.equal(calls.filter(call => call.method === 'GET').length, 1)
    assert.equal(calls.filter(call => call.method === 'HEAD').length, 2)
    assert.equal(calls[0].url, 'https://t.alcy.cc/json?ys=3')
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
