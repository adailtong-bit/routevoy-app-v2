import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Rocket, TrendingUp } from 'lucide-react'

export function BoostCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onBoosted,
}: any) {
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      supabase
        .from('ad_pricing')
        .select('*')
        .order('price', { ascending: true })
        .then(({ data }) => {
          if (data) setPricing(data)
        })
    }
  }, [open])

  const handleBoost = async (pkg: any) => {
    setLoading(true)

    const priorityIncrease = pkg.price >= 300 ? 50 : pkg.price >= 100 ? 20 : 10
    const newPriority = (campaign.priority_score || 0) + priorityIncrease

    const { error: campError } = await supabase
      .from('ad_campaigns')
      .update({ priority_score: newPriority })
      .eq('id', campaign.id)

    if (campError) {
      toast.error('Erro ao impulsionar campanha')
      setLoading(false)
      return
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 5)

    await supabase.from('ad_invoices').insert([
      {
        ad_id: campaign.id,
        amount: pkg.price,
        reference_number: `INV-${Date.now()}`,
        due_date: dueDate.toISOString(),
        status: 'draft',
        environment: 'production',
      },
    ])

    toast.success(
      'Campanha impulsionada com sucesso! Fatura em rascunho gerada.',
    )
    setLoading(false)
    onOpenChange(false)
    if (onBoosted) onBoosted()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            Impulsionar: {campaign?.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            Escolha um pacote para aumentar a visibilidade e o Priority Score da
            sua campanha de anúncios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 mt-2">
          {pricing.map((pkg) => (
            <Card
              key={pkg.id}
              className="border-indigo-100 hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <CardContent className="p-6 text-center flex flex-col h-full bg-gradient-to-b from-white to-indigo-50/30">
                <h4 className="font-bold text-lg mb-2 text-slate-800">
                  {pkg.placement}
                </h4>
                <div className="text-3xl font-black text-indigo-600 mb-2 mt-4">
                  R$ {pkg.price?.toFixed(2)}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-6 flex-1 bg-white inline-block py-1 px-3 rounded-full border">
                  Duração: {pkg.duration_days} dias
                </p>
                <Button
                  onClick={() => handleBoost(pkg)}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold shadow-sm"
                  size="lg"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Escolher Pacote
                </Button>
              </CardContent>
            </Card>
          ))}
          {pricing.length === 0 && (
            <p className="col-span-3 text-center text-slate-500 py-8">
              Nenhum pacote de impulsionamento disponível no momento.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
