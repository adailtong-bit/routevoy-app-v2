import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Booking } from '@/lib/types'
import { ProfileCompletion } from './ProfileCompletion'
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface BookingPaymentModalProps {
  booking: Booking | null
  onClose: () => void
  onSuccess: () => void
}

export function BookingPaymentModal({
  booking,
  onClose,
  onSuccess,
}: BookingPaymentModalProps) {
  const { t, formatCurrency } = useLanguage()
  const { user, payBooking } = useCouponStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const isProfileMissingData =
    !user?.name || !user?.gender || !user?.birthday || !user?.documentNumber
  const [needsProfile, setNeedsProfile] = useState(isProfileMissingData)

  if (!booking) return null

  const handlePay = async () => {
    setIsProcessing(true)
    try {
      await payBooking(booking.id)
      toast.success(t('payment.success', 'Pagamento processado com sucesso!'), {
        description: t(
          'payment.voucher_ready',
          'Seu voucher consumido atomicamente e já está disponível.',
        ),
      })
      setIsProcessing(false)
      onSuccess()
      onClose()
    } catch (e: any) {
      setIsProcessing(false)
      toast.error(e.message || 'Erro ao processar pagamento ou cupom esgotado.')
    }
  }

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {needsProfile ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('booking.complete_profile', 'Complete seu Perfil')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'booking.profile_required_checkout',
                  'Para processar o pagamento e emitir seu voucher, precisamos dos seus dados completos.',
                )}
              </DialogDescription>
            </DialogHeader>
            <ProfileCompletion onSuccess={() => setNeedsProfile(false)} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {t('payment.checkout', 'Checkout Seguro')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'payment.checkout_desc',
                  'Revise os detalhes e insira as informações de pagamento para confirmar sua reserva em',
                )}{' '}
                <strong>{booking.storeName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">
                  {t('payment.total_amount', 'Valor Total')}
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCurrency(booking.price || 150)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('payment.secure_connection', 'Conexão 100% Segura')}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t('payment.card_number', 'Número do Cartão')}</Label>
                <div className="relative">
                  <Input placeholder="0000 0000 0000 0000" className="pl-9" />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('payment.expiry', 'Validade')}</Label>
                  <Input placeholder="MM/AA" />
                </div>
                <div className="space-y-1.5">
                  <Label>CVV</Label>
                  <Input placeholder="123" type="password" maxLength={4} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('payment.cardholder_name', 'Nome no Cartão')}</Label>
                <Input placeholder="NOME DO TITULAR" />
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full sm:w-auto font-bold bg-primary"
              >
                {isProcessing ? (
                  t('payment.processing', 'Processando...')
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    {t('payment.confirm_pay', 'Confirmar e Pagar')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
