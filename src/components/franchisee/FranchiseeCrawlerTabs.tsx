import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Play, Trash2 } from 'lucide-react'

export function CrawlerSourcesTab({ franchiseId }: { franchiseId: string }) {
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSources() {
      const { data } = await supabase
        .from('crawler_sources')
        .select('*')
        .eq('franchise_id', franchiseId)
      setSources(data || [])
      setLoading(false)
    }
    loadSources()
  }, [franchiseId])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Crawler Sources</h2>
          <p className="text-slate-500">
            Manage automated data collection sources for your region.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Source
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sources.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    No crawler sources configured.
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell className="text-slate-500 max-w-[200px] truncate">
                      {source.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {source.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {source.last_scan
                        ? new Date(source.last_scan).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function CrawlerLogsTab({ franchiseId }: { franchiseId: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      const { data } = await supabase
        .from('crawler_logs')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('created_at', { ascending: false })
        .limit(50)
      setLogs(data || [])
      setLoading(false)
    }
    loadLogs()
  }, [franchiseId])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Crawler Logs</h2>
        <p className="text-slate-500">
          Monitor the execution history of your data sources.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Items Found</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-slate-500"
                  >
                    No logs available.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-slate-700">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.store_name || 'N/A'}</TableCell>
                    <TableCell>{log.items_found || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'success' ? 'default' : 'destructive'
                        }
                      >
                        {log.status || 'Success'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
