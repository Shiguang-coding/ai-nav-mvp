import { ToolDirectory, type ToolItem } from '@/components/ToolDirectory'
import { getPrisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getTools(): Promise<ToolItem[]> {
  const prisma = getPrisma()
  const tools = await prisma.tool.findMany({
    where: { status: 'active' },
    orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
  })

  return tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    url: tool.url,
    category: tool.category,
    tags: tool.tags,
    pricing: tool.pricing,
    description: tool.description,
    createdAt: tool.createdAt.toISOString(),
    views: tool.views,
  }))
}

export default async function Home() {
  const tools = await getTools()

  return <ToolDirectory tools={tools} />
}
