import './globals.css'

export const metadata = {
  title: 'AI Nav - 简约 AI 工具导航',
  description: '发现、筛选和访问真实可用的 AI 产品。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
