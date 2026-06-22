import { supabase } from '@/lib/supabase/client'

export const processPayment = async (
  invoiceId: string,
  paymentMethod: any = {},
) => {
  const { data, error } = await supabase.functions.invoke('process-payment', {
    body: { invoice_id: invoiceId, payment_method: paymentMethod },
  })
  return { data, error }
}
