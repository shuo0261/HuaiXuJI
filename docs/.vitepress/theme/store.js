/**
 * 组合式 Store，替代 aurora-master/src/store.js 的 Vuex
 * 仅保留本地运行所需的全局状态（一言 / 文章总数 / 看板开关 / 顶部进度条）
 * GitHub Issues 与 LeanCloud 相关 action 全部剥离
 */
import { reactive } from 'vue'
import { isMobile as isMobileFn } from './utils'
import { tipSource, messageFor } from './live2d/messages.js'

let tipsTimer = ''
let tipsKind = 'operation'
let welcomed = false
let pendingPage = ''

export const store = reactive({
  tips: '',
  tipsUpdateAt: '',
  totalCount: 0,
  showPanel: false,
  progress: 0,
  progressShow: false,
  // 对应原 Vue.prototype.$isMobile = Vue.observable({ value: isMobile() })
  // 初始为 false 保证 SSR 与首帧渲染一致，挂载后由 Layout 更新
  isMobile: false,
})

/**
 * 更新移动端状态（窗口 resize 时由 Layout 调用）
 */
export const updateMobileState = () => {
  store.isMobile = isMobileFn()
}

/**
 * 显示一言
 */
export const showTips = ({ tips, kind }) => {
  if (typeof tips !== 'string' || !tips) return
  const source = kind || tipSource(tips)
  // 现有操作/加载提示优先；自动问候和普通点击不会打断它，路由只保留最后一个待展示页面。
  if (source !== 'operation' && store.tips && tipsKind === 'operation') return
  if (source === 'ambient' && !kind) {
    tips = messageFor(welcomed ? 'ambient' : 'welcome', window.location.pathname, new Date().getHours(), store.tips)
    welcomed = true
    pendingPage = ''
  } else if (source === 'interaction') {
    tips = messageFor('click', window.location.pathname, new Date().getHours(), store.tips)
  }
  clearTimeout(tipsTimer)
  tipsKind = source
  store.tips = tips
  store.tipsUpdateAt = new Date()
  tipsTimer = setTimeout(() => {
    store.tips = ''
    flushPageTips()
  }, 6000)
}

function flushPageTips() {
  if (!pendingPage || !welcomed || store.tips || typeof window === 'undefined' ||
      window.matchMedia('(max-width: 767px)').matches || !window.auroraLive2D?.isReady()) return
  const path = pendingPage
  pendingPage = ''
  showTips({ tips: messageFor('page', path, new Date().getHours()), kind: 'ambient' })
}

/** Layout 路由展示阶段调用；复用 showTips 的六秒结束事件，不新增轮询或另一套提示定时器。 */
export function queuePageTips(path) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(max-width: 767px)').matches) { pendingPage = ''; return }
  pendingPage = path
  flushPageTips()
}

/**
 * 设置文章总数
 */
export const setTotalCount = (totalCount) => {
  store.totalCount = totalCount
}

/**
 * 设置是否显示看板
 */
export const setShowPanel = (status) => {
  store.showPanel = status
}

/**
 * 顶部进度条（替代 vue-progressbar，配色 #b28fce / 4px 与原配置一致）
 */
export const progressStart = () => {
  store.progress = 0
  store.progressShow = true
}

export const progressSet = (percent) => {
  if (!store.progressShow) store.progressShow = true
  store.progress = Math.max(0, Math.min(100, percent))
}

export const progressFinish = () => {
  store.progress = 100
  setTimeout(() => {
    store.progressShow = false
  }, 500)
  setTimeout(() => {
    store.progress = 0
  }, 1000)
}
