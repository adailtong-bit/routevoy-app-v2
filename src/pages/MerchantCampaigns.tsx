import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { CampaignsManager } from '@/components/shared/CampaignsManager'

export default function MerchantCampaigns() {
  const { user: authUser, profile } = useAuth()
  const { user, companies } = useCouponStore()
  const [myCompany, setMyCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        setLoading(false)
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
      setLoading(false)
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!myCompany) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto text-center text-slate-500">
        Nenhuma empresa associada. Aguarde aprovação ou registre seu
        estabelecimento.
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <CampaignsManager companyId={myCompany.id} companyName={myCompany.name} />
    </div>
  )
}
