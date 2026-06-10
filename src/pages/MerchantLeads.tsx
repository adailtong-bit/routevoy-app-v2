import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { Loader2 } from 'lucide-react'

export default function MerchantLeads() {
  const { user: authUser, profile } = useAuth()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCompany() {
      if (authUser?.email) {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle()

        if (merchant) {
          setCompanyId(merchant.id)
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          setCompanyId('admin')
        }
      }
      setIsLoading(false)
    }
    fetchCompany()
  }, [authUser, profile])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6">
      <AdminCRM
        companyId={companyId === 'admin' ? undefined : companyId || undefined}
      />
    </div>
  )
}
