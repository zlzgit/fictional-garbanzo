# 模型质量评估控制平台（前端）

一个无需后端即可完整演示的“模型质量评估控制平台”前端应用：使用 Vue 3 + Vite 构建，通过 Mock 数据提供模型库、评估执行、历史追踪与可视化能力。

## 技术栈

- Vue 3 + TypeScript
- Vue Router（所有页面路径统一以 `/model_q` 为前缀）
- ECharts（可视化）
- pnpm（依赖管理）

## 本地运行

### 1) 安装依赖

```bash
pnpm install
```

如果 pnpm 提示存在被忽略的 build scripts（例如 `esbuild`），需要执行：

```bash
pnpm approve-builds
```

然后在交互列表中允许必要依赖（通常勾选 `esbuild` 即可）。

### 2) 启动开发环境

```bash
pnpm dev
```

默认访问：

- http://localhost:5173/model_q/dashboard

### 3) 构建与预览

```bash
pnpm build
pnpm preview
```

## 功能入口

所有页面统一使用 `/model_q` 前缀：

- `/model_q/dashboard`：概览与趋势
- `/model_q/models`：模型库（含详情弹窗）
- `/model_q/evaluate`：执行评估（含对比报告弹窗）
- `/model_q/history`：评估历史（含详情弹窗）
- `/model_q/settings`：阈值策略与偏好

## Mock 数据说明

- Mock 数据由前端内存 store 生成，刷新页面会重置
- 评估执行会把新 Run 写入内存 store，便于在“历史/概览”中联动展示

## 需求落实（对应交付要求）

- 路由前缀统一：所有页面均以 `/model_q` 开头，`/` 自动重定向到 `/model_q/dashboard`
- 布局与滚动：底部栏固定；中间内容区使用浏览器原生滚动（body 禁用滚动）
- 阈值策略页：支持“保存设置/恢复默认”（保存到 localStorage，刷新可回显）
- 模型库：已移除“导入模型”入口
- 文案：页面内部分英文展示已中文化（指标/状态/混淆矩阵等）
- 导航：左侧导航位置已上移，与右侧内容卡片齐平

## 交付轨迹

详见：[轨迹.md](./轨迹.md)
