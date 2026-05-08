'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Activity,
  Check,
  Globe,
  LayoutGrid,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Tag,
  Trash2,
} from 'lucide-react'
import { extractDomain, fetchWebsiteIcon } from '@/lib/fetch-favicon'

type Tool = {
  id: string
  name: string
  url: string
  category: string
  tags: string
  pricing: string
  description: string
  status: string
}

type ToolForm = {
  name: string
  url: string
  category: string
  tags: string
  pricing: string
  description: string
  status: string
}

const emptyForm: ToolForm = {
  name: '',
  url: '',
  category: '',
  tags: '',
  pricing: 'freemium',
  description: '',
  status: 'active',
}

const pricingLabels: Record<string, string> = {
  free: '免费',
  freemium: '免费试用',
  paid: '付费',
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [tools, setTools] = useState<Tool[]>([])
  const [form, setForm] = useState<ToolForm>(emptyForm)
  const [iconUrl, setIconUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const activeCount = useMemo(() => tools.filter((tool) => tool.status === 'active').length, [tools])
  const pendingCount = tools.length - activeCount

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!form.url.startsWith('http')) {
        setIconUrl('')
        return
      }

      setIconUrl(await fetchWebsiteIcon(form.url))
    }, 400)

    return () => window.clearTimeout(timer)
  }, [form.url])

  async function fetchTools(nextSecret = secret) {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/tools', {
        headers: { 'x-admin-secret': nextSecret },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? '读取失败')
      }

      setTools(data)
      setIsAuthed(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '请求失败')
      setIsAuthed(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? '保存失败')
      }

      setForm(emptyForm)
      setIconUrl('')
      setMessage('工具已收录')
      await fetchTools()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(tool: Tool) {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/tools', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({
          id: tool.id,
          status: tool.status === 'active' ? 'pending' : 'active',
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? '更新失败')
      }

      await fetchTools()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  async function deleteTool(tool: Tool) {
    if (!window.confirm(`确定删除 ${tool.name} 吗？`)) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/tools?id=${tool.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? '删除失败')
      }

      setTools((current) => current.filter((item) => item.id !== tool.id))
      setMessage('已删除')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] p-4 text-slate-950">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold">工具管理后台</h1>
              <p className="mt-1 text-sm text-slate-500">输入管理员密钥后继续</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">管理员密钥</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 outline-none focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                  onChange={(event) => setSecret(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && fetchTools()}
                  placeholder="ADMIN_SECRET"
                  type="password"
                  value={secret}
                />
              </span>
            </label>

            {message && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</p>}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !secret}
              onClick={() => fetchTools()}
              type="button"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              进入后台
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">AI Nav Admin</p>
            <h1 className="mt-2 text-3xl font-semibold">工具收录管理</h1>
            <p className="mt-2 text-sm text-slate-500">新增、审核和下架导航站中的 AI 工具。</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-60"
            disabled={loading}
            onClick={() => fetchTools()}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </button>
        </header>

        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <Metric icon={LayoutGrid} label="全部工具" value={tools.length} />
          <Metric icon={Check} label="已上架" value={activeCount} />
          <Metric icon={Activity} label="待审核" value={pendingCount} />
        </section>

        {message && <p className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

        <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold">收录新工具</h2>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="工具名称">
              <input className="admin-input" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
            </Field>

            <Field label="官网地址">
              <span className="relative block">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="admin-input pl-10"
                  onChange={(event) => setForm({ ...form, url: event.target.value })}
                  placeholder="https://example.com"
                  required
                  type="url"
                  value={form.url}
                />
                {iconUrl && (
                  <Image
                    alt=""
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded"
                    height={20}
                    src={iconUrl}
                    width={20}
                  />
                )}
              </span>
            </Field>

            <Field label="分类">
              <input className="admin-input" onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="对话 / 图像 / 开发" required value={form.category} />
            </Field>

            <Field label="标签">
              <span className="relative block">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="admin-input pl-10" onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="写作,效率,免费" value={form.tags} />
              </span>
            </Field>

            <Field label="定价">
              <select className="admin-input" onChange={(event) => setForm({ ...form, pricing: event.target.value })} value={form.pricing}>
                <option value="free">免费</option>
                <option value="freemium">免费试用</option>
                <option value="paid">付费</option>
              </select>
            </Field>

            <Field label="状态">
              <select className="admin-input" onChange={(event) => setForm({ ...form, status: event.target.value })} value={form.status}>
                <option value="active">立即上架</option>
                <option value="pending">待审核</option>
              </select>
            </Field>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">工具简介</span>
              <textarea
                className="admin-input min-h-24 resize-none py-3"
                maxLength={140}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
                value={form.description}
              />
              <span className="mt-1 block text-right text-xs text-slate-400">{form.description.length}/140</span>
            </label>

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 md:col-span-2"
              disabled={loading}
              type="submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存到数据库
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">工具</th>
                  <th className="px-4 py-3 font-medium">分类</th>
                  <th className="px-4 py-3 font-medium">定价</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tools.map((tool) => (
                  <tr className="hover:bg-slate-50" key={tool.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          alt=""
                          className="rounded-md border border-slate-200 bg-slate-50 p-1"
                          height={36}
                          src={`https://favicon.im/${extractDomain(tool.url)}`}
                          width={36}
                        />
                        <div>
                          <div className="font-medium text-slate-900">{tool.name}</div>
                          <div className="text-xs text-slate-500">{extractDomain(tool.url)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{tool.category}</td>
                    <td className="px-4 py-3 text-slate-600">{pricingLabels[tool.pricing] ?? tool.pricing}</td>
                    <td className="px-4 py-3">
                      <button
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          tool.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                        onClick={() => toggleStatus(tool)}
                        type="button"
                      >
                        {tool.status === 'active' ? '已上架' : '待审核'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        aria-label={`删除 ${tool.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
                        onClick={() => deleteTool(tool)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutGrid
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  )
}
