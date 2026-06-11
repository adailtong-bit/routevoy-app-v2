import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Play,
  Square,
  Loader2,
  Globe,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  startExtractionTask,
  stopExtractionTask,
  getCrawlerProgress,
  subscribeCrawler,
} from '@/lib/crawlerTask'
import { cn } from '@/lib/utils'
import { CrawlerSourceForm } from './CrawlerSourceForm'
import { CrawlerSource } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import {
  fetchCrawlerSources,
  saveCrawlerSource,
  updateCrawlerSource,
  deleteCrawlerSource,
  saveCrawlerLog,
} from '@/services/crawler'

export function CrawlerSourcesTab({
  franchiseId,
}: {
  franchiseId?: string | null
}) {
  const { toast } = useToast()
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)

  const [progress, setProgress] = useState(getCrawlerProgress())
  const prevScanningRef = useRef(false)
  const scanSourceRef = useRef<any>(null)

  useEffect(() => {
    if (
      prevScanningRef.current &&
      !progress.isScanning &&
      (progress.found > 0 || progress.errors > 0 || progress.imported > 0)
    ) {
      saveCrawlerLog({
        date: new Date().toISOString(),
        store_name: scanSourceRef.current?.name || 'Varredura Manual',
        source_id: scanSourceRef.current?.id || null,
        category: scanSourceRef.current?.category || 'Geral',
        status:
          progress.errors > 0
            ? progress.imported > 0
              ? 'warning'
              : 'error'
            : 'success',
        items_found: progress.found,
        items_imported: progress.imported,
        error_message:
          progress.errors > 0
            ? `${progress.errors} itens descartados (erros ou duplicados).`
            : null,
      })
    }
    prevScanningRef.current = progress.isScanning
  }, [progress.isScanning, progress.found, progress.imported, progress.errors])

  const loadSources = async () => {
    try {
      setIsLoading(true)
      const data = await fetchCrawlerSources(
        franchiseId ? { franchise_id: franchiseId } : undefined,
      )
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        region: item.region,
        country: item.country,
        state: item.state,
        city: item.city,
        scanRadius: item.scan_radius,
        status: item.status,
        category: item.category,
        lastScan: item.last_scan,
      }))
      setSources(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    return subscribeCrawler(() => {
      setProgress({ ...getCrawlerProgress() })
    })
  }, [])

  const handleSaveSource = async (
    data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>,
  ) => {
    if (data.url && data.url !== 'all') {
      try {
        new URL(data.url)
      } catch (e) {
        toast({
          title: 'URL Inválida',
          description:
            'Por favor, insira uma URL válida (ex: https://site.com) ou deixe em branco.',
          variant: 'destructive',
        })
        return
      }
    }

    try {
      const dbPayload: any = {
        name: data.name,
        url: data.url,
        type: data.type,
        region: data.region,
        country: data.country,
        state: data.state,
        city: data.city,
        scan_radius: data.scanRadius,
        category: data.category,
      }

      if (franchiseId) {
        dbPayload.franchise_id = franchiseId
      }

      if (editingSource) {
        await updateCrawlerSource(editingSource.id, dbPayload)
        toast({ title: 'Fonte atualizada com sucesso' })
      } else {
        await saveCrawlerSource(dbPayload)
        toast({ title: 'Fonte adicionada com sucesso' })
      }
      setIsFormOpen(false)
      setEditingSource(null)
      loadSources()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar fonte',
        description:
          error.message || 'Houve um problema ao comunicar com o servidor.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCrawlerSource(id)
      toast({ title: 'Fonte removida' })
      loadSources()
    } catch (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleStart = async (source: any) => {
    if (progress.isScanning) return
    scanSourceRef.current = source
    startExtractionTask(source.name, 50, source.url, {
      country: source.country,
      state: source.state,
      city: source.city,
      category: source.category,
    })
    try {
      const now = new Date().toISOString()
      await updateCrawlerSource(source.id, { last_scan: now })
      setSources(
        sources.map((s) => (s.id === source.id ? { ...s, lastScan: now } : s)),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleStop = () => {
    stopExtractionTask()
  }

  const handleStartAll = async () => {
    if (progress.isScanning) return
    const activeSources = sources.filter((s) => s.status === 'active')
    if (activeSources.length === 0) {
      toast({ title: 'Nenhuma fonte ativa', variant: 'destructive' })
      return
    }

    scanSourceRef.current = {
      name: 'Multi-Fontes (Batch)',
      id: null,
      category: 'Geral',
    }
    startExtractionTask('Multi-Fontes (Batch)', 500, 'all', {
      useConfiguredSources: true,
      category: 'Geral',
    })

    try {
      const now = new Date().toISOString()
      await Promise.all(
        activeSources.map((s) => updateCrawlerSource(s.id, { last_scan: now })),
      )
      setSources(
        sources.map((s) =>
          s.status === 'active' ? { ...s, lastScan: now } : s,
        ),
      )
      toast({ title: 'Varredura em lote iniciada' })
    } catch (e) {
      console.error(e)
    }
  }

  const percentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-blue-600" />
              Fontes de Dados (Data Sources)
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Gerencie e monitore as fontes de busca orgânica na web ou via API.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleStartAll}
              variant="secondary"
              className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              disabled={progress.isScanning}
            >
              <Play className="h-4 w-4" />
              Rodar Ativas
            </Button>
            <Button
              onClick={() => {
                setEditingSource(null)
                setIsFormOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Fonte
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Site</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Região / País</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Última Varredura</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                      </td>
                    </tr>
                  ) : sources.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Nenhuma fonte de dados configurada.
                      </td>
                    </tr>
                  ) : (
                    sources.map((source) => (
                      <tr
                        key={source.id}
                        className="hover:bg-slate-50/50 transition-colors bg-white"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {source.name}
                        </td>
                        <td className="px-4 py-3">
                          {source.url && source.url !== 'all' ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline max-w-[200px] truncate block"
                            >
                              {source.url}
                            </a>
                          ) : (
                            <span className="text-slate-500 text-xs font-medium px-2 py-1 bg-slate-100 rounded-md">
                              Multi-fontes
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {source.country
                            ? `${source.country}${source.state ? ` - ${source.state}` : ''}`
                            : source.region}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              source.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                            )}
                          >
                            {source.status === 'active' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {source.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {source.lastScan
                            ? new Date(source.lastScan).toLocaleString()
                            : 'Nunca'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleStart(source)}
                              disabled={progress.isScanning}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-600"
                              onClick={() => {
                                setEditingSource(source)
                                setIsFormOpen(true)
                              }}
                              disabled={progress.isScanning}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600"
                              onClick={() => handleDelete(source.id)}
                              disabled={progress.isScanning}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(progress.isScanning || progress.total > 0) && (
            <div className="space-y-5 p-5 mt-6 border rounded-xl bg-slate-50 shadow-inner">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  {progress.isScanning && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {progress.isScanning
                    ? 'Executando Varredura...'
                    : 'Ciclo de Varredura Concluído'}
                </span>
                <span className="text-slate-500">
                  {progress.current} / {progress.total} verificados
                </span>
              </div>

              <Progress value={percentage} className="h-2.5 bg-slate-200" />

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {progress.found}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Itens Encontrados
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {progress.imported}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Validados & Importados
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-red-500">
                    {progress.errors}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Descartados (Erros)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-4 border-t border-slate-200 mt-4">
                {progress.isScanning && (
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="gap-2 w-full md:w-auto px-6 font-semibold shadow-sm"
                  >
                    <Square className="h-4 w-4" />
                    Parar Processo
                  </Button>
                )}
              </div>

              <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-lg h-48 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner border border-slate-800">
                {progress.logs.map((log, i) => (
                  <div
                    key={i}
                    className="mb-1.5 border-b border-slate-800/60 pb-1.5 break-words"
                  >
                    <span
                      className={cn(
                        'opacity-90',
                        log.includes('Fatal Error') && 'text-red-400 font-bold',
                        log.includes('Imported:') &&
                          'text-emerald-400 font-medium',
                        log.includes('Discarded') && 'text-amber-400',
                        log.includes('Initiating') &&
                          'text-blue-300 font-medium',
                        log.includes('Done.') && 'text-blue-300 font-medium',
                      )}
                    >
                      {log}
                    </span>
                  </div>
                ))}
                {progress.logs.length === 0 && (
                  <div className="opacity-40 italic">
                    Aguardando logs de execução...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Editar Fonte de Dados' : 'Nova Fonte de Dados'}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros e limites para a busca orgânica nesta
              fonte.
            </DialogDescription>
          </DialogHeader>
          <CrawlerSourceForm
            initialData={editingSource}
            onSave={handleSaveSource}
            userRegion="Global"
            isFranchisee={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
