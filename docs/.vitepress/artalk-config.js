/** 构建入口校验公开评论配置；关闭时允许留空，绝不需要数据库连接信息。 */
export function validateArtalk(config) {
  if (!config.enable) return
  let url
  try { url = new URL(config.server) } catch { throw new Error('[Artalk] 启用时 server 必须是有效 HTTP(S) 地址') }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password || url.search || url.hash || !String(config.site || '').trim()) {
    throw new Error('[Artalk] 请填写 HTTP(S) server 和非空 site；地址不能包含凭据、查询或片段')
  }
}
