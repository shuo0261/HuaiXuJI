/**
 * 本地 Markdown 数据层，替代 aurora-master/src/utils/services.js（GitHub API）与 store.js
 * 使用 import.meta.glob 读取 docs/posts/*.md 原文，gray-matter 解析 front-matter
 * 输出与原 Aurora 格式对齐的文章对象（id / number / title / labels / milestone / cover / created_at / body / description）
 */
import matter from 'gray-matter'
import { parseTime } from './utils'
import { store, setTotalCount } from './store'
import config from './config'
import { coverFallback } from './article-covers.js'

// 发布时间统一格式化为 YYYY-MM-DD（en-CA locale 原生输出即此格式，无需 dayjs）
const dateFmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })

// 读取本地文章原文（数据源目录：docs/posts/*.md）
// 注：{ as: 'raw' } 语法在 Vite 5 起被弃用（运行返回空），故叠加现代等价写法 query: '?raw' 合并兜底
const rawFiles = {
  ...import.meta.glob('../../posts/*.md', { as: 'raw' }),
  ...import.meta.glob('../../posts/*.md', { eager: true, query: '?raw', import: 'default' }),
}

/**
 * 解析单篇 front-matter，映射为 Aurora 文章结构
 * front-matter 约定：
 *   title: 文章标题（必填）
 *   date: 发布时间（必填，支持 Date / 'YYYY-MM-DD'）
 *   category: 分类（对应原 milestone，可选）
 *   tags: 标签数组（可选）
 *   cover: 封面图地址（可选，未填写时选单篇固定的本地封面）
 *   coverTitle: 封面标题文字（可选，回退 title）
 *   description: 摘要（可选，回退正文首段）
 *   hot: 热度数值（可选，默认 1）
 */
const formatPost = (number, raw, coverIndex) => {
  const { data, content } = matter(raw)
  const title = String(data.title || '未命名文章')
  const date = data.date ? new Date(data.date) : new Date()

  const body = content.trim()
  const description =
    data.description || body.split('\n').find((line) => line.trim() && !line.trim().startsWith('<')) || ''

  const cover = {
    // 原版语义：标题条右侧 span 是独立副标（如"Promise | 4412字"字数标签），
    // 不回退为标题本身，否则 h3 与 span 渲染同一句话造成"文字重复"
    title: data.coverTitle || '',
    // 索引构建时保留显式地址；默认与失败兜底按 slug 固定分配，文章重排不会让图片变化。
    src: data.cover || coverFallback(number),
    fallback: coverFallback(number),
    key: number,
    index: coverIndex,
  }

  return {
    // 与原 GitHub Issue 字段对齐
    id: number,
    number,
    title,
    body,
    description,
    cover,
    created_at: dateFmt.format(date),
    createdRaw: parseTime(date, '{y}-{m}-{d}'),
    labels: (data.tags || []).map((name, index) => ({ id: `${number}-${index}`, name })),
    milestone: data.category ? { title: data.category } : null,
    times: data.hot || 1,
  }
}

/**
 * 一次性解析全部文章，按时间倒序（原 Aurora 即按 issue 创建时间倒序）
 */
const loadAll = () => {
  const posts = Object.keys(rawFiles).sort()
    .map((path, index) => {
      // 文件名约定：YYYY-MM-DD-title.md（如 2021-08-01-hello-aurora.md）
      const matched = path.match(/\/(\d{4}-\d{2}-\d{2})-([^/]+)\.md$/)
      const number = matched ? matched[2] : path
      return formatPost(number, rawFiles[path], index)
    })
    .filter((o) => o.number)
  posts.sort((a, b) => (a.createdRaw < b.createdRaw ? 1 : -1))
  return posts
}

let allPosts = null

const getAllPosts = () => {
  if (!allPosts) {
    allPosts = loadAll()
    setTotalCount(allPosts.length)
  }
  return allPosts
}

/**
 * 分页获取文章列表（对应原 queryPosts）
 */
export const queryPosts = ({ page = 1, pageSize = 10, filter } = {}) => {
  let posts = getAllPosts()
  if (filter) {
    if (filter.milestone) posts = posts.filter((o) => o.milestone && o.milestone.title === filter.milestone)
    if (filter.label) posts = posts.filter((o) => o.labels.some((l) => l.name === filter.label))
  }
  const start = (page - 1) * pageSize
  return posts.slice(start, start + pageSize)
}

/**
 * 获取文章总数（对应原 queryArchivesCount）
 */
export const queryArchivesCount = (filter) => {
  if (!filter) {
    getAllPosts()
    return store.totalCount
  }
  let posts = getAllPosts()
  if (filter.milestone) posts = posts.filter((o) => o.milestone && o.milestone.title === filter.milestone)
  if (filter.label) posts = posts.filter((o) => o.labels.some((l) => l.name === filter.label))
  return posts.length
}

/**
 * 获取单篇文章（对应原 queryPost）
 */
export const queryPost = (number) => {
  return getAllPosts().find((o) => String(o.number) === String(number))
}

/**
 * 获取分类列表（对应原 queryCategory，GitHub milestones）
 */
export const queryCategory = () => {
  const posts = getAllPosts()
  const map = {}
  posts.forEach((o) => {
    const title = o.milestone ? o.milestone.title : null
    if (!title) return
    if (!map[title]) {
      const opts = config.categories[title] || {}
      map[title] = {
        id: title,
        number: title,
        title,
        open_issues: 0,
        summary: opts.summary || title,
        cover: opts.cover || config.defaultCover,
      }
    }
    map[title].open_issues += 1
  })
  return Object.values(map)
}

/**
 * 获取标签列表（对应原 queryTag，GitHub labels）
 */
export const queryTag = () => {
  const posts = getAllPosts()
  const map = {}
  posts.forEach((o) => {
    o.labels.forEach((label) => {
      if (!map[label.name]) {
        map[label.name] = { id: label.name, name: label.name, color: 'b28fce' }
      }
    })
  })
  return Object.values(map)
}

/**
 * 获取关于页段落（对应原 queryPage('about')）
 */
export const queryAbout = () => config.about

/**
 * 获取友链列表（对应原 queryPage('friend')）
 */
export const queryFriends = () => config.friends

/**
 * 文章热度（本地静态，对应原 queryHot / increaseHot）
 */
export const queryHot = (ids) => {
  const posts = getAllPosts()
  const hot = {}
  posts.forEach((o) => {
    if (ids.includes(o.id)) hot[o.id] = o.times
  })
  return hot
}
