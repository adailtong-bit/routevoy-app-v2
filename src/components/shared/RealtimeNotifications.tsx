import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function RealtimeNotifications() {
  const { user, companyId, franchiseId, affiliateId } = useAuth()

  useEffect(() => {
    if (!user) return

    const ledgerSub = supabase
      .channel('ledger_notifications_app')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'financial_ledger',
        },
        (payload) => {
          const newRecord = payload.new
          if (
            (newRecord.user_id && newRecord.user_id === user.id) ||
            (newRecord.company_id && newRecord.company_id === companyId) ||
            (newRecord.franchise_id &&
              newRecord.franchise_id === franchiseId) ||
            (newRecord.affiliate_id && newRecord.affiliate_id === affiliateId)
          ) {
            const isCredit =
              newRecord.type === 'credit' || newRecord.type === 'receipt'
            const msg = isCredit
              ? `Received: $${newRecord.amount}`
              : `Debited: $${newRecord.amount}`

            toast.success(isCredit ? 'New Credit' : 'New Debit', {
              description: msg,
            })
          }
        },
      )
      .subscribe()

    const affiliateSub = supabase
      .channel('affiliate_notifications_app')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'affiliate_transactions',
        },
        (payload) => {
          const newRecord = payload.new
          if (
            newRecord.affiliate_id &&
            newRecord.affiliate_id === affiliateId
          ) {
            const msg = `Commission: $${newRecord.total_commission} from ${newRecord.product_name}.`

            toast.success('Commission Earned!', {
              description: msg,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'affiliate_withdrawals',
        },
        (payload) => {
          const newRecord = payload.new
          const oldRecord = payload.old
          if (
            newRecord.affiliate_id === affiliateId &&
            newRecord.status !== oldRecord.status &&
            newRecord.status === 'completed'
          ) {
            const msg = `Withdrawal of $${newRecord.amount} processed.`
            toast.success('Withdrawal Processed', { description: msg })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ledgerSub)
      supabase.removeChannel(affiliateSub)
    }
  }, [user, companyId, franchiseId, affiliateId])

  return null
}
