import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { readPostSources } from '../docs/.vitepress/post-source.js'
import { validateArtalk } from '../docs/.vitepress/artalk-config.js'
import { createSeoHead } from '../docs/.vitepress/seo.js'

test('开启评论必须有合法公开配置，关闭允许空值', () => {
  validateArtalk({ enable: false })
  for (const config of [{ server: '', site: '槐序霁' }, { server: 'ftp://test', site: '槐序霁' }, { server: 'https://user:password@test', site: '槐序霁' }, { server: 'https://test', site: '' }]) {
    assert.throws(() => validateArtalk({ enable: true, ...config }), /Artalk/)
  }
  validateArtalk({ enable: true, server: 'https://comments.test', site: '槐序霁' })
})

test('所有分享图在 public 和 dist 中一致、尺寸正确且内容不同', () => {
  const hashes = new Set()
  for (const { slug } of readPostSources()) {
    const png = fs.readFileSync(new URL(`../docs/public/og/${slug}.png`, import.meta.url))
    assert.equal(png.readUInt32BE(16), 1200)
    assert.equal(png.readUInt32BE(20), 630)
    assert.ok(png.length > 10000 && png.length < 500000)
    assert.deepEqual(png, fs.readFileSync(new URL(`../docs/.vitepress/dist/og/${slug}.png`, import.meta.url)))
    hashes.add(crypto.createHash('sha256').update(png).digest('hex'))
  }
  assert.equal(hashes.size, readPostSources().length)
})

test('OG 与 Twitter 共享正式图片地址；域名留空不生成无效链接', () => {
  const options = { title: '中文 English！', description: '摘要', cover: '/og/note.png', pagePath: '/post/note.html' }
  const head = createSeoHead({ ...options, siteUrl: 'https://configured.test' })
  assert.equal(head.find(([, attrs]) => attrs.property === 'og:image')[1].content, 'https://configured.test/og/note.png')
  assert.equal(head.find(([, attrs]) => attrs.name === 'twitter:image')[1].content, 'https://configured.test/og/note.png')
  assert.ok(!createSeoHead({ ...options, siteUrl: '' }).some(([, attrs]) => attrs.property === 'og:image' || attrs.name === 'twitter:image'))
})
