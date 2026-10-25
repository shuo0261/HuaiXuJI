Live2D 资源与维护说明

现有实现继承自 Aurora：https://github.com/chanshiyucx/aurora
使用 Cubism 2 系列的 WebGL 渲染器；沿用既有 Pio/Tia 外观与按钮，不新增框架或模型 API。

本站资源：
- /live2d/live2d.min.js：既有渲染库，保留原头部信息；Footer 按桌面端需求异步加载。
- /live2d/moc/pio.moc、tia.moc：项目原有模型，只有实际选中的模型被请求。
- /live2d/mtn/：项目原有动作，优先复用预读缓存。
- docs/.vitepress/theme/live2d/waifu.json、tips.json：本地配置与提示，随主题构建。
- docs/.vitepress/theme/live2d/costume.json：现有服装清单，贴图仍来自 i0.hdslb.com；没有运行时模型 API。

素材权限待办：
本目录原先没有模型、服装贴图对应的授权说明；Aurora 的代码许可不能直接作为这些素材的再分发许可。
相关模型集合上游声明模型版权归原作者，仅供研究学习、不得商用：
https://github.com/fghrsh/live2d_api#版权声明
目前未确认现有贴图的本地托管与再分发授权，所以本轮没有下载、镜像或增加模型素材。
后续取得授权及对应许可文件后，可将获准贴图放入本目录 textures/，并把 costume.json 中相应 URL
改为相对于 /live2d/ 的路径（例如 textures/tia.png）；渲染器已支持相对路径，不需要更换框架。
保留素材作者、来源和许可，不要把第三方代码许可套用于模型或贴图。

2026-10-25 生命周期修复：
Footer.vue 等待页面 load 后的空闲阶段，再由 loader.js 等待本站脚本加载完成。
手机断点直接读取真实 matchMedia，不以 store 的 SSR 桌面初值决定下载。
模型、贴图未就绪时隐藏装饰区；20 秒超时或脚本失败即停止，不自动重试，不影响正文。
站内路由保留 Footer，不重建模型；关闭、切换手机或组件卸载时清理任务及渲染器。

旧压缩脚本仅补了小范围接口，不重写 SDK：
- auroraLive2D.isReady()：由 Footer 轮询当前模型 initialized/updating 状态。
- auroraLive2D.dispose()：取消绘制帧、移除鼠标/触摸监听、释放当前模型并清空画布。
- RAF 保留句柄并检查运行标志，确保 dispose 后不会继续绘制。
- 动作播放按预读时的文件路径取缓存，避免每次空闲循环重复请求同一个动作。
脚本 URL 使用 ?v=20261025-lifecycle1；后续修改该文件时同步更新 Footer 中的版本，避免旧缓存缺少接口。
