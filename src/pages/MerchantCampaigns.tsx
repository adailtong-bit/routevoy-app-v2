import { useState, useEffect } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Target, Megaphone } from 'lucide-react'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantCampaigns() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { user: authUser } = useAuth()
  const [myCompany, setMyCompany] = useState<any>(null)

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        return
      }
      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
        }
      }
    }
    resolveCompany()
  }, [companies, user, authUser])

  if (!myCompany) return <div className="p-8">Carregando...</div>

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            {t('merchant.campaigns.title', 'Campaigns')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie campanhas direcionadas e gerencie seus grupos alvo com
            integração total.
          </p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-white p-1 shadow-sm border border-slate-100 mb-4 h-auto flex-wrap justify-start rounded-xl">
          <TabsTrigger
            value="campaigns"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2"
          >
            <Send className="w-4 h-4 mr-2" /> Campanhas
          </TabsTrigger>
          <TabsTrigger
            value="target_groups"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2"
          >
            <Target className="w-4 h-4 mr-2" /> Grupos Alvo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-0 outline-none">
          <CommunicationCampaignsTab companyId={myCompany.id} />
        </TabsContent>

        <TabsContent value="target_groups" className="mt-0 outline-none">
          <TargetGroupsTab companyId={myCompany.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
