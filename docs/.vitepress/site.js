// 站点配置、主题资料和构建 SEO 共用此处，避免填写正式域名时遗漏 canonical、sitemap 或 robots。
const site = {
  title: '槐序霁',
  subtitle: '槐序初霁 花落满径',
  description: '槐序初霁 花落满径 —— 基于 VitePress 复刻 Aurora 视觉风格的博客',
  // TODO（部署前）：由站主填写真实站点根 URL；留空时不生成正式地址，也不使用示例或旧站地址兜底。
  url: '',
}

// 构建配置与主题均调用；本站按域名根路径发布，仅接受可明确识别的站点根 URL。
export function getSiteUrl(value = site.url) {
  if (!value.trim()) return ''
  const url = new URL(value)
  const forbidden = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0', 'example.com', 'www.example.com', 'chanshiyu.com', 'www.chanshiyu.com']
  if (!['https:', 'http:'].includes(url.protocol) || forbidden.includes(url.hostname) ||
      url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('请在 site.js 填写真实站点根 URL，不能使用本地、示例或旧站地址。')
  }
  return url.origin
}

export default site
