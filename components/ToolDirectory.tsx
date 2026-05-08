'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowUpRight,
  Check,
  Clipboard,
  ClipboardCheck,
  Code2,
  Compass,
  Filter,
  ImageIcon,
  LayoutGrid,
  MessageSquareText,
  PenLine,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Video,
  X,
  Zap,
} from 'lucide-react'

export type ToolItem = {
  id: string
  name: string
  url: string
  category: string
  tags: string
  pricing: string
  description: string
  createdAt: string
  views: number
}

type CategoryMeta = {
  icon: typeof Sparkles
  accent: string
}

const categoryMeta: Record<string, CategoryMeta> = {
  对话: { icon: MessageSquareText, accent: 'bg-sky-50 text-sky-700 ring-sky-100' },
  写作: { icon: PenLine, accent: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  图像: { icon: ImageIcon, accent: 'bg-rose-50 text-rose-700 ring-rose-100' },
  视频: { icon: Video, accent: 'bg-amber-50 text-amber-800 ring-amber-100' },
  开发: { icon: Code2, accent: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
  生产力: { icon: Zap, accent: 'bg-teal-50 text-teal-700 ring-teal-100' },
}

const pricingLabels: Record<string, string> = {
  free: '免费',
  freemium: '免费试用',
  paid: '付费',
}

const pricingOptions = [
  { value: 'all', label: '全部' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费试用' },
  { value: 'paid', label: '付费' },
]

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getTags(tags: string) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getFavicon(url: string) {
  return `https://favicon.im/${getDomain(url)}`
}

function getCategoryMeta(category: string) {
  return categoryMeta[category] ?? {
    icon: Sparkles,
    accent: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
}

export function ToolDirectory({ tools }: { tools: ToolItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [pricing, setPricing] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const tool of tools) counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1)
    return [
      { name: '全部', count: tools.length },
      ...Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    ]
  }, [tools])

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tools.filter((tool) => {
      const tags = getTags(tool.tags)
      const searchable = [
        tool.name,
        tool.description,
        tool.category,
        getDomain(tool.url),
        ...tags,
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      const matchesCategory = category === '全部' || tool.category === category
      const matchesPricing = pricing === 'all' || tool.pricing === pricing

      return matchesQuery && matchesCategory && matchesPricing
    })
  }, [category, pricing, query, tools])

  const featuredTools = filteredTools.slice(0, 3)
  const totalCategories = Math.max(categories.length - 1, 0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement !== inputRef.current) {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  async function copyLink(tool: ToolItem) {
    await navigator.clipboard.writeText(tool.url)
    setCopiedId(tool.id)
    window.setTimeout(() => setCopiedId(null), 1400)
  }

  function clearFilters() {
    setQuery('')
    setCategory('全部')
    setPricing('all')
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="AI Nav 首页">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Compass className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-normal">AI Nav</span>
          </a>

          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <a className="hidden rounded-md px-3 py-2 hover:bg-slate-100 sm:inline-flex" href="#tools">
              工具库
            </a>
            <a className="hidden rounded-md px-3 py-2 hover:bg-slate-100 sm:inline-flex" href="#featured">
              精选
            </a>
            <a className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 hover:border-slate-400" href="/admin">
              提交工具
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-[#f7f8f4]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" />
              精选真实可用的 AI 产品
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl">
              一个简约、快速、可筛选的 AI 工具导航站
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              用更少的装饰承载更多有效信息。按场景、价格和关键词快速定位工具，点击即可访问官网。
            </p>

            <div className="mt-8 max-w-2xl" id="tools">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-base outline-none ring-0 transition focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                  placeholder="搜索 ChatGPT、写作、代码、视频、免费..."
                  type="search"
                />
                {query ? (
                  <button
                    aria-label="清除搜索"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    onClick={() => setQuery('')}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 sm:block">
                    /
                  </kbd>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {pricingOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      pricing === option.value
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setPricing(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 self-end lg:grid-cols-1">
            <Stat label="已收录" value={tools.length.toString()} />
            <Stat label="分类" value={totalCategories.toString()} />
            <Stat label="可筛选" value={filteredTools.length.toString()} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" />
            分类
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
            {categories.map((item) => {
              const active = category === item.name
              const meta = getCategoryMeta(item.name)
              const Icon = item.name === '全部' ? LayoutGrid : meta.icon

              return (
                <button
                  key={item.name}
                  className={`flex min-w-max items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition lg:w-full ${
                    active
                      ? 'bg-slate-950 text-white'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setCategory(item.name)}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  <span className={active ? 'text-white/70' : 'text-slate-400'}>{item.count}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="min-w-0">
          {featuredTools.length > 0 && (
            <div className="mb-8" id="featured">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Star className="h-4 w-4 text-amber-500" />
                  当前精选
                </h2>
                <span className="text-sm text-slate-500">优先展示访问量和最新收录</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {featuredTools.map((tool) => (
                  <FeaturedTool key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">工具库</h2>
              <p className="mt-1 text-sm text-slate-500">
                显示 {filteredTools.length} 个结果，共 {tools.length} 个工具
              </p>
            </div>
            {(query || category !== '全部' || pricing !== 'all') && (
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
                onClick={clearFilters}
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
                重置筛选
              </button>
            )}
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard
                  copied={copiedId === tool.id}
                  key={tool.id}
                  onCopy={() => copyLink(tool)}
                  tool={tool}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <Search className="mb-4 h-10 w-10 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">没有找到匹配工具</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                换一个关键词，或清除分类和价格筛选后再试。
              </p>
              <button className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" onClick={clearFilters} type="button">
                清除筛选
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  )
}

function FeaturedTool({ tool }: { tool: ToolItem }) {
  const meta = getCategoryMeta(tool.category)
  const Icon = meta.icon

  return (
    <a
      className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
      href={tool.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-3">
        <Image alt="" className="rounded-md bg-slate-100 p-1" height={36} src={getFavicon(tool.url)} width={36} />
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900">{tool.name}</div>
          <div className="truncate text-xs text-slate-500">{getDomain(tool.url)}</div>
        </div>
        <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
      </div>
      <div className={`mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ${meta.accent}`}>
        <Icon className="h-3.5 w-3.5" />
        {tool.category}
      </div>
    </a>
  )
}

function ToolCard({
  copied,
  onCopy,
  tool,
}: {
  copied: boolean
  onCopy: () => void
  tool: ToolItem
}) {
  const tags = getTags(tool.tags)
  const meta = getCategoryMeta(tool.category)
  const Icon = meta.icon

  return (
    <article className="flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <Image
          alt=""
          className="rounded-lg border border-slate-200 bg-slate-50 p-1.5"
          height={44}
          src={getFavicon(tool.url)}
          width={44}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-950">{tool.name}</h3>
          <p className="truncate text-sm text-slate-500">{getDomain(tool.url)}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ${meta.accent}`}>
          <Icon className="h-3.5 w-3.5" />
          {tool.category}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{tool.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {pricingLabels[tool.pricing] ?? tool.pricing}
        </span>
        {tags.slice(0, 3).map((tag) => (
          <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <a
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          href={tool.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          访问官网
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <button
          aria-label={copied ? '已复制链接' : '复制链接'}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          onClick={onCopy}
          type="button"
        >
          {copied ? <ClipboardCheck className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
        </button>
      </div>
    </article>
  )
}
