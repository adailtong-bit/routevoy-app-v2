import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface LedgerTransaction {
  id: string
  transaction_date: string
  description: string
  category: string
  amount: number
  type: 'credit' | 'debit'
  status: string
  reference_id?: string
  running_balance: number
}

export interface LedgerSummary {
  initialBalance: number
  periodCredits: number
  periodDebits: number
  closingBalance: number
}

interface Filters {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  userId?: string
}

export function useFinanceLedger(
  startDate: Date,
  endDate: Date,
  filters?: Filters,
) {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([])
  const [summary, setSummary] = useState<LedgerSummary>({
    initialBalance: 0,
    periodCredits: 0,
    periodDebits: 0,
    closingBalance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLedger() {
      setLoading(true)
      try {
        let baseQuery = supabase
          .from('financial_ledger')
          .select('amount, type, transaction_date')
        let periodQuery = supabase.from('financial_ledger').select('*')

        if (filters?.franchiseId) {
          baseQuery = baseQuery.eq('franchise_id', filters.franchiseId)
          periodQuery = periodQuery.eq('franchise_id', filters.franchiseId)
        }
        if (filters?.companyId) {
          baseQuery = baseQuery.eq('company_id', filters.companyId)
          periodQuery = periodQuery.eq('company_id', filters.companyId)
        }
        if (filters?.affiliateId) {
          baseQuery = baseQuery.eq('affiliate_id', filters.affiliateId)
          periodQuery = periodQuery.eq('affiliate_id', filters.affiliateId)
        }

        // 1. Calculate Initial Balance (before start date)
        const { data: initialData } = await baseQuery.lt(
          'transaction_date',
          startDate.toISOString(),
        )

        let initialBal = 0
        initialData?.forEach((row) => {
          if (row.type === 'credit') initialBal += Number(row.amount)
          else initialBal -= Number(row.amount)
        })

        // 2. Fetch Period Transactions
        const { data: periodData, error } = await periodQuery
          .gte('transaction_date', startDate.toISOString())
          .lte('transaction_date', endDate.toISOString())
          .order('transaction_date', { ascending: true })

        if (error) throw error

        // 3. Calculate Running Balance & Period Summary
        let currentBal = initialBal
        let credits = 0
        let debits = 0

        const processedTxs = (periodData || []).map((tx) => {
          const amt = Number(tx.amount)
          if (tx.type === 'credit') {
            currentBal += amt
            credits += amt
          } else {
            currentBal -= amt
            debits += amt
          }
          return {
            ...tx,
            amount: amt,
            running_balance: currentBal,
          } as LedgerTransaction
        })

        setSummary({
          initialBalance: initialBal,
          periodCredits: credits,
          periodDebits: debits,
          closingBalance: currentBal,
        })

        // Reverse for display (newest first)
        setTransactions(processedTxs.reverse())
      } catch (err) {
        console.error('Error fetching ledger:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLedger()
  }, [
    startDate,
    endDate,
    filters?.franchiseId,
    filters?.companyId,
    filters?.affiliateId,
  ])

  return { transactions, summary, loading }
}
