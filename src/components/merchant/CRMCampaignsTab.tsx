import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Megaphone, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'
import { useLanguage } from '@/stores/LanguageContext'

export function CRMCampaignsTab({ companyId }: { companyId?: string }) {
  const { t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    const { data: cData } = await supabase
      .from('crm_campaigns')
      .select('*, target_group:crm_target_groups(name)')
      .eq('company_id', companyId)
      .eq('is_exclusive', true)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {t('crm.campaigns.title', 'Targeted Campaigns (CRM)')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.campaigns.subtitle',
              'Send exclusive and private campaigns to your lead groups.',
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setOpenForm(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.campaigns.create_btn', 'Create Campaign')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl text-slate-500">
          <Megaphone className="w-8 h-8 mx-auto mb-3 text-slate-400" />
          <p>{t('crm.campaigns.empty', 'No targeted campaigns found.')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800">{c.name}</h4>
                  {c.is_exclusive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                      {t('crm.campaigns.private', 'Private')}
                    </span>
                  )}
                  {c.status && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {c.status}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">
                    {t('crm.campaigns.target_group', 'Target Group')}:
                  </span>{' '}
                  {c.target_group?.name ||
                    t('crm.campaigns.unknown', 'Unknown')}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    {t('crm.campaigns.channel', 'Channel')}:{' '}
                    <strong className="uppercase">{c.channel}</strong>
                  </span>
                  <span>
                    {t('crm.campaigns.clicks', 'Clicks')}:{' '}
                    <strong>{c.clicks || 0}</strong>
                  </span>
                  <span>
                    {t('crm.campaigns.redemptions', 'Redemptions')}:{' '}
                    <strong>{c.redemptions || 0}</strong>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditData(c)
                    setOpenForm(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (
                      confirm(
                        t(
                          'crm.campaigns.delete_confirm',
                          'Delete this campaign?',
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
                  <Trash2 className="w-4 h-4" />
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
