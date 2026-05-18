import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Play, AlertCircle, Loader2, Box } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export function ApifyIntegrationTab({
  onImportCompleted,
}: {
  onImportCompleted: () => void
}) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [query, setQuery] = useState('')

  const handleRunApify = async () => {
    setIsRunning(true)
    try {
      const { data, error } = await supabase.functions.invoke('run-apify', {
        body: { query: query || 'vagas e oportunidades descontos', limit: 15 },
      })

      if (error) throw error

      toast({
        title: 'Extração Concluída',
        description: `${data?.imported || 0} novas oportunidades foram importadas via Apify.`,
      })
      onImportCompleted()
    } catch (err: any) {
      toast({
        title: 'Erro na Integração Apify',
        description: err.message || 'Falha ao executar o scraper.',
        variant: 'destructive',
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Apify Scraper
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Conectado
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Integração ativa utilizando API Key. Extrai dados
                  automaticamente de marketplaces externos.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">
                Status da API
              </span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Operacional
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">
                Filtro Anti-Duplicidade
              </span>
              <span className="flex items-center text-sm font-bold text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Ativo
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Os anúncios extraídos serão enviados para a{' '}
              <strong>Área de Análise</strong> na aba de Ofertas Pendentes. O
              sistema identificará pelo ID original e ignorará automaticamente
              anúncios repetidos.
            </p>
          </div>

          <div className="space-y-3 max-w-md">
            <label className="text-sm font-medium">
              Termo de Busca (Opcional)
            </label>
            <Input
              placeholder="Ex: oportunidades remotas, descontos viagem"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <Button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleRunApify}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
            )}
            Executar Extração Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
