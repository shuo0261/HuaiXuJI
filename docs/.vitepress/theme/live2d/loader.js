let rendererPromise

/** Footer 在桌面页面加载完毕后的空闲阶段调用；等待本站旧渲染库就绪，避免挂载早于 defer 脚本而漏掉首次初始化。 */
export function loadRenderer(src) {
  if (window.loadlive2d && window.auroraLive2D) return Promise.resolve()
  if (rendererPromise) return rendererPromise
  // 整次访问共用一次加载结果；失败后交由 Footer 隐藏装饰，不自动重试或影响正文。
  rendererPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const timeout = setTimeout(() => finish(new Error('Live2D 脚本加载超时')), 20000)
    function finish(error) {
      clearTimeout(timeout)
      script.onload = script.onerror = null
      if (error) reject(error)
      else resolve()
    }
    script.async = true
    script.fetchPriority = 'low'
    script.src = src
    script.onload = () => finish(window.loadlive2d && window.auroraLive2D ? null : new Error('Live2D 渲染入口缺失'))
    script.onerror = () => finish(new Error('Live2D 脚本加载失败'))
    document.body.appendChild(script)
  })
  return rendererPromise
}
