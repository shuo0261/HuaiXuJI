/**
 * 工具函数，移植自 aurora-master/src/utils/index.js
 * 追加 timeago（替代 timeago.js 依赖的 zh_CN 语料），补充 SSR 环境守卫
 */

/**
 * Layout 经 store.updateMobileState 在挂载和缩放阶段调用。
 * 使用与 CSS 相同的媒体查询，让导航隐藏与返回按钮显示在同一断点切换；
 * 不用正文宽度判断，避免滚动条宽度或旧的 876px 阈值造成平板没有返回入口。
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

/**
 * 生成范围内随机整数
 */
export const random = (a, b) => parseInt(Math.random() * (b - a + 1) + a, 10)

/**
 * Fisher–Yates Shuffle 洗牌算法
 */
export const shuffle = (array) => {
  let m = array.length
  let i
  while (m) {
    i = Math.floor(Math.random() * m--)
    ;[array[m], array[i]] = [array[i], array[m]]
  }
  return array
}

/**
 * url 转换
 */
export const getLocation = (href) => {
  const a = document.createElement('a')
  a.href = href
  return a
}

/**
 * 日期转换
 */
export const parseTime = (time, format = '{y}-{m}-{d} {h}:{i}:{s}') => {
  const date = new Date(time)
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 相对时间（移植 timeago.js zh_CN 语料）
 */
export const timeago = (time) => {
  const date = new Date(time)
  const diff = (Date.now() - date.getTime()) / 1000
  const dispose = (value, unit) => `${parseInt(value)}${unit}前`
  if (diff < 60) return '刚刚'
  const minutes = diff / 60
  if (minutes < 60) return dispose(minutes, '分钟')
  const hours = minutes / 60
  if (hours < 24) return dispose(hours, '小时')
  const days = hours / 24
  if (days < 30) return dispose(days, '天')
  const months = days / 30
  if (months < 12) return dispose(months, '个月')
  return dispose(months / 12, '年')
}

/**
 * 写入缓存
 */
export const localSave = (key, value) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}

/**
 * 读取缓存
 */
export const localRead = (key, defaultValue = '') => {
  if (typeof localStorage === 'undefined') return defaultValue
  return localStorage.getItem(key) || defaultValue
}

/**
 * 图片 cdn 加速，只对时雨个人使用（原样保留，域名不匹配时原样返回）
 */
const isMe = typeof location !== 'undefined' && location.host.includes('chanshiyu.com')
const GithubPrefix = 'raw.githubusercontent.com/chanshiyucx/yoi/master'
const JSDriverPrefix = 'cdn.jsdelivr.net/gh/chanshiyucx/yoi@latest'
export const fileCDN = (url) => {
  if (isMe && url.includes(GithubPrefix)) {
    return url.replace(GithubPrefix, JSDriverPrefix)
  }
  return url
}

/**
 * 图片尺寸处理
 */
export const handleImg = (href) => {
  const urlParams = new URLSearchParams(href.split('?')[1])
  const vw = urlParams.get('vw')
  const vh = urlParams.get('vh')
  const widthHint = Number(vw)
  const heightHint = Number(vh)

  // MarkDown 的服务端渲染和浏览器首帧共用原始宽高，为正文图下载前预留比例。
  // 成对标注 vw/vh 时让 CSS 自适应宽度和高度，避免依赖 main 的宽度造成水合后变形或跳动。
  if (Number.isFinite(widthHint) && widthHint > 0 && Number.isFinite(heightHint) && heightHint > 0) {
    return { style: 'height: auto;', isFull: false, width: widthHint, height: heightHint }
  }

  // 未标注完整宽高的旧图片继续使用原有展示规则，不要求改写其他文章。
  if (typeof document === 'undefined') return { style: '', isFull: false }
  const main = document.querySelector('main')
  if (!main) return { style: '', isFull: false }
  const clientWidth = main.clientWidth

  // 是否预设尺寸
  let style = ''
  let width = vw
  let height = vh
  let isFull = false
  if (width) {
    width = Number(width)
    if (width > clientWidth) {
      width = clientWidth
      isFull = true
    }
    style += `width: ${width}px;`

    // 在设置宽度的情况下判断高度
    if (height) {
      height = (height * width) / vw
      style += `height: ${height}px;`
    }
  }
  return { style, isFull }
}
