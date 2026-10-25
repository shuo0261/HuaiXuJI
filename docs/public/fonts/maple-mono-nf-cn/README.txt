Maple Mono NF CN 网页字体

来源：Maple Font 官方稳定版 v7.9
项目：https://github.com/subframe7536/maple-font
发布：https://github.com/subframe7536/maple-font/releases/tag/v7.9
原包：https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-NF-CN-unhinted.zip
原始文件：MapleMono-NF-CN-Regular.ttf、MapleMono-NF-CN-Bold.ttf
版权：Copyright 2022 The Maple Mono Project Authors
许可：SIL Open Font License 1.1，原包 LICENSE.txt 随本目录分发；字体内部版权信息保留。

本地处理说明

使用 FontTools 将官方 NF CN 字体转为 WOFF2，并按 Unicode 范围分包。
未修改字形和字体名称；两个字重均保留原字体全部 33091 个 Unicode 字符。
400 对应 Regular，700 对应 Bold，不声明原文件不支持的可变字重范围。
所有文字区域与代码区使用同一字体；Fontello 仍仅负责原有装饰图标。

每个字重的 CSS 使用 20 个按需文件（并非一次全部请求）：
- latin-symbols：1504 个非私用区字符，包含拉丁、数字、CJK 常用标点（U+3000–U+303F）等；
- nerd-symbols：3499 个 BMP 私用区图符，仅在正文实际包含对应字符时加载；
- cjk-common：GB2312 范围内的 6763 个常用汉字；
- cjk-extended-script：232 个假名、组合标记等字符；23 条 ccmp 假名组合规则的输入、输出保留在同一包中；
- cjk-extended-han-01 至 12：14213 个其余汉字按码点排序等量拆分，前 11 包各 1185 字，末包 1178 字；
- cjk-extended-nerd-01 至 04：6880 个增补私用区图符，每包 1720 字，继续只在实际使用时请求。

此前整份 cjk-extended 还包含增补私用区图符，并非只有汉字。现在不按当前页面文案裁字，
而按完整字库的文字类别及码点顺序拆分；扩展汉字不会顺带下载增补图符。
原有 latin-symbols、cjk-common、nerd-symbols 六个文件字节不变。
原始两个 cjk-extended.woff2 继续保留为对照和生成输入，CSS 不再引用，正常页面不会请求它们。

私用区按 Unicode 的 U+E000–U+F8FF、U+F0000–U+FFFFD、U+100000–U+10FFFD 筛选。
从官方原始 TTF 提取字形，保留全部 OpenType 特性；不以现有文章裁字，不改字形或字宽。
拆分后基础包不再携带 Nerd Font 图符，正常英文和中文标点可直接使用约 70 KB 的基础包。
原有 Fontello 图标继续使用 Fontello，不会触发 Maple 的私用区分包。

当前文件大小（字节，非浏览器传输统计）：
                         Regular/400    Bold/700
latin-symbols                  70284       73172
nerd-symbols                  485924      486100
cjk-common                   1663388     1700548
cjk-extended（保留整包）      4163480     4239852
cjk-extended-script            38336       38240
cjk-extended-han（单包范围）  294156–419176 301720–428944
cjk-extended-nerd（单包范围）  91908–108116 91772–108064

主题 assets/maple-mono-nf-cn.css 通过 unicode-range 让浏览器按实际文字下载。
分包不依赖当前文章内容，未来新增文章仍能使用原字库中的全部字符。
字体文件由本站静态目录提供，未使用 local() 或运行时 CDN。
常用的「。」「、」「「」「」」放在基础符号包，避免普通文章因标点触发约 4 MB 的扩展包。
字体 URL 的 v 参数是文件 SHA256 前 12 位，修改字体时同步更新声明，避免旧文件缓存与新字符范围混用。
生产预览当前返回 Cache-Control: no-cache 和 ETag，浏览器可复用缓存并通过 304 验证。
实际上线缓存策略由托管服务控制；若配置长缓存，应将完整 URL（含版本参数）作为缓存键，更新资源时同步更新版本。
加载阶段使用 font-display: swap，让页面先显示后备字体。
生成工具只在资源准备阶段使用，项目运行和构建不需要额外字体依赖。

此前基础包优化的 2 Mbps 冷访问验证（2026-10-23，非本次扩展包对比）

Chrome 本地生产预览，下载限速 250000 字节/秒、延迟 50ms、不限 CPU；每种页面/屏幕各测两次。
两组均重新构建并使用同一张 320218 字节背景，未改背景、封面、布局或正文。
下表为字体请求传输量及“首个字体请求开始至最后一个响应结束”的实测均值，不是理论带宽推算：
1440px 首页：2219000 -> 1734272 字节，11.61 -> 9.66 秒；2 个字体请求。
390px  首页：2219000 -> 1734272 字节，11.53 -> 9.65 秒；2 个字体请求。
1440px 文章：3919848 -> 3435120 字节，18.36 -> 16.49 秒；3 个字体请求。
390px  文章：3919848 -> 3435120 字节，18.35 -> 16.47 秒；3 个字体请求。
文章样本：/post/vue3-script-setup-tips.html。每页均少下载 484728 字节，未增加首屏请求数。
font-display 仍为 swap，正文可先以备用字体显示；上述耗时不等于首次看到文字的时间。
首页热访问两个字体均以 304 复用正文，ResourceTiming 合计 600 字节验证开销；未修改服务端缓存策略。
完整字库/实际中文字源/代码等宽检查通过，四组页面全部文字排版尺寸与修改前一致。

扩展包离线重建（2026-10-25）

在项目根目录运行：
python scripts/split-maple-extended.py --source-zip <已有的官方 v7.9 MapleMono-NF-CN-unhinted.zip>

本次离线工具使用 FontTools 4.60.2 和 Brotli 1.2.1；不加入 npm 依赖，不参与网站运行或生产构建。
工具读取本目录保留整包的字符范围，并从官方原始 TTF 提取字形；仅生成 34 个新扩展文件及更新 CSS 管理区块。
固定输入、工具版本及原字体时间戳，相同命令重跑产生相同文件字节与 SHA256 URL 版本。
可通过 --output-dir、--css-output、--manifest 将候选文件和统计输出到项目外，先验证再替换。
本轮分别重建两次核对全部输出，并核对两个字重的扩展字符轮廓、字宽、ccmp 及完整字符覆盖。

扩展包优化的 2 Mbps 冷访问验证（2026-10-25）

Chrome 本地生产预览，250000 字节/秒、50ms 延迟、不限 CPU；背景及其他资源保持一致。
分类页每尺寸各两次冷访问，装饰语「桜華月想 暮色蒼然」中的桜、華、蒼触发扩展包。
字体 transferSize：两个尺寸均为 5898052 -> 2439448 字节（减少 58.64%），3 -> 4 个请求。
1440px 字体就绪：28.130 -> 13.246 秒；390px：28.455 -> 13.266 秒，均为两次均值。
“字体就绪”指导航开始到 DOMContentLoaded 后 document.fonts.ready 兑现，并非首次文字可见。
热访问字体正文由 304 复用，四次实测就绪均值约 0.338 秒；ResourceTiming 验证开销 900 -> 1200 字节。
首页仍为 1734272 字节/2 个字体请求，文章仍为 3435120 字节/3 个；未额外请求扩展包。
1440px/390px 首页、分类、文章六组文字排版尺寸一致；两个字重共 52 个中英文、标点、代码、图符及假名组合样本像素与字宽一致。

仅重建扩展包时使用以上脚本；更新字体版本时需要重新核对全部分包及 CSS，不可只替换某个 TTF。
保留原始字体、本文件及 LICENSE.txt。
不能用仅含西文字形的 Maple Mono 或 Maple Mono NF 替代。
