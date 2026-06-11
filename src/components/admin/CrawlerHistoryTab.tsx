import { useState, useEffect } from 'react'
import { fetchCrawlerLogs } from '@/services/crawler'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function CrawlerHistoryTab({
  isScanning,
  franchiseId,
}: {
  isScanning?: boolean
  franchiseId?: string | null
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isScanning) return

    const loadLogs = async () => {
      setLoading(true)
      try {
        const data = await fetchCrawlerLogs(
          franchiseId ? { franchise_id: franchiseId } : undefined,
        )
        setLogs(data)
      } catch (e) {
        console.error('Failed to load crawler logs', e)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [isScanning])

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="border rounded-xl overflow-x-auto bg-white shadow-sm mt-4">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-[11px] text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Source Engine</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Encontrados</th>
              <th className="px-5 py-4 text-right">Novos (Importados)</th>
              <th className="px-5 py-4 text-right">Duplicados (Ignorados)</th>
              <th className="px-5 py-4">Errors / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  Loading execution history...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-500 bg-slate-50/30"
                >
                  No previous executions found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                    {format(
                      new Date(log.created || log.date),
                      'dd/MM/yyyy HH:mm',
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium whitespace-nowrap text-slate-900">
                    {log.storeName}
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-medium">
                    {log.category || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-medium'
                          : log.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-none font-medium'
                            : 'bg-red-50 text-red-700 border-red-200 shadow-none font-medium'
                      }
                    >
                      {log.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-700">
                    {log.itemsFound || 0}
                  </td>
                  <td className="px-5 py-4 text-right text-emerald-600 font-bold">
                    {log.itemsImported || 0}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-400 font-medium">
                    {Math.max(
                      0,
                      (log.itemsFound || 0) - (log.itemsImported || 0),
                    )}
                  </td>
                  <td
                    className="px-5 py-4 text-red-500 max-w-[280px] truncate text-xs"
                    title={log.errorMessage}
                  >
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
