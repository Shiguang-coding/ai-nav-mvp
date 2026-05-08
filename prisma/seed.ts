import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const tools = [
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    category: '对话',
    tags: '聊天,写作,推理',
    pricing: 'freemium',
    description: '面向写作、分析、编程和日常问答的通用 AI 助手。',
    status: 'active',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    category: '对话',
    tags: '长文本,分析,写作',
    pricing: 'freemium',
    description: '擅长长文本理解、严谨分析和自然语言协作的大模型产品。',
    status: 'active',
  },
  {
    name: 'Cursor',
    url: 'https://cursor.com',
    category: '开发',
    tags: '代码,IDE,编程',
    pricing: 'freemium',
    description: '面向开发者的 AI 原生代码编辑器，支持代码生成、重构和问答。',
    status: 'active',
  },
  {
    name: 'Midjourney',
    url: 'https://www.midjourney.com',
    category: '图像',
    tags: '绘图,创意,视觉',
    pricing: 'paid',
    description: '高质量 AI 图像生成工具，适合创意视觉、概念设计和艺术探索。',
    status: 'active',
  },
  {
    name: 'Runway',
    url: 'https://runwayml.com',
    category: '视频',
    tags: '视频,生成,剪辑',
    pricing: 'freemium',
    description: '提供 AI 视频生成、编辑和创意制作能力的多模态工具。',
    status: 'active',
  },
  {
    name: 'Notion AI',
    url: 'https://www.notion.so/product/ai',
    category: '生产力',
    tags: '笔记,协作,总结',
    pricing: 'paid',
    description: '集成在 Notion 工作区中的 AI 写作、总结和知识整理助手。',
    status: 'active',
  },
]

async function main() {
  console.log('Seeding database...')

  await prisma.tool.deleteMany({})

  for (const tool of tools) {
    await prisma.tool.create({ data: tool })
  }

  console.log(`Seed completed - ${tools.length} tools added`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
