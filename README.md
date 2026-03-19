# 模型 Q - 质量评估控制平台 (Model Q)

模型质量评估控制平台（Model Q）是一个基于 Vue 3 和 Vite 构建的前端演示项目。该系统提供了一个现代化的、响应式的控制面板，用于展示、评估和对比不同模型的质量指标。当前所有数据均为 Mock 演示数据，支持纯前端离线预览。

## ✨ 核心特性

- **概览 (Dashboard)**: 关键质量指标总览，结合 ECharts 提供直观的数据可视化。
- **模型库 (Models)**: 管理和展示各类模型及其核心参数配置。
- **评估 (Evaluate)**: 执行模型质量评估，支持不同模型之间的对比分析。
- **历史 (History)**: 追踪和记录过往的评估历史。
- **设置 (Settings)**: 偏好配置与评估阈值管理。
- **现代化 UI**: 包含诸如 `NeonButton` 等带有微光渐变和阴影的定制化组件，带来科技感十足的视觉体验。
- **统一路由**: 所有业务页面统一挂载在 `/model_q` 路由下，确保应用访问路径一致性。

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **数据可视化**: [ECharts](https://echarts.apache.org/)

## 📂 项目结构

```text
src/
├── components/   # 可复用的 UI 组件 (如 NeonButton, PanelCard) 和图表组件 (EChart)
├── mock/         # 离线演示数据及模拟服务接口 (支持完全离线展示)
├── router/       # Vue Router 路由配置
├── shell/        # 页面整体布局外壳 (AppShell，含侧边栏和顶栏)
├── utils/        # 工具函数 (数据格式化、时间处理等)
├── views/        # 核心业务视图 (概览、模型库、评估、历史、设置等)
├── App.vue       # 根组件
└── main.ts       # 应用入口点
```

## 🚀 快速开始

### 1. 安装依赖

推荐使用 `pnpm` 安装依赖（项目中已包含 `pnpm-lock.yaml`）：

```bash
pnpm install
```

*(如果使用 npm 或 yarn 也可以)*

### 2. 启动开发服务器

启动带有模块热替换（HMR）的本地开发环境：

```bash
pnpm run dev
```

### 3. 构建生产版本

执行类型检查并打包生产版本文件到 `dist` 目录：

```bash
pnpm run build
```

### 4. 本地预览

在本地预览构建后的产物：

```bash
pnpm run preview
```
