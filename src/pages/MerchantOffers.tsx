import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Tag, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function MerchantOffers() {
  const { t } = useLanguage()
  const { companyId, franchiseId, affiliateId, profile, role } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  const isMaster = role === 'admin' || role === 'super_admin'

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('ad_campaigns')
        .select(
          `
        *,
        advertiser:ad_advertisers(company_name)
      `,
        )
        .order('created_at', { ascending: false })

      if (!isMaster) {
        if (companyId) {
          query = query.eq('company_id', companyId)
        } else if (franchiseId) {
          query = query.eq('franchise_id', franchiseId)
        } else if (affiliateId) {
          query = query.eq('affiliate_id', affiliateId)
        }
      }

      const { data, error } = await query
      if (error) throw error
      setCampaigns(data || [])
    } catch (error: any) {
      toast.error(t('merchant.offers.error_fetch', 'Erro ao buscar ofertas'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId, isMaster])

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        t('common.confirm_delete', 'Tem certeza que deseja excluir?'),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(t('common.deleted', 'Excluído com sucesso'))
      fetchCampaigns()
    } catch (error) {
      toast.error(t('common.error', 'Ocorreu um erro'))
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-primary" />
            {t('merchant.offers.title', 'Gestão de Ofertas')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(
              'merchant.offers.desc',
              'Crie, gerencie e acompanhe a performance das suas ofertas com uma visão detalhada.',
            )}
          </p>
        </div>
        <Link to="/merchant">
          <Button variant="outline">{t('common.back', 'Voltar')}</Button>
        </Link>
      </div>

      <div className="bg-white p-0 md:p-6 rounded-xl border-0 md:border border-slate-200 md:shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 md:p-0 border-b md:border-0 pb-4 md:pb-0 gap-4">
          <h2 className="text-xl font-semibold text-slate-800">
            {t('merchant.offers.list', 'Campanhas')}
          </h2>
          <Button
            onClick={() => {
              setEditingCampaign(null)
              setIsFormOpen(true)
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {t('merchant.offers.create', '+ Criar Campanha')}
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('merchant.offers.col_title', 'Title')}</TableHead>
                <TableHead>
                  {t('merchant.offers.col_advertiser', 'Anunciante')}
                </TableHead>
                <TableHead>
                  {t('merchant.offers.col_placement', 'Placement')}
                </TableHead>
                <TableHead>
                  {t('merchant.offers.col_status', 'Status')}
                </TableHead>
                <TableHead className="text-right">
                  {t('merchant.offers.col_actions', 'Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500 font-medium"
                  >
                    {t('common.none', 'Nenhum')}
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium text-slate-800">
                      {campaign.title}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {campaign.advertiser?.company_name || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <Badge variant="outline" className="capitalize">
                        {campaign.placement || 'Padrão'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none'
                        }
                      >
                        {campaign.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCampaign(campaign)
                            setIsFormOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CampaignFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        companyId={companyId || undefined}
        franchiseId={franchiseId || undefined}
        affiliateId={affiliateId || undefined}
        editData={editingCampaign}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}
