/**
 * 浏览器端 Node 兼容垫片
 * gray-matter 的 toFile 在每次解析时都会调用 Buffer.from（utils.toBuffer），
 * 浏览器环境无全局 Buffer，需在主题其它模块之前注入 polyfill。
 */
import { Buffer } from 'buffer'

if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer
}
