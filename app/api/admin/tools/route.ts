import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

const allowedPricing = new Set(['free', 'freemium', 'paid'])
const allowedStatus = new Set(['active', 'pending'])

function checkAuth(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return NextResponse.json({ error: '管理员密钥未配置' }, { status: 500 })
  }

  if (req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: '认证失败' }, { status: 401 })
  }

  return null
}

function normalizeToolPayload(data: Record<string, unknown>) {
  const name = String(data.name ?? '').trim()
  const url = String(data.url ?? '').trim()
  const category = String(data.category ?? '').trim()
  const description = String(data.description ?? '').trim()
  const tags = String(data.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(',')
  const pricing = String(data.pricing ?? 'freemium')
  const status = String(data.status ?? 'active')

  if (!name || !url || !category || !description) {
    throw new Error('名称、官网、分类和简介不能为空')
  }

  try {
    new URL(url)
  } catch {
    throw new Error('官网地址必须是有效 URL')
  }

  if (!allowedPricing.has(pricing)) {
    throw new Error('定价类型无效')
  }

  if (!allowedStatus.has(status)) {
    throw new Error('状态无效')
  }

  return { name, url, category, description, tags, pricing, status }
}

export async function GET(req: NextRequest) {
  const authError = checkAuth(req)
  if (authError) return authError

  const tools = await getPrisma().tool.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tools)
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req)
  if (authError) return authError

  try {
    const data = normalizeToolPayload(await req.json())
    const tool = await getPrisma().tool.create({ data })
    return NextResponse.json({ success: true, tool })
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  const authError = checkAuth(req)
  if (authError) return authError

  try {
    const { id, ...data } = await req.json()

    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    const updateData: Record<string, string> = {}
    if (typeof data.status === 'string') {
      if (!allowedStatus.has(data.status)) throw new Error('状态无效')
      updateData.status = data.status
    }

    if (typeof data.pricing === 'string') {
      if (!allowedPricing.has(data.pricing)) throw new Error('定价类型无效')
      updateData.pricing = data.pricing
    }

    await getPrisma().tool.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = checkAuth(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  }

  await getPrisma().tool.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
