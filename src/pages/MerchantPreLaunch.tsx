import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Rocket, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'
import { useLanguage } from '@/stores/LanguageContext'

export default function MerchantPreLaunch() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<any>(null)

  const companyId = user?.id

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)

    // Fetch private/exclusive campaigns tagged or named as pre-launch
    const { data: cData } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_exclusive', true)
      .ilike('name', '%pré-lançamento%')
      .order('created_at', { ascending: false })

    if (cData) setCampaigns(cData)

    const { data: gData } = await supabase
      .from('crm_target_groups')
      .select('*')
      .eq('company_id', companyId)
      .order('name')

    if (gData) setGroups(gData)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const filtered = campaigns.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t(
                'merchant.pre_launch.page_title',
                'Campanhas de Pré-lançamento',
              )}
            </h1>
            <p className="text-slate-500">
              {t(
                'merchant.pre_launch.page_desc',
                'Crie ações antecipadas exclusivas para grupos de leads alvo (Targeted/Private)',
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setOpenForm(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('merchant.pre_launch.create', 'Criar Pré-lançamento')}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          className="pl-10 h-12 bg-white"
          placeholder={t(
            'merchant.pre_launch.search',
            'Buscar campanhas de pré-lançamento...',
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl text-slate-500">
          {t(
            'merchant.pre_launch.empty',
            'Nenhuma campanha de pré-lançamento encontrada.',
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{c.name}</h3>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide">
                    {t('merchant.pre_launch.private', 'Privado')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {c.content ||
                    t('merchant.pre_launch.no_desc', 'Sem descrição.')}
                </p>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{t('merchant.pre_launch.channel', 'Canal:')}</span>
                    <span className="font-medium capitalize">{c.channel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{t('merchant.pre_launch.clicks', 'Cliques:')}</span>
                    <span className="font-medium">{c.clicks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {t('merchant.pre_launch.redemptions', 'Resgates:')}
                    </span>
                    <span className="font-medium">{c.redemptions || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditData(c)
                    setOpenForm(true)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />{' '}
                  {t('merchant.pre_launch.edit', 'Editar')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    if (
                      confirm(
                        t(
                          'merchant.pre_launch.confirm_delete',
                          'Deseja excluir este pré-lançamento?',
                        ),
                      )
                    ) {
                      await supabase
                        .from('crm_campaigns')
                        .delete()
                        .eq('id', c.id)
                      fetchData()
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />{' '}
                  {t('merchant.pre_launch.delete', 'Excluir')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {companyId && (
        <CRMCampaignDialog
          open={openForm}
          onOpenChange={(v) => {
            setOpenForm(v)
            if (!v) setEditData(null)
          }}
          companyId={companyId}
          groups={groups}
          editData={editData}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
