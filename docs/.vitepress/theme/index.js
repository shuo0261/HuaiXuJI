/**
 * VitePress 主题入口（对应 aurora-master/src/main.js 的组装职责）
 * 全局样式、字体、布局、进度条均在此装配
 */
import Layout from './Layout.vue'
import './node-shims.js'
import './custom.css'

export default {
  Layout,
  enhanceApp({ app }) {
    // 剥离依赖：原 main.js 中的 vue-progressbar / APlayer / LeanCloud 初始化全部移除
    void app
  },
}
