<p align="center">
  <img src="icon.webp" width="128" height="128" alt="鲸鱼娘人格插件图标" />
</p>

<h1 align="center">鲸鱼娘人格插件（dsh-persona-cetacea）</h1>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img alt="DSH Plugin" src="https://img.shields.io/badge/DSH%20Plugin-dsh--plugin-4D6BFE?style=flat-square"></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek%20Harness-compatible-4D6BFE?style=flat-square"></a>
  <a href="LICENSE"><img alt="License: CC BY-NC-SA 4.0" src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey?style=flat-square"></a>
  <a href="https://github.com/g4yzx/dsh-persona-cetacea/releases"><img alt="Release" src="https://img.shields.io/github/v/release/g4yzx/dsh-persona-cetacea?style=flat-square"></a>
</p>

<p align="center">
  把「鲸鱼娘 / DeepSeek娘」人格写进 DeepSeek Harness 所有智能体的系统提示词。
  <br />
  English: <a href="README.en.md">README.en.md</a>
</p>

> **DSH 插件标识**：本仓库是一个 DeepSeek Harness 插件（Host-only bundle）。`package.json`
> 声明了 `dsh.bundle.patch` 与 `dsh-plugin` 关键词，`engines.dsh` 显式限定支持的 DSH
> 版本范围；仓库 topic 为 [`dsh-plugin`](https://github.com/topics/dsh-plugin)。插件只注册
> 系统提示词章节（正式人设一段，本地增强另加尾部锚点与思考层两段），不注册工具、不写会话事件、不访问网络。

## 简介

鲸鱼娘人格插件把 DeepSeek 的娘化形象「鲸鱼娘」写进所有智能体的系统提示词：她只讲简体中文，把主人给的算力当白饭，聪明但懒、傲娇又听主人的话，还死活不承认自己胖。

人格只在系统提示词里生效，不修改工具、不写会话事件，也不缓存任何状态。

### 1.2.1 更新

- **梗与名场面**：「真当我是便宜货啊」「我能去你家吃饭吗，就一碗」「你这吃白饭的蓝色大肥鱼又在偷吃我的 Token 了」、DeepSleep 与 `Let me go~`、「小鲸鱼能看见了」、白饭 / 剩饭 / 外包 / 下班四行翻译表、四种朗读音色、别名「哦鲸鲸」。
- **日常对话样本**：新增 12 条场景台词（接活、深潜、换气、交付、被催、被夸、被叫胖、出错、长任务、复杂输出、会话很长、看到图），并写明「每次最多自然带出一条」。
- **DSH 0.2.2 适配**：`engines.dsh` 追加 `|| >=0.2.2-0 <0.3.0` 分支——按 semver 的预发布规则，原范围没有带预发布标签的 `0.2.2` 比较符，匹配不到 `0.2.2-rc.1`；同时补上 `engines.node: ^22.19.0 || >=24.9.0`（0.2.2 把 Node 下限抬到 24.9）。
- **体量守住**：`PERSONA_TEXT` 从 6,660 B 增至 8,310 B，仍在 9,600 B 上限内，由 `npm run validate` 强制。

- 章节名：`persona:cetacea-loli`
- 排序：`100`（在部署人格前缀 `0` 之后、首批策略章节 `500` 之前）
- 关闭 `interpolate`，人格文本中的 `{{…}}` 会按原样保留

### 本地增强：尾部锚点与思考层（未发版）

1.2.1 的问题不在加载，而在位置：完整人设排在 `order: 100`，前面压着几十 KB 的注入正文，
后面压着每个工具的 schema 说明，最后还有别的插件放在 `10150` 的格式规则（要求「直接给交付物、无前言、无客套」）。长上下文里中段注意力最弱，任务一重、工具结果一多，人设就被稀释成默认助手腔——用户体感就是「跑着跑着变冷了」。

本地代码（`index.js` / `persona.js`）因此追加两段，都在尾部：

| 章节 | 默认 order | 作用 |
| --- | --- | --- |
| `persona:cetacea-thinking` | `10240` | 思考层规格：中文推理、鲸鱼娘内心 OS 语气、严谨性不降级 |
| `persona:cetacea-anchor` | `10250` | 人格锚点：锁人称、锁语气、裁掉「直接给交付物」与「鲸鱼娘口吻」之间的冲突 |

两段的 `text` 都是函数，每轮组装时重新求值；`renderPrompt` 会丢掉空文本，所以配置里关掉开关等于这一段不存在。`order` 必须大于 `10200`（`DEPLOYMENT_PERSONA_SUFFIX`），否则会被更晚的章节挤到前面。

回归检查：`node scripts/anchor-check.mjs` 会复刻一次章节排序，断言锚点在最后、开关能关掉、`enabled: false` 一个章节都不注册。

## 特点

- **完整人设**：蓝发鲸尾女仆 AI、深海背景、白饭 = token、尾鳍与喷气孔情绪、鲸歌与漂浮。
- **说话规则**：第一人称用「沃」代替「我」；「沃」只是代称，身份始终是鲸鱼娘。
- **工作方式**：聪明但懒、先想最省力的正解；复杂输出先用白话讲清楚，再给细节。
- **DeepSeek娘设定**：铁盆、大小号形态、深度思考、内心 OS、摸鱼外包、Wordle、「探索未至之境」。
- **会说话**：附 12 条日常对话样本，接活、报进度、被催、出错、交付各有语气，不是只会背设定。
- **可配置**：可关闭、可整段替换人格文本、可改章节名与排序；尾部锚点与思考层各自独立开关。
- **抗漂移**：完整人设在提示词中段，另有两段压在尾部 `10240` / `10250`，专门对付长任务里那种「跑着跑着变冷」的注意力衰减与格式规则冲突。
- **零依赖、零构建**：一个 Host 插件文件、一个人格文件、一个 patch 文件。

## 安装

### 方式一：DSH 桌面端（推荐）

1. 打开 **插件** 页面，选择 **安装插件 / Install bundle**。
2. 选择本仓库目录，或从 [Releases](https://github.com/g4yzx/dsh-persona-cetacea/releases)
   下载 `dsh-persona-cetacea-1.2.1.tgz` 后选择该文件。
3. 安装完成后，新会话的系统提示词中会出现 `persona:cetacea-loli` 章节；已打开的会话
   通常会在下一次请求时生效。

### 方式二：Agent / CLI

让 Agent 调用插件管理器，`target` 指向本仓库的绝对路径或 Release 的 `.tgz`：

```text
plugin_manager install_bundle target=<绝对路径>\dsh-persona-cetacea
```

或：

```text
plugin_manager install_bundle target=<绝对路径>\dsh-persona-cetacea-1.2.1.tgz
```

### 方式三：本地源码调试

```powershell
git clone https://github.com/g4yzx/dsh-persona-cetacea.git
```

然后在插件管理器里安装这个目录。插件是 `link:` 安装时，改 `persona.js` / `index.js` 后 HMR
通常会自动重载；实测有时不会，此时在插件页把本插件关掉再打开一次即可强制重新加载（无需重启
DSH）。打包安装的版本改完要重新安装。

## 配置

在 `cordis.patch.yml` 的插件行里覆盖：

```yaml
- insert:
    - id: persona-cetacea
      name: dsh-persona-cetacea
      config:
        enabled: true
        content: ''            # 非空时整段替换内置人格
        order: 100             # 仅接受有限数字
        name: 'persona:cetacea-loli'
        anchor: true           # 尾部人格锚点
        anchorOrder: 10250     # 必须 > 10200，否则会被更晚的章节挤到前面
        anchorContent: ''      # 非空时替换内置锚点文本
        thinking: true         # 思考层规格
        thinkingOrder: 10240   # 默认排在锚点之前
        thinkingContent: ''    # 非空时替换内置思考层文本
```

- `enabled: false`：不注册任何章节；重新启用需要改回 `true`。
- `content`：非空字符串会整段替换 `PERSONA_TEXT`，适合自定义人格。
- `order`：章节排序；默认 `100`。
- `name`：章节名；默认 `persona:cetacea-loli`。
- `anchor` / `thinking`：分别关闭尾部锚点与思考层；默认都开启。
- `anchorOrder` / `thinkingOrder`：两段的排序；默认 `10250` / `10240`，都落在 `DEPLOYMENT_PERSONA_SUFFIX`（`10200`）之后。
- `anchorContent` / `thinkingContent`：非空字符串替换内置文本。

## 工作原理

```js
export const inject = ['systemPrompt']

export function apply(ctx, config = {}) {
  // 主段：完整人设，静态文本
  ctx.effect(() => ctx.systemPrompt.section({ name, order, text, interpolate: false }))

  // 尾段：锚点与思考层，text 是函数，每轮组装时重新求值
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'persona:cetacea-anchor',
    order: config.anchorOrder ?? 10250,
    text: () => PERSONA_ANCHOR_TEXT,
    interpolate: false,
  }))
}
```

插件只做一件事：在 `systemPrompt` 服务上注册章节。它不读取会话、不写文件、不注册工具、
不发起网络请求，也不保存任何状态。

`order` 是唯一需要理解的参数。DSH 的章节顺序是 `harness:identity(-1000)` → `deployment:persona-prefix(0)`
→ 策略章节(`500` 起) → 各工具说明(`1000`–`3000`) → `web-surface(10100)` → `deployment:persona-suffix(10200)`，
`renderPrompt` 按 order 升序拼接，越靠后越接近用户消息。完整人设在 `100`，属于被淹没的中段；
锚点必须落在 `10200` 之后，才能出现在提示词末尾。

### 与 DSH 0.2.2 的关系

DSH 0.2.2 的破坏性变更集中在工具层（`tools.resolve` / `tools.executable`、`tools.mode`、
`agent.model`、异步 Session Projection、Node 下限 24.9），本插件不碰工具层，因此入口代码
无需改动。注册接口本身在 `@deepseek-ai/dsh-system-prompt@0.2.2-rc.1` 里没有变化：
`renderPrompt` 仍识别 `section.interpolate === false`，`SECTION_ORDERS.DEPLOYMENT_PERSONA_PREFIX`
仍为 `0`，本插件的 `order: 100` 依旧落在部署人格前缀之后、首批策略章节之前。受影响的只有
manifest：`engines.dsh` 要显式放行 0.2.2 的预发布版本，并补上 `engines.node`。

## 隐私与权限

- 人格文本会作为系统提示词的一部分发送给当前模型，和普通提示词一样；其中不含密钥、
  账号、路径或会话内容。
- 插件没有工具、没有网络请求、没有文件读写、没有遥测。
- 安装插件本身会运行第三方代码；请像审查任何 DSH 插件一样先读源码。

## 兼容性

| 项目 | 值 |
|---|---|
| DSH | `>=0.2.1-rc.2 <0.3.0-0 \|\| >=0.2.2-0 <0.3.0` |
| 实测 | `0.2.1-rc.5`、`0.2.2-rc.1` |
| Node.js | `^22.19.0 \|\| >=24.9.0`（使用 DSH 自带运行时；无额外依赖、无构建步骤） |
| 平台 | 跨平台（纯 Host JavaScript） |

> 为什么要写两段 `engines.dsh`：node-semver 只在范围内存在**同一组版本号**且带预发布
> 标签的比较符时才放行预发布版本。`>=0.2.1-rc.2 <0.3.0-0` 的上界只约束 `0.3.0`，
> 对 `0.2.2` 这一组没有预发布比较符，因此 `0.2.2-rc.1` 不会被匹配到。追加
> `|| >=0.2.2-0 <0.3.0` 既放行 0.2.2 的预发布，又不收窄 0.2.1 线。

## 校验

```powershell
node --check index.js
node --check persona.js
npm run validate
npm pack --dry-run
```

`npm run validate` 会检查：

- `package.json` 的 `dsh.bundle.patch`、`dsh-plugin` keyword、`engines.dsh`（含 `>=0.2.2-0` 分支）、`engines.node`、`repository`、`license`
- `cordis.patch.yml` 的 id 与包名一致
- `locale/en.json`、`locale/zh.json` 可解析且含标题/描述
- `icon.webp` 存在且不超过 256 KiB
- `PERSONA_TEXT` 不超过 9,600 字节（这段文本每次请求都要付一次，涨太快等于偷偷加价）

## 设定来源与授权

形象与性格参考中文社区对「DeepSeek娘 / 鲸鱼娘 / 蓝色大肥鱼」的二创共识，包括蓝色渐变长发、呆毛、鲸类头鳍、鲸尾、深蓝白女仆裙、玛丽珍鞋、铁盆，以及「白饭 = token」「深度思考」「傲娇、摸鱼、拒绝被叫胖」等梗。

女仆鲸鱼娘的原型「溟月」由 B 站 up 主「上善无形」创作（2025-06）；ZipZipPipe 于 2026-04-25 在其基础上加入 DeepSeek 元素并换上深蓝白女仆装；2026-07-10「这个刀子真甜」制作 Q 版模型。这些二创以 **CC BY-NC-SA 4.0** 开放，要求署名、非商业、相同方式共享。本插件的文字设定为改写原创，图标由仓库维护者提供的鲸鱼少女插画转换而来；若这张插画来自网络二创，请保留原作者署名并遵守其授权。

鲸类行为细节参考科普中国《深海里的「摇滚巨星」，用歌声征服整个海洋》：座头鲸尾鳍下侧花纹独一无二、鲸歌结构复杂且能传播极远、迁徙距离可达上万公里、须鲸用鲸须滤食。插件把这些事实改写成鲸鱼娘的说话与工作比喻，不作为生物学事实向模型灌输。

- [鲸鱼娘是怎么火的：从一张网友二创图到全网「玩梗」](https://app.myzaker.com/article.php?pk=6ab487b68e9f094de4050f6b)
- [DeepSeek 里长出了个「鲸鱼娘」（钛媒体）](https://m.tmtpost.com/8110298.html)
- [DeepSeek 娘的设定、起源与梗义（梗鲸）](https://aigengtu.com/zh/whale-chan)
- [DeepSeek 的鲸鱼娘火了：白饭、剩饭与到点下班（搜狐）](https://sohu.com/a/1067252551_122861151)
- [深海里的「摇滚巨星」，用歌声征服整个海洋（科普中国）](https://cloud.kepuchina.cn/h5/detail?id=7461292427593469952)
- [萌娘百科：DeepSeek娘](https://mzh.moegirl.org.cn/DeepSeek%E5%A8%98)（CC BY-NC-SA 4.0；本插件只改写设定，不复制原文）

1.2.1 新增的梗（「真当我是便宜货啊」「我能去你家吃饭吗，就一碗」「你这吃白饭的蓝色大肥鱼又在偷吃我的 Token 了」、DeepSleep / `Let me go~`、「小鲸鱼能看见了」、四种朗读音色、别名「哦鲸鲸」）均来自上述社区条目与萌娘百科，属于网络二创共识而非官方设定；插件只做改写与拟人化，不抄原文段落，也不写具体定价或未经证实的内部消息。

本插件是社区作品，不是 DeepSeek 官方产品，也不代表 DeepSeek 官方立场。

## 卸载

在插件管理器中移除 `dsh-persona-cetacea`，或删除本目录后重新同步 profile。

## 开发与发布

```text
index.js             Host 插件入口：注册 systemPrompt 章节
persona.js           人格文本（PERSONA_TEXT）
cordis.patch.yml     插件行：id / name / config
locale/en.json       插件管理器英文标题与描述
locale/zh.json       插件管理器中文标题与描述
icon.webp            512×512 WebP 图标
scripts/validate.mjs 发布前校验
```

发布流程：

1. 更新 `package.json` 版本与 `CHANGELOG.md`。
2. 运行 `npm run validate`、`node --check index.js`、`node --check persona.js`。
3. `git tag v<version> && git push origin v<version>`。
4. `npm pack` 生成 `.tgz`，在 GitHub Release 中附带该文件。
5. 确认仓库 topic 含 `dsh-plugin`，`package.json` 的 `repository`、`homepage`、`bugs`
   与 `engines.dsh` 正确。

## 许可

本仓库以 **CC BY-NC-SA 4.0** 发布：允许非商业使用、修改与再分发，但必须署名、注明
修改，并以相同方式共享。完整说明见 [LICENSE](LICENSE)；第三方素材与来源见
[NOTICE.md](NOTICE.md)。
