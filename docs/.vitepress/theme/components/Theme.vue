<template>
  <div class="theme">
    <h3>随机风景</h3>
    <p>每次打开或刷新网站时随机选择背景。</p>
    <p>站内浏览保持当前风景。</p>
  </div>
</template>

<!-- Panel 的背景说明页不展示图片池缩略图，避免打开面板时下载未选中的背景。 -->
<style scoped>
.theme {
  padding: 14px 12px;
  line-height: 2;
}
.theme h3 {
  margin-bottom: 14px;
  font-size: var(--font-size-larger);
  font-weight: var(--font-weight-normal);
}
</style>
