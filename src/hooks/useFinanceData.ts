import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'

export interface FinancialEntry {
  id: string
  date: string
  desc: string
  category: string
  amount: number
  type: 'in' | 'out'
  status: 'paid' | 'pending' | 'scheduled' | 'canceled'
  entityId?: string
  entityName?: string
}

export function useFinanceData(franchiseId?: string) {
  const [data, setData] = useState<FinancialEntry[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchLedger() {
      let query = supabase
        .from('financial_ledger')
        .select('*')
        .order('transaction_date', { ascending: false })

      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }

      const { data: ledgerData, error } = await query

      if (!error && ledgerData) {
        const transactions: FinancialEntry[] = ledgerData.map((tx) => ({
          id: tx.id,
          date: tx.transaction_date,
          desc: tx.description,
          category: tx.category || 'Other',
          amount: Number(tx.amount),
          type: tx.type === 'credit' ? 'in' : 'out',
          status: (tx.status as FinancialEntry['status']) || 'paid',
          entityId: tx.franchise_id || tx.company_id || undefined,
          entityName: tx.reference_type || 'Platform',
        }))
        setData(transactions)
      }
    }
    fetchLedger()
  }, [franchiseId, t])

  return data
}
