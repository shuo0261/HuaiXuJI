"""维护者离线重建扩展 WOFF2 与 CSS；不参与 npm 构建，也不给网页增加字体加载依赖。"""
import argparse
import hashlib
import io
import json
import math
import re
import zipfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

PROJECT = Path(__file__).resolve().parents[1]
FONT_DIR = PROJECT / 'docs/public/fonts/maple-mono-nf-cn'
CSS_FILE = PROJECT / 'docs/.vitepress/theme/assets/maple-mono-nf-cn.css'
BEGIN = '/* 扩展字库分包开始：由 scripts/split-maple-extended.py 离线生成。 */'
END = '/* 扩展字库分包结束。 */'


def unicode_ranges(codepoints):
    """CSS 生成阶段合并连续码点；范围与实际 cmap 一致，避免浏览器下载不需要的包。"""
    result = []
    start = previous = None
    for value in sorted(codepoints):
        if previous is None or value != previous + 1:
            if previous is not None:
                result.append(f'U+{start:X}' if start == previous else f'U+{start:X}-{previous:X}')
            start = value
        previous = value
    if previous is not None:
        result.append(f'U+{start:X}' if start == previous else f'U+{start:X}-{previous:X}')
    return ','.join(result)


def partition(codepoints):
    """按字库自身码点分组，不读取文章或页面；后续写作仍覆盖全部既有字符。"""
    private = sorted(cp for cp in codepoints if 0xE000 <= cp <= 0xF8FF or 0xF0000 <= cp <= 0xFFFFD or 0x100000 <= cp <= 0x10FFFD)
    script = sorted(cp for cp in codepoints if cp < 0x3400)
    han = sorted(codepoints - set(private) - set(script))
    groups = [('script', script)]
    # 固定 12 份汉字、4 份增补图符，在下载量和请求开销间取简单折中；不按当前三个字符特制小包。
    for prefix, values, count in [('han', han, 12), ('nerd', private, 4)]:
        size = math.ceil(len(values) / count)
        groups.extend((f'{prefix}-{index + 1:02}', values[index * size:(index + 1) * size]) for index in range(count))
    assert all(values for _, values in groups)
    assert len(set.union(*(set(values) for _, values in groups))) == len(codepoints)
    assert sum(len(values) for _, values in groups) == len(codepoints)
    return groups


def composition_glyphs(font, script):
    """v7.9 扩展包只有假名 ccmp 合字；所有组合输入、输出整体留在脚本包，避免跨字体文件破坏组合。"""
    cmap = font.getBestCmap()
    assert [record.FeatureTag for record in font['GSUB'].table.FeatureList.FeatureRecord] == ['ccmp']
    glyphs = set()
    for lookup in font['GSUB'].table.LookupList.Lookup:
        assert lookup.LookupType == 4, '字体版本或特性结构改变，请先核对分包规则'
        for table in lookup.SubTable:
            for first, ligatures in table.ligatures.items():
                glyphs.add(first)
                for ligature in ligatures:
                    glyphs.update(ligature.Component)
                    glyphs.add(ligature.LigGlyph)
    assert {cp for cp, glyph in cmap.items() if glyph in glyphs} <= set(script)
    return glyphs


def generate(source_zip, output_dir, css_output, manifest_path=None):
    """仅写新分包和指定 CSS；现有整包、英文、常用汉字、Nerd 包与许可均不覆盖。"""
    output_dir.mkdir(parents=True, exist_ok=True)
    faces = []
    manifest = []
    archive = zipfile.ZipFile(source_zip)
    for style, weight in [('Regular', 400), ('Bold', 700)]:
        source_path = FONT_DIR / f'MapleMono-NF-CN-{style}-cjk-extended.woff2'
        # 固定原字体时间戳，保证相同输入与工具版本重跑得到相同字节和 URL 版本。
        original = TTFont(source_path, recalcTimestamp=False)
        assert original['OS/2'].usWeightClass == weight
        assert '7.9' in original['name'].getDebugName(5)
        groups = partition(set(original.getBestCmap()))
        composition_glyphs(original, groups[0][1])
        # 直接从已有官方原包读取 TTF，避免每份都重新做整包 WOFF2 反变换；不下载或改写原始资源。
        source_bytes = archive.read(f'MapleMono-NF-CN-{style}.ttf')
        for group, codepoints in groups:
            font = TTFont(io.BytesIO(source_bytes), recalcTimestamp=False)
            assert font['OS/2'].usWeightClass == weight and '7.9' in font['name'].getDebugName(5)
            options = subset.Options()
            options.layout_features = ['*']
            options.layout_scripts = ['*']
            options.name_IDs = ['*']
            options.name_languages = ['*']
            options.name_legacy = True
            # 沿用现有 WOFF2 省略调试字形名的方式；字形、布局特性及 name 表中的版权/许可信息仍保留。
            options.glyph_names = False
            options.notdef_outline = True
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=codepoints)
            subsetter.subset(font)
            font.flavor = 'woff2'
            filename = f'MapleMono-NF-CN-{style}-cjk-extended-{group}.woff2'
            destination = output_dir / filename
            assert destination.resolve() != source_path.resolve()
            font.save(destination)
            actual = TTFont(destination)
            assert set(actual.getBestCmap()) == set(codepoints)
            version = hashlib.sha256(destination.read_bytes()).hexdigest()[:12]
            faces.append(f'''@font-face {{
  font-family: 'Maple Mono NF CN';
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url('/fonts/maple-mono-nf-cn/{filename}?v={version}') format('woff2');
  unicode-range: {unicode_ranges(codepoints)};
}}''')
            manifest.append({'file': filename, 'weight': weight, 'characters': len(codepoints), 'bytes': destination.stat().st_size, 'version': version})
            print(filename, len(codepoints), destination.stat().st_size, flush=True)
    css = CSS_FILE.read_text(encoding='utf-8')
    # 重跑只替换本工具管理的区块；其余字体声明与可能存在的用户内容保持原样。
    if BEGIN in css:
        assert END in css, '生成区块缺少结束标记，请先核对 CSS'
        css = re.sub(re.escape(BEGIN) + r'[\s\S]*?' + re.escape(END), '', css)
    css = re.sub(r'@font-face\s*\{[^}]*\}', lambda match: '' if '-cjk-extended.woff2' in match[0] else match[0], css)
    css_output.parent.mkdir(parents=True, exist_ok=True)
    css_output.write_text(css.rstrip() + '\n\n' + BEGIN + '\n' + '\n'.join(faces) + '\n' + END + '\n', encoding='utf-8')
    if manifest_path:
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-zip', type=Path, required=True, help='已有官方 MapleMono-NF-CN-unhinted.zip v7.9')
    parser.add_argument('--output-dir', type=Path, default=FONT_DIR)
    parser.add_argument('--css-output', type=Path, default=CSS_FILE)
    parser.add_argument('--manifest', type=Path)
    arguments = parser.parse_args()
    generate(arguments.source_zip, arguments.output_dir, arguments.css_output, arguments.manifest)
