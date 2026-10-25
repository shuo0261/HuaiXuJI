import tips from './tips.json'

const ambient = new Set(tips.hitokotos.map(item => item.hitokoto))
const clicks = new Set(tips.waifuClick)
export const tipSource = text => ambient.has(text) ? 'ambient' : clicks.has(text) ? 'interaction' : 'operation'

/** Store 在现有空闲/点击/路由事件触发时调用；只选本地文案，不触碰 Footer、模型或原有定时循环。 */
export function messageFor(kind, path, hour, previous = '', random = Math.random) {
  const key = /^\/post\//.test(path) ? 'post' : path.replace(/^\//, '').replace(/\.html$/, '')
  const period = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'night'
  const groups = tips.seasonal
  const pool = kind === 'welcome' ? groups.welcome : kind === 'click' ? groups.click
    : kind === 'page' ? groups[key] || groups.welcome
      : [...(groups[key] || []), ...groups[period], ...groups.reading]
  const candidates = pool.filter(text => text !== previous)
  return candidates[Math.floor(random() * candidates.length)] || pool[0]
}
