import AdminDashboardComponent from '@/components/admin/AdminDashboard'
import { AdminAdsManager } from '@/components/admin/AdminAdsManager'
import { Button } from '@/components/ui/button'
import { clearCrawlerLogs, fetchCrawlerLogs } from '@/lib/api'
import { exportToCSV } from '@/lib/exportUtils'
import { Trash2, Download, History, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const searchParams = new URLSearchParams(window.location.search)
  const defaultTab =
    searchParams.get('tab') === 'publicidade' ? 'publicidade' : 'geral'
  const [isClearing, setIsClearing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [stats, setStats] = useState({
    totalFound: 0,
    totalImported: 0,
    totalSearches: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const logs = await fetchCrawlerLogs()
        let totalFound = 0
        let totalImported = 0
        logs.forEach((log: any) => {
          totalFound += Number(log.items_found || log.itemsFound || 0)
          totalImported += Number(log.items_imported || log.itemsImported || 0)
        })
        setStats({
          totalFound,
          totalImported,
          totalSearches: logs.length,
        })
      } catch (e) {
        console.error('Error loading stats', e)
      }
    }
    loadStats()

    const sub = supabase
      .channel('crawler_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crawler_logs' },
        loadStats,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        t(
          'admin.crawler.clear_history_confirm',
          'Are you sure you want to clear all search history from the system? This action cannot be undone.',
        ),
      )
    )
      return

    setIsClearing(true)
    try {
      const success = await clearCrawlerLogs()
      if (success) {
        toast.success(
          t(
            'admin.crawler.clear_history_success',
            'Search history cleared successfully',
          ),
        )
        setStats({ totalFound: 0, totalImported: 0, totalSearches: 0 })
        // Force reload to update inner component state after a short delay
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error(
          t(
            'admin.crawler.clear_history_error',
            'Error clearing history. Try again.',
          ),
        )
      }
    } finally {
      setIsClearing(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const logs = await fetchCrawlerLogs()
      if (logs && logs.length > 0) {
        const headers = [
          t('admin.crawler.csv_datetime', 'Date and Time'),
          t('admin.crawler.csv_source', 'Source/Store'),
          t('admin.crawler.csv_status', 'Status'),
          t('admin.crawler.csv_found', 'Items Found'),
          t('admin.crawler.csv_imported', 'Items Imported'),
          t('admin.crawler.csv_category', 'Category'),
          t('admin.crawler.csv_error', 'Error Details'),
        ]
        const rows = logs.map((log: any) => [
          log.created_at || log.created
            ? new Date(log.created_at || log.created).toLocaleString()
            : '',
          log.store_name ||
            log.storeName ||
            log.source_id ||
            log.sourceId ||
            'Organic Search',
          log.status || 'completed',
          (log.items_found ?? log.itemsFound ?? 0).toString(),
          (log.items_imported ?? log.itemsImported ?? 0).toString(),
          log.category || 'General',
          log.error_message || log.errorMessage || '',
        ])
        exportToCSV(
          headers,
          rows,
          `search_history_routevoy_${new Date().toISOString().split('T')[0]}.csv`,
        )
        toast.success(
          t('admin.crawler.export_success', 'History exported successfully!'),
        )
      } else {
        toast.error(
          t('admin.crawler.no_data_export', 'No data found to export.'),
        )
      }
    } catch (e) {
      toast.error(t('admin.crawler.export_error', 'Error exporting data.'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col">
      {/* Header Administrativo com Métricas do Histórico de Buscas */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {t('admin.dashboardTitle', 'Admin Panel')}
            </h2>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" />
                {t('admin.crawler.searches', 'Searches:')}{' '}
                <strong className="text-slate-900">
                  {stats.totalSearches}
                </strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="hidden sm:inline">
                {t('admin.crawler.found', 'Found:')}{' '}
                <strong className="text-emerald-600">{stats.totalFound}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
              <span className="hidden sm:inline">
                {t('admin.crawler.imported', 'Imported:')}{' '}
                <strong className="text-blue-600">{stats.totalImported}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex-1 sm:flex-none bg-white border-slate-200 hover:bg-slate-50 font-medium"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            {t('admin.exportCsv', 'Export CSV')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearHistory}
            disabled={isClearing}
            className="flex-1 sm:flex-none font-medium shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('admin.crawler.clear_history', 'Clear History')}
          </Button>
        </div>
      </div>

      {/* Componente Administrativo Original */}
      <div className="flex-1 relative p-2 sm:p-6 max-w-full overflow-hidden">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto w-full sm:w-auto overflow-x-auto justify-start border-b rounded-none bg-transparent">
            <TabsTrigger
              value="geral"
              className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
            >
              {t('admin.dashboard', 'Painel Geral')}
            </TabsTrigger>
            <TabsTrigger
              value="publicidade"
              className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
            >
              {t('admin.ads', 'Publicidade & Anúncios')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="geral" className="mt-0">
            <AdminDashboardComponent />
          </TabsContent>
          <TabsContent value="publicidade" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <AdminAdsManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
