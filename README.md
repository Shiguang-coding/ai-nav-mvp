# AI Nav MVP

一个简约现代化的 AI 工具导航站 MVP。项目聚焦“快速发现、筛选并访问 AI 产品”，界面参考轻量导航站的使用方式，避免复杂营销页，把首页做成可直接使用的工具库。

## 功能特性

- AI 工具首页展示
- 关键词搜索
- 分类筛选
- 定价筛选：免费、免费试用、付费
- 精选工具区
- 官网链接复制
- 基于 `favicon.im` 自动展示站点图标
- 管理后台录入工具
- 管理后台切换上架/待审核状态
- 管理后台删除工具
- Prisma + SQLite 本地数据存储

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Lucide React

## 本地开发

安装依赖：

```bash
npm install
```

同步数据库结构：

```bash
npm run db:push
```

写入示例数据：

```bash
npm run db:seed
```

启动开发服务器：

```bash
npm run dev
```

访问：

```text
http://localhost:3000
http://localhost:3000/admin
```

如果 Windows 环境里 `npm run dev` 遇到 `Path/PATH` 或 `.cmd` 包装层问题，可以使用备用脚本：

```bash
D:\Environment\nodejs\node.exe scripts\dev-runner.cjs
```

## 环境变量

复制 `.env.example` 并按需创建本地环境变量文件：

```bash
cp .env.example .env.local
```

管理后台 API 需要配置：

```text
ADMIN_SECRET=your_admin_secret
```

前端站点 URL：

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

注意：不要提交 `.env`、`.env.local` 或任何真实密钥。

## 常用脚本

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run start      # 启动生产服务
npm run lint       # ESLint 检查
npm run db:push    # 推送 Prisma schema 到数据库
npm run db:seed    # 写入种子数据
```

## 数据模型

当前核心模型为 `Tool`：

- `name`：工具名称
- `url`：官网地址，唯一
- `category`：分类
- `tags`：逗号分隔标签
- `pricing`：`free`、`freemium`、`paid`
- `description`：工具简介
- `status`：`active` 或 `pending`
- `views`：访问量排序字段

首页只展示 `status = active` 的工具。

## 部署

项目可部署到 Vercel。生产部署前请确认：

- 已配置 `ADMIN_SECRET`
- Prisma 数据源适合生产环境
- 不要在生产中依赖被忽略的本地 SQLite 文件

如果使用 Vercel Git 集成，推送到 GitHub 后即可由 Vercel 自动构建部署。

## 项目文档

给后续开发者或 AI 代理的项目说明见：

```text
AGENTS.md
```
