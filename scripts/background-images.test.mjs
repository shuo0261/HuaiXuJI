import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { collectBackgroundPaths, MAX_BACKGROUND_BYTES } from '../docs/.vitepress/background-images.js'

// 在独立临时目录验证构建清单，不写入用户图片池，也不要求测试文件拥有有效图片内容。
test('缺失或空图片目录生成空清单', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'huaixu-bg-'))
  try {
    assert.deepEqual(collectBackgroundPaths(path.join(directory, 'missing')), [])
    assert.deepEqual(collectBackgroundPaths(directory), [])
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('筛选格式、大小和普通文件，仅输出编码后的路径', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'huaixu-bg-'))
  const warnings = []
  try {
    for (const name of ['a.jpg', 'b.JPEG', 'c.PNG', 'd.webp', 'e.avif', '山 景.png', 'notes.txt', 'ignored.svg']) {
      fs.writeFileSync(path.join(directory, name), 'test fixture')
    }
    fs.mkdirSync(path.join(directory, 'directory.png'))
    fs.writeFileSync(path.join(directory, 'limit.jpg'), Buffer.alloc(MAX_BACKGROUND_BYTES))
    fs.writeFileSync(path.join(directory, 'too-big.png'), Buffer.alloc(MAX_BACKGROUND_BYTES + 1))
    const paths = collectBackgroundPaths(directory, message => warnings.push(message))
    assert.equal(paths.length, 7)
    assert.ok(paths.includes('/img/a.jpg') && paths.includes('/img/e.avif'))
    assert.ok(paths.includes('/img/' + encodeURIComponent('山 景.png')))
    assert.ok(paths.includes('/img/limit.jpg'))
    assert.ok(!paths.some(value => value.includes('too-big') || value.includes('directory')))
    assert.ok(paths.every(value => value.startsWith('/img/') && !value.startsWith('data:')))
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /too-big\.png/)
    assert.equal(fs.statSync(path.join(directory, 'too-big.png')).size, MAX_BACKGROUND_BYTES + 1)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
