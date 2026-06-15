import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { Play, RefreshCw } from 'lucide-react'

export function AffiliateCrawlerSourcesTab({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId: string | null
  companyId: string | null
  affiliateId: string | null
}) {
  const { t } = useLanguage()
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchSources = async () => {
    setLoading(true)
    let query = supabase
      .from('crawler_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (franchiseId) query = query.eq('franchise_id', franchiseId)
    else if (companyId) query = query.eq('company_id', companyId)
    else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

    const { data, error } = await query
    if (error) {
      toast.error('Error fetching sources')
    } else {
      setSources(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSources()
  }, [franchiseId, companyId, affiliateId])

  const handleAddSource = async () => {
    if (!newUrl || !newName) {
      toast.error(t('common.error', 'Please fill name and URL'))
      return
    }
    setAdding(true)
    try {
      const { error } = await supabase.from('crawler_sources').insert({
        name: newName,
        url: newUrl,
        type: 'web',
        status: 'active',
        affiliate_id: affiliateId,
      })
      if (error) throw error
      toast.success(t('common.success', 'Source added successfully'))
      setNewName('')
      setNewUrl('')
      fetchSources()
    } catch (err: any) {
      toast.error(t('common.error', 'Error adding source: ') + err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleRunCrawler = async (sourceId: string) => {
    setRunning((prev) => ({ ...prev, [sourceId]: true }))
    try {
      const { error } = await supabase.functions.invoke('crawl-promotions', {
        body: { source_id: sourceId },
      })
      if (error) throw error

      toast.success(
        t('affiliate.crawler.run_success', 'Crawler started successfully!'),
      )
      fetchSources()
    } catch (err: any) {
      toast.error(
        t('affiliate.crawler.run_error', 'Error starting crawler: ') +
          err.message,
      )
    } finally {
      setRunning((prev) => ({ ...prev, [sourceId]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {t('affiliate.crawler.sources_title', 'Crawler Sources')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'affiliate.crawler.sources_desc',
              'Manage and run your configured data sources.',
            )}
          </p>
        </div>
        <Button onClick={fetchSources} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />{' '}
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 border rounded-md bg-slate-50 sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            {t('common.name', 'Name')}
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Amazon Deals"
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            {t('common.url', 'URL')}
          </label>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <Button
          onClick={handleAddSource}
          disabled={adding}
          size="sm"
          className="h-9"
        >
          {adding ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
          {t('common.add', 'Add Source')}
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name', 'Name')}</TableHead>
              <TableHead>{t('common.url', 'URL')}</TableHead>
              <TableHead>{t('common.category', 'Category')}</TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t(
                    'affiliate.crawler.no_sources',
                    'No sources configured for your network.',
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={source.url}
                  >
                    {source.url}
                  </TableCell>
                  <TableCell>{source.category || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        source.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {source.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleRunCrawler(source.id)}
                      disabled={
                        running[source.id] || source.status === 'inactive'
                      }
                    >
                      {running[source.id] ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {t('affiliate.crawler.run', 'Run')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
