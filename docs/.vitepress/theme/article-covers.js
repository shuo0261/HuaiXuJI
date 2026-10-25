export const localCovers = ['/images/covers/grove.svg', '/images/covers/writing.svg', '/images/covers/cloud.svg']
export const coverFallback = (index = 0) => localCovers[index % localCovers.length]

export function isRandomCover(src) {
  try {
    const url = new URL(src)
    return url.hostname === 't.alcy.cc' && /^\/ysz\/?$/.test(url.pathname) && !url.search
  } catch { return false }
}

const choices = new Map()
const resolved = new Map()
let pool
const MAX_IMAGE_BYTES = 256 * 1024

async function request(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, priority: 'low' })
    if (!response.ok) throw new Error('封面接口未就绪')
    return response
  } finally { clearTimeout(timer) }
}

/** Cover 挂载时调用；只针对没有请求参数的既有随机接口，普通显式 cover 原样优先，不改 Frontmatter 或 SEO 输入。 */
export function resolveArticleCover(src, key, index) {
  if (!isRandomCover(src)) return Promise.resolve(src)
  const cacheKey = `${src}|${key}`
  if (!choices.has(cacheKey)) {
    // 同次浏览仅请求一份官方多图 JSON；不用时间戳，不在渲染时重抽，不把接口视为保证无重复的服务。
    pool ||= request('https://t.alcy.cc/json?ys=3').then(r => r.json()).then(async (data) => {
      const links = data.links || (Array.isArray(data.data) ? data.data.map(item => item.link) : [data.data?.link])
      const used = new Set()
      return Promise.all(links.slice(0, 3).map(async (link) => {
        if (typeof link !== 'string' || !/^https:\/\//i.test(link) || used.has(link)) return ''
        used.add(link)
        try {
          // 原接口可返回数 MB 原图；2 Mbps 下先用轻量 HEAD 检查大小，超预算或缺少可读大小时使用独立本地封面。
          const response = await request(link, { method: 'HEAD', cache: 'force-cache' })
          const size = Number(response.headers.get('content-length'))
          return size > 0 && size <= MAX_IMAGE_BYTES && response.headers.get('content-type')?.startsWith('image/') ? link : ''
        } catch { return '' }
      }))
    }).catch(() => [])
    choices.set(cacheKey, pool.then(links => {
      const selected = links[index] || coverFallback(index)
      resolved.set(cacheKey, selected)
      return selected
    }))
  }
  return choices.get(cacheKey)
}

export const cachedArticleCover = (src, key) => resolved.get(`${src}|${key}`)
