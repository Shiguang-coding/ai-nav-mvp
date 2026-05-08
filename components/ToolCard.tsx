export default function ToolCard({ tool }: { tool: any }) {
  return (
    <div className="bg-white p-5 rounded-xl border hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{tool.name}</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{tool.pricing}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tool.description}</p>
      <a href={tool.url} target="_blank" rel="noopener" className="text-indigo-600 text-sm">访问官网 →</a>
    </div>
  )
}
