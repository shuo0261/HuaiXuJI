<template>
  <div class="markdown" v-html="html" @click="copyCode"></div>
</template>

<script setup>
/**
 * MarkDown，移植自 aurora-master/src/components/MarkDown/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 剥离依赖：marked → markdown-it（需求指定）；复制使用浏览器 Clipboard API，不恢复 clipboard 插件
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
const copyTimers = new Map()
let disposed = false

// 文章正文的 SSR 与客户端共用此输出；围栏和缩进代码块都保留原始文本，按钮不混入 code 节点。
function renderCode(code, lang = '') {
  const button = props.target === '#post'
    ? '<button type="button" class="code-copy" aria-label="复制代码"><span class="copy-label" role="status" aria-live="polite">复制</span></button>'
    : ''
  const language = lang ? ` class="hljs language-${md.utils.escapeHtml(lang)}"` : ''
  return `<pre class="hljs">${button}<code${language}>${md.utils.escapeHtml(code)}</code></pre>`
}

// v-html 里的原生按钮由根节点代理点击（键盘激活也产生 click）；只读取 code.textContent，避免复制 HTML 或提示文案。
async function copyCode(event) {
  const button = event.target?.closest?.('button.code-copy')
  if (!button || !event.currentTarget.contains(button) || button.dataset.copying) return
  const code = button.closest('pre')?.querySelector('code')
  if (!code) return
  clearTimeout(copyTimers.get(button))
  button.dataset.copying = 'true'
  let message
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
    await navigator.clipboard.writeText(code.textContent)
    message = '已复制'
  } catch {
    // 权限拒绝、非安全上下文或系统复制失败都明确反馈失败，不用成功提示掩盖。
    message = '复制失败'
  } finally {
    delete button.dataset.copying
  }
  if (disposed || !button.isConnected) return
  const label = button.querySelector('.copy-label')
  label.textContent = message
  copyTimers.set(button, setTimeout(() => {
    label.textContent = '复制'
    copyTimers.delete(button)
  }, 2000))
}

// markdown-it 实例：html 允许（原文兼容），高亮用简化实现（保持 hljs 类名输出）
let IMG_ID = 0

const md = new MarkdownIt({
  html: true,
  linkify: false,
  highlight: renderCode,
})
md.renderer.rules.code_block = (tokens, idx) => renderCode(tokens[idx].content)

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
    // 图片直接展示；代码复制由根节点事件代理处理，无需逐次查找和绑定按钮。
    document.querySelectorAll('.markdown .img-zoomable').forEach((img) => {
      img.style.opacity = 1
    })
  })
}

watch(() => props.content, renderMarkdown, { immediate: true })

onBeforeUnmount(() => {
  disposed = true
  copyTimers.forEach(clearTimeout)
  copyTimers.clear()
})
</script>
