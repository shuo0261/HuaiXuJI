<template>
  <div class="markdown" v-html="html"></div>
</template>

<script setup>
/**
 * MarkDown，移植自 aurora-master/src/components/MarkDown/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 剥离依赖：marked → markdown-it（需求指定）；移除 zooming / clipboard / katex / 自带 highlight 库
 * 自定义 renderer 保持原 HTML 输出结构（标题图标、img-box 图片容器、table-wrapper、代码复制按钮）
 */
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import { fileCDN, handleImg } from '../utils'
import { assignHeadingIds } from '../article-headings.js'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '',
  },
})

const html = ref('')

// markdown-it 实例：html 允许（原文兼容），高亮用简化实现（保持 hljs 类名输出）
let IMG_ID = 0

const md = new MarkdownIt({
  html: true,
  linkify: false,
  highlight: (code, lang) => {
    // 保持与原主题相同的 hljs 类名结构；具体配色由 code.scss 提供
    if (lang) {
      return `<pre class="hljs"><code class="hljs language-${lang}">${md.utils.escapeHtml(code)}</code></pre>`
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// 标题：注入 Fontello 图标（原 renderer.heading：图标在文字前）
const headingIcon = (level) => ['gift', 'pagelines', 'pilcrow'][level - 2] || 'pilcrow'
md.core.ruler.after('inline', 'aurora_heading_icon', (state) => {
  state.tokens.forEach((tok) => {
    if (tok.type !== 'heading_open') return
    const level = Number(tok.tag.slice(1))
    if (level < 2) return
    const icon = headingIcon(level)
    // 找到紧随的 inline token，在其子节点开头插入图标
    const idx = state.tokens.indexOf(tok)
    const inline = state.tokens[idx + 1]
    if (inline && inline.type === 'inline') {
      const iconToken = new state.Token('html_inline', '', 0)
      iconToken.content = `<i class="icon icon-${icon}"></i>`
      inline.children.unshift(iconToken)
    }
  })
})

// 图片：输出原主题的 img-box 结构（原 renderer.image）
// 只有文章正文启用锚点；摘要继续沿用原输出，避免首页多个摘要生成同名 ID。
md.core.ruler.after('inline', 'aurora_heading_anchors', (state) => {
  if (state.env.articleAnchors) assignHeadingIds(state.tokens)
})

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('src') || ''
  const text = token.content || ''
  const cdnHref = fileCDN(href)

  IMG_ID++
  const { style, isFull, width, height } = handleImg(cdnHref)
  // 正文图由 handleImg 解析已有 vw/vh 约定；SSR 直接输出宽高，懒加载期间也能保持布局稳定。
  const dimensions = width && height ? ` width="${width}" height="${height}"` : ''

  const title = token.attrGet('title')
  const titleHtml = title || text ? `<span class="title">◭ ${title || text}</span>` : ''

  return `<span class="img-box ${isFull ? 'full' : ''}">
  <span class="bg" style="${style}">
    <span class="loading">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </span>
  </span>
  <img class="img-zoomable cursor" style="${style}"${dimensions} loading="lazy" decoding="async" alt="${text}" data-src="${cdnHref}" src="${cdnHref}" />${titleHtml}</span>`
}

// 表格：输出原主题的 table-wrapper 结构（原 renderer.table）
md.renderer.rules.table_open = () => `<div class="table-wrapper">\n<table>\n<thead>\n`
md.renderer.rules.thead_close = () => `</thead>\n<tbody>\n`
md.renderer.rules.table_close = () => `</tbody></table>\n</div>\n`

const renderMarkdown = () => {
  html.value = md.render(props.content || '', { articleAnchors: props.target === '#post' })

  // 对于只是纯解析文字不需要代码高亮和灯箱
  if (!props.target) return
  if (typeof document === 'undefined') return
  nextTick(() => {
    // 原实现中的 hljs 行号 / zooming 灯箱 / 代码复制剥离，图片直接展示
    document.querySelectorAll('.markdown .img-zoomable').forEach((img) => {
      img.style.opacity = 1
    })
  })
}

watch(() => props.content, renderMarkdown, { immediate: true })

onBeforeUnmount(() => {})
</script>
