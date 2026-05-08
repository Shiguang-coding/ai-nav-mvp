# AGENTS.md

## 项目概览

这是一个名为 `ai-nav-mvp` 的 AI 工具导航站 MVP，目标是做一个简约、现代、信息密度适中的 AI 产品导航网站。项目参考过 `favicon.im` 这类轻量导航/工具站的风格：强调快速搜索、清晰分类、直接访问官网，而不是做营销型落地页。

当前项目使用 Next.js App Router，前台从数据库读取已上架工具，后台提供工具录入、状态切换和删除能力。

## 技术栈

- 框架：Next.js `14.2.4`
- React：React 18
- 语言：TypeScript，`strict: true`
- 样式：Tailwind CSS 3
- 图标：`lucide-react`
- 数据库 ORM：Prisma 5
- 当前 Prisma 数据源：SQLite，本地数据库为 `prisma/dev.db`
- 远程图标：`https://favicon.im/{domain}`
- ESLint：`next/core-web-vitals`

## 主要目录

```text
app/
  layout.tsx                  全局 HTML 结构和 metadata
  page.tsx                    首页服务端组件，从数据库读取 active 工具
  globals.css                 Tailwind 全局样式和通用组件类
  admin/page.tsx              管理后台客户端页面
  api/admin/tools/route.ts    管理后台工具 CRUD API

components/
  ToolDirectory.tsx           首页主交互组件，搜索、分类、定价筛选、卡片展示
  ToolCard.tsx                旧版工具卡片组件，目前首页没有直接使用

lib/
  prisma.ts                   Prisma Client 懒加载单例
  fetch-favicon.ts            域名解析和 favicon.im 图标 URL 生成

prisma/
  schema.prisma               Tool 数据模型
  seed.ts                     本地种子数据脚本
  dev.db                      SQLite 本地数据库，已被 .gitignore 忽略

scripts/
  dev-runner.cjs              绕过 Windows npm/cmd 问题的 Next dev 启动脚本
  dev-server.cmd              Windows 批处理启动脚本，会写 .next/dev-server.log
```

## 常用命令

```powershell
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:seed
```

如果 Windows 环境里 `npm run dev` 遇到 `Path/PATH` 冲突或 `.cmd` 包装层问题，可以尝试：

```powershell
D:\Environment\nodejs\node.exe scripts\dev-runner.cjs
```

或者：

```powershell
scripts\dev-server.cmd
```

默认预览地址：

```text
http://localhost:3000
http://localhost:3000/admin
```

## 环境变量

`.env.example` 中列出了历史/预期变量：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
DIRECT_URL
MEILISEARCH_HOST
MEILISEARCH_MASTER_KEY
NEXT_PUBLIC_SITE_URL
```

当前管理 API 实际依赖：

```text
ADMIN_SECRET
```

注意：不要把 `.env`、`.env.local` 中的真实密钥写入文档或提交记录。`.gitignore` 当前忽略了 `.env*.local`，但根目录 `.env` 文件仍存在，处理时要小心。

## 数据模型

Prisma 当前只有一个模型：

```prisma
model Tool {
  id          String   @id @default(cuid())
  name        String
  url         String   @unique
  category    String
  tags        String
  pricing     String
  description String
  affiliate   String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  views       Int      @default(0)
}
```

重要约定：

- `tags` 是逗号分隔字符串，不是数组，原因是当前 SQLite 模式更简单。
- `pricing` 目前使用 `free`、`freemium`、`paid`。
- `status` 目前使用 `active`、`pending`。
- 首页只展示 `status = active` 的工具。
- 首页排序为 `views desc`，再按 `createdAt desc`。

## 前台页面

首页入口是 `app/page.tsx`：

- 服务端调用 `getPrisma()` 查询工具。
- `export const dynamic = 'force-dynamic'`，确保后台新增数据能动态反映。
- 将 Prisma 的 `Date` 转成 ISO 字符串后传给客户端组件。

主 UI 在 `components/ToolDirectory.tsx`：

- 客户端组件。
- 支持关键词搜索。
- 支持分类筛选。
- 支持定价筛选。
- 支持 `/` 快捷键聚焦搜索框。
- 支持 `Escape` 清空搜索。
- 支持复制工具官网链接。
- 使用 `next/image` 加载 `favicon.im` 图标。
- 首页视觉方向是浅色、克制、工具型，不是大面积渐变营销页。

## 后台页面和 API

后台页面是 `app/admin/page.tsx`：

- 客户端页面。
- 用户输入管理员密钥后，请求 `/api/admin/tools`。
- 支持新增工具、切换上架/待审核、删除工具。
- 表单中 URL 会自动生成 favicon 预览。

API 是 `app/api/admin/tools/route.ts`：

- 使用请求头 `x-admin-secret` 对比 `process.env.ADMIN_SECRET`。
- `GET`：读取全部工具。
- `POST`：创建工具，并做基础校验和字段规范化。
- `PATCH`：当前主要用于更新 `status` 或 `pricing`。
- `DELETE`：通过 query 参数 `id` 删除工具。

维护注意：

- 管理 API 不应信任前端传入的任意字段。
- 如果扩展编辑功能，应在 API 层继续做白名单字段更新。
- 如果要公开提交工具入口，不要复用当前管理员 API，应另建公开投稿接口和审核流程。

## 图标和图片配置

`next.config.js` 中已允许：

- `images.unsplash.com`
- `cdn.supabase.co`
- `favicon.im`

`favicon.im` 是当前工具 favicon 的主要来源。

## 样式约定

- 全局背景为 `#f7f8f4`，整体偏浅色、简洁、现代。
- 卡片圆角基本使用 `rounded-lg` / `rounded-md`，避免过度圆润。
- 全局 `letter-spacing: 0`。
- 管理后台表单输入统一使用 `.admin-input`。
- Tailwind 主题里仍保留 `primary`、`secondary`、`accent` 三组历史颜色，但新首页更偏克制的 slate/emerald 配色。

## 本地运行注意事项

当前 Windows 环境里曾遇到两类问题：

1. `Start-Process npm` 或 `.cmd` 包装层可能触发 `Path` / `PATH` 大小写重复冲突。
2. 从自动化进程后台启动 Next dev server 时，进程可能快速退出；前台直接运行 Node 启动脚本能正常看到 Next `Ready` 输出。

建议本地预览优先直接在用户自己的 PowerShell 里运行：

```powershell
cd D:\WorkSpace\Github\shiguang-coding\ai-nav-mvp
npm run dev
```

如失败再运行：

```powershell
D:\Environment\nodejs\node.exe scripts\dev-runner.cjs
```

## 当前已知风险和待检查项

- 多个源文件中的中文文案在 PowerShell 输出中显示为乱码。后续编辑中文时务必确认文件以 UTF-8 保存，避免破坏字符串。
- 最近一次尝试 `npm run build` 时遇到 `.next\trace` 的 `EPERM`，可能是 `.next` 文件被 dev server 或系统占用；清理占用或删除 `.next` 后再重试。
- `components/ToolCard.tsx` 是旧组件，当前首页主要使用 `ToolDirectory.tsx` 内部的卡片实现。
- `package.json` 里有 `search:sync` 指向 `scripts/sync-search.ts`，但当前文件列表中没有看到这个脚本，执行前需要确认是否缺失。
- `.env.example` 包含 Supabase、Meilisearch、Postgres 等变量，但当前 Prisma schema 使用 SQLite；这些可能是早期规划或后续扩展预留。
- 当前目录没有显示 `.git` 目录，使用 `git diff` 等命令前先确认是否处于真实 Git 工作树。

## 给后续开发者或 AI 代理的建议

- 修改首页时优先保持 `app/page.tsx` 的服务端取数和 `ToolDirectory.tsx` 的客户端交互分离。
- 修改数据库访问时优先使用 `lib/prisma.ts` 的 `getPrisma()`，不要在模块顶层新建多个 `PrismaClient`。
- 新增工具字段时同时更新 Prisma schema、后台表单、API 白名单、首页类型 `ToolItem` 和 seed 数据。
- 改中文文案后务必运行 `npm run lint` 和 `npm run build`。
- 不要提交 `prisma/dev.db`、`.next/`、`node_modules/`、日志文件或真实环境变量。
- 若要做生产化，优先补充：公开投稿流程、后台编辑功能、访问量统计、分类标准化、搜索脚本修复、部署环境变量检查。
