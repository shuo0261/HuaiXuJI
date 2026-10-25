import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const MAX_BACKGROUND_BYTES = 3_000_000
const imagesDirectory = fileURLToPath(new URL('../public/img/', import.meta.url))
const supportedExtension = /\.(jpe?g|png|webp|avif)$/i

/**
 * VitePress 配置在启动开发服务和生产构建时调用；只扫描图片池顶层的普通文件。
 * 清单只保存访问路径，超大图片只提示并跳过，绝不改写或压缩用户原图。
 */
export function collectBackgroundPaths(directory = imagesDirectory, warn = console.warn) {
  if (!fs.existsSync(directory)) return []
  const paths = []
  const oversized = []
  const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    if (!entry.isFile() || !supportedExtension.test(entry.name)) continue
    if (fs.statSync(path.join(directory, entry.name)).size > MAX_BACKGROUND_BYTES) {
      oversized.push(entry.name)
      continue
    }
    paths.push(`/img/${encodeURIComponent(entry.name)}`)
  }
  if (oversized.length) {
    warn(`[背景] 跳过 ${oversized.length} 张超过 3 MB 的图片：${oversized.slice(0, 3).join('、')}${oversized.length > 3 ? '…' : ''}`)
  }
  return paths
}

/** 将构建清单作为一个极小的虚拟模块交给 Layout，不额外请求清单或预加载整个图片池。 */
export function backgroundImagesPlugin() {
  const paths = collectBackgroundPaths()
  const moduleId = 'virtual:background-images'
  const resolvedId = `\0${moduleId}`
  return {
    name: 'huaixu-background-images',
    resolveId(id) {
      if (id === moduleId) return resolvedId
    },
    load(id) {
      if (id === resolvedId) return `export default ${JSON.stringify(paths)}`
    },
  }
}
