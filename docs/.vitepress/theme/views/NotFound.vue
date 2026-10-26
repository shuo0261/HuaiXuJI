<template>
  <section id="not-found" aria-labelledby="not-found-title">
    <h1 id="not-found-title">404 · 页面迷路了</h1>
    <p>迷路了吗？沿着槐花落下的方向，回首页看看吧。</p>
    <a :href="withBase('/')">返回首页</a>
  </section>
</template>

<script setup>
// Layout 在 VitePress 判定页面不存在时展示；原生链接支持键盘与浏览器默认导航，不引入额外资源。
import { withBase } from 'vitepress'
</script>

<style scoped>
#not-found {
  padding: clamp(28px, 6vw, 56px) 24px;
  text-align: center;
  border: 1px solid var(--surface-border);
  border-radius: var(--card-radius);
  background: var(--bg-white-dim);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(10px);
}
h1 { margin: 0; color: var(--heading-color); font-size: clamp(24px, 4vw, 32px); font-weight: 400; }
p { margin: 20px 0 28px; line-height: 1.9; }
a { display: inline-block; padding: 8px 20px; border-radius: var(--card-radius); background: var(--bg-dark); color: var(--link-color); }
a:hover { background: var(--bg-dark-dim); }
</style>
