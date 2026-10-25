import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import matter from 'gray-matter'
import { getSiteUrl } from '../docs/.vitepress/site.js'
import { createSeoHead, transformPageData, writeRobots } from '../docs/.vitepress/seo.js'

const values = (head, property) => head.filter(([tag, attrs]) => tag === 'meta' && attrs.property === property).map(([, attrs]) => attrs.content)

test('未配置正式域名时不输出地址，也不保留旧的重复 SEO 标签', () => {
  const head = createSeoHead({ title: '文章', description: '摘要', pagePath: '/post/note.html', type: 'article', siteUrl: '',
    head: [['link', { rel: 'canonical', href: 'https://chanshiyu.com' }], ['meta', { property: 'og:title', content: '旧标题' }], ['meta', { name: 'description', content: '旧摘要' }]] })
  assert.equal(head.some(([tag, attrs]) => tag === 'link' && attrs.rel === 'canonical'), false)
  assert.deepEqual(values(head, 'og:url'), [])
  assert.deepEqual(values(head, 'og:title'), ['文章'])
  assert.deepEqual(values(head, 'og:description'), ['摘要'])
  assert.deepEqual(values(head, 'og:type'), ['article'])
  assert.equal(head.some(([, attrs]) => attrs.name === 'description'), false)
})

test('地址和相对封面由同一个正式 URL 派生；外部封面无需正式域名', () => {
  // .test 仅是纯函数测试输入，不写入站点配置或生产产物。
  const siteUrl = getSiteUrl('https://configured.test/')
  const head = createSeoHead({ title: '文章', description: '摘要', pagePath: '/post/note.html', cover: '/images/cover.webp', siteUrl })
  assert.equal(head.find(([tag]) => tag === 'link')[1].href, 'https://configured.test/post/note.html')
  assert.deepEqual(values(head, 'og:url'), ['https://configured.test/post/note.html'])
  assert.deepEqual(values(head, 'og:image'), ['https://configured.test/images/cover.webp'])
  const external = createSeoHead({ title: '文章', description: '摘要', pagePath: '/post/note.html', cover: '//cdn.jsdelivr.net/cover.jpg', siteUrl: '' })
  assert.deepEqual(values(external, 'og:image'), ['https://cdn.jsdelivr.net/cover.jpg'])
  assert.deepEqual(values(createSeoHead({ title: '文章', description: '', cover: '/cover.webp', siteUrl: '' }), 'og:image'), [])
})

test('正式站点地址拒绝本地、示例和旧站域名，空配置可以正常构建', () => {
  assert.equal(getSiteUrl(''), '')
  for (const value of ['http://localhost:5173', 'https://example.com', 'https://chanshiyu.com', 'http://127.0.0.1']) {
    assert.throws(() => getSiteUrl(value))
  }
})

test('本地文章直接复用 Frontmatter 标题和摘要，不改变文章模型或路由', () => {
  const directory = new URL('../docs/posts/', import.meta.url)
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.md'))
  assert.ok(files.length > 0)
  for (const file of files) {
    const { data } = matter(fs.readFileSync(new URL(file, directory), 'utf8'))
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
    const page = transformPageData({ title: '文章', description: '', relativePath: `post/${slug}.md`, params: { slug }, frontmatter: { title: '文章' } })
    assert.equal(page.title, data.title)
    assert.equal(page.description, data.description)
    assert.deepEqual(values(page.frontmatter.head, 'og:title'), [data.title])
    assert.deepEqual(values(page.frontmatter.head, 'og:description'), [data.description])
    assert.deepEqual(values(page.frontmatter.head, 'og:type'), ['article'])
    const expectedImage = createSeoHead({ title: data.title, description: data.description, cover: String(data.cover || '') })
    assert.deepEqual(values(page.frontmatter.head, 'og:image'), values(expectedImage, 'og:image'))
  }
})

test('随机封面不作为永久 OG 图；正式域名已知时使用本地稳定分享图，否则省略图片地址', () => {
  const options = { title: '项目介绍', description: '真实摘要', cover: 'https://t.alcy.cc/ysz', pagePath: '/post/about-huaixuji.html' }
  assert.deepEqual(values(createSeoHead({ ...options, siteUrl: '' }), 'og:image'), [])
  assert.deepEqual(values(createSeoHead({ ...options, siteUrl: 'https://configured.test' }), 'og:image'), ['https://configured.test/assets/apple-touch-icon.png'])
})

test('robots 生产文件的 sitemap 地址随正式 URL 生成，缺失时省略', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'huaixu-seo-'))
  const file = path.join(directory, 'robots.txt')
  try {
    writeRobots({ outDir: directory }, '')
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /^Sitemap:/m)
    writeRobots({ outDir: directory }, getSiteUrl('https://configured.test'))
    assert.match(fs.readFileSync(file, 'utf8'), /^Sitemap: https:\/\/configured\.test\/sitemap\.xml$/m)
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file)
    fs.rmdirSync(directory)
  }
})
