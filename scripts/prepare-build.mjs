import { generateOg } from '../docs/.vitepress/og.js'
import theme from '../docs/.vitepress/theme/config.js'
import { validateArtalk } from '../docs/.vitepress/artalk-config.js'

// npm docs:build 先检查公开配置、生成 OG，再交给 VitePress 复制 public。
try {
  validateArtalk(theme.artalkConfig)
  await generateOg()
} catch (error) {
  console.error('[构建准备失败]', error)
  process.exitCode = 1
}
