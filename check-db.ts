import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.tool.count()
  console.log(`📊 Tool 表数据量: ${count} 条`)
  if (count > 0) {
    const sample = await prisma.tool.findFirst()
    console.log('📋 示例数据:', sample?.name, '|', sample?.tags)
  }
}
main().catch(console.error).finally(async () => { await prisma.$disconnect() })
