import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Receipt,
  ArrowRight,
  QrCode,
  Tag,
  Camera,
  Banknote,
  ArrowLeft,
  CameraOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ScannerStep = 'input_total' | 'scanning' | 'review' | 'success'

interface VoucherData {
  id: string
  title: string
  desc: string
  discountStr: string
  storeName: string
  discountAmount: number
  finalTotal: number
}

export default function MerchantScanner() {
  const navigate = useNavigate()
  const { formatCurrency } = useLanguage()
  const { user, companyId } = useAuth()

  const [step, setStep] = useState<ScannerStep>('input_total')
  const [checkoutTotalStr, setCheckoutTotalStr] = useState<string>('')
  const [scannedCode, setScannedCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState<boolean>(true)
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (step === 'scanning' && codeInputRef.current && !hasCamera) {
      codeInputRef.current.focus()
    }
  }, [step, hasCamera])

  // Camera integration
  useEffect(() => {
    let stream: MediaStream | null = null
    let intervalId: NodeJS.Timeout | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        setHasCamera(true)
        setCameraError(null)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', 'true') // iOS safari requirement
          await videoRef.current.play()

          if ('BarcodeDetector' in window) {
            // @ts-expect-error - BarcodeDetector is not in TS lib.dom.d.ts by default yet
            const barcodeDetector = new window.BarcodeDetector({
              formats: ['qr_code', 'ean_13', 'code_128'],
            })

            intervalId = setInterval(async () => {
              if (
                videoRef.current &&
                videoRef.current.readyState ===
                  videoRef.current.HAVE_ENOUGH_DATA
              ) {
                try {
                  const barcodes = await barcodeDetector.detect(
                    videoRef.current,
                  )
                  if (barcodes.length > 0) {
                    const code = barcodes[0].rawValue
                    setScannedCode(code)
                    if (intervalId) clearInterval(intervalId)
                    handleValidateCode(code)
                  }
                } catch (e) {
                  console.error('Barcode detection error', e)
                }
              }
            }, 500)
          } else {
            setCameraError(
              'Barcode scanning is not natively supported in this browser. Please use manual input.',
            )
          }
        }
      } catch (err) {
        console.error('Camera access denied or error:', err)
        setHasCamera(false)
        setCameraError(
          'Camera access denied. Please enable camera permissions or enter the code manually.',
        )
      }
    }

    if (step === 'scanning') {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [step])

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/vendor')
    }
  }

  const handleStartScanning = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(checkoutTotalStr.replace(',', '.'))
    if (isNaN(total) || total <= 0) {
      setError('Please enter a valid purchase amount.')
      return
    }
    setError(null)
    setStep('scanning')
  }

  const handleValidateCode = async (codeStr: string) => {
    const code = codeStr.trim()
    if (!code) {
      setError('Enter a voucher code.')
      return
    }

    const { data, error: rpcError } = await supabase.rpc(
      'validate_promotion_by_code',
      {
        p_code: code,
      },
    )

    if (rpcError) {
      setError('Server error: ' + rpcError.message)
      return
    }

    const result = data as any
    if (!result.success) {
      setError(result.message || 'Invalid code.')
      return
    }

    const total = parseFloat(checkoutTotalStr.replace(',', '.'))
    let discountAmount = 0
    let discountStr = result.discount || ''

    if (result.discount_percentage) {
      discountAmount = (total * result.discount_percentage) / 100
      discountStr = `${result.discount_percentage}%`
    } else if (result.discount) {
      const lowerStr = result.discount.toLowerCase()
      if (lowerStr.includes('%')) {
        const match = lowerStr.match(/(\d+)\s*%/)
        if (match) {
          discountAmount = (total * parseFloat(match[1])) / 100
        }
      } else {
        const match = lowerStr.match(/(\d+[.,]?\d*)/)
        if (match) {
          discountAmount = parseFloat(match[1].replace(',', '.'))
        }
      }
    }

    const finalTotal = Math.max(0, total - discountAmount)

    setError(null)
    setVoucherData({
      id: result.id,
      title: result.title || 'Voucher',
      desc: result.description || 'Special Discount',
      discountStr,
      storeName: result.store_name || 'Store',
      discountAmount,
      finalTotal,
    })
    setStep('review')
  }

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault()
    handleValidateCode(scannedCode)
  }

  const handleConfirm = async () => {
    if (!voucherData?.id) return

    const { data, error: rpcError } = await supabase.rpc('consume_promotion', {
      p_promo_id: voucherData.id,
      p_user_id: user?.id || null,
    })

    if (rpcError) {
      setError('Server error: ' + rpcError.message)
      setStep('scanning')
      return
    }

    const result = data as any
    if (result.success) {
      // Log validation for operator tracking
      if (companyId && user) {
        await supabase.from('merchant_validations').insert({
          company_id: companyId,
          operator_id: user.id,
          promotion_id: voucherData.id,
          promotion_title: voucherData.title,
          discount_amount: voucherData.discountAmount,
          final_amount: voucherData.finalTotal,
        })
      }
      setStep('success')
    } else {
      setError(result.message || 'Error validating voucher')
      setStep('scanning')
    }
  }

  const handleReset = () => {
    setStep('input_total')
    setCheckoutTotalStr('')
    setScannedCode('')
    setVoucherData(null)
    setError(null)
    setCameraError(null)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in relative dark">
      <div className="w-full max-w-md mb-6 flex justify-start">
        <Button
          variant="outline"
          onClick={handleBack}
          className="font-semibold text-slate-300 bg-slate-900 border-slate-800 shadow-sm hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 overflow-hidden relative text-slate-100">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-50">
            Merchant Scanner
          </CardTitle>
          <CardDescription className="text-slate-400">
            Point of Sale - Voucher Validation
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-red-950/50 border-red-900 text-red-200 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-semibold ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {cameraError && step === 'scanning' && (
            <Alert className="mb-6 border-amber-500 bg-amber-50 text-amber-900 animate-in fade-in">
              <CameraOff className="h-4 w-4 text-amber-600" />
              <AlertDescription className="font-medium ml-2 text-amber-800">
                {cameraError}
              </AlertDescription>
            </Alert>
          )}

          {step === 'input_total' && (
            <form
              onSubmit={handleStartScanning}
              className="space-y-6 animate-in slide-in-from-right-4"
            >
              <div className="space-y-4">
                <Label
                  htmlFor="total"
                  className="text-base font-semibold text-slate-200 flex items-center gap-2"
                >
                  <Banknote className="h-5 w-5 text-slate-400" /> Total Purchase
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">
                    $
                  </span>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={checkoutTotalStr}
                    onChange={(e) => setCheckoutTotalStr(e.target.value)}
                    className="pl-12 h-16 text-2xl font-bold bg-slate-950 border-slate-800 text-slate-100 shadow-inner rounded-xl focus-visible:ring-primary/50"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-slate-400 text-center px-4">
                  Enter the gross purchase amount before applying the voucher
                  discount.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                Proceed to Scan <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}

          {step === 'scanning' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-64 border-4 border-slate-800 shadow-inner">
                {hasCamera && !cameraError ? (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black" />
                )}

                {/* Scanning Frame Overlay */}
                <div className="w-40 h-40 border-2 border-emerald-500/50 relative z-10 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg -translate-x-1 -translate-y-1" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg -translate-x-1 translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg translate-x-1 translate-y-1" />

                  {hasCamera && !cameraError && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.8)] animate-[slide-down_2s_ease-in-out_infinite_alternate]" />
                  )}
                </div>

                <div className="absolute bottom-4 flex items-center gap-2 text-white/70 text-sm font-medium z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {hasCamera && !cameraError ? (
                    <>
                      <Camera className="h-4 w-4" /> Camera Active
                    </>
                  ) : (
                    <>
                      <CameraOff className="h-4 w-4" /> Manual Mode
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleSimulateScan} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Or type the code manually
                  </Label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="code"
                      ref={codeInputRef}
                      placeholder="EX: VCH-12345"
                      value={scannedCode}
                      onChange={(e) =>
                        setScannedCode(e.target.value.toUpperCase())
                      }
                      className="pl-10 uppercase h-12 font-mono tracking-wider bg-slate-950 border-slate-800 text-slate-100 rounded-lg shadow-inner"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('input_total')}
                    className="h-12 px-4 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-12 flex-1 font-bold">
                    Validate Code
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 'review' && voucherData && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-dashed border-slate-800">
                  <div className="bg-primary/20 p-2.5 rounded-lg shrink-0">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 leading-tight mb-1">
                      {voucherData.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {voucherData.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(
                        parseFloat(checkoutTotalStr.replace(',', '.')),
                        'USD',
                        'en-US',
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-400 font-medium bg-emerald-950/30 -mx-5 px-5 py-2">
                    <span className="flex items-center gap-1.5">
                      Voucher Discount ({voucherData.discountStr})
                    </span>
                    <span>
                      -{' '}
                      {formatCurrency(
                        voucherData.discountAmount,
                        'USD',
                        'en-US',
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold text-slate-50 pt-2 border-t border-slate-800">
                    <span>Amount to Pay</span>
                    <span>
                      {formatCurrency(voucherData.finalTotal, 'USD', 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirm}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl"
                >
                  <Receipt className="mr-2 h-5 w-5" /> Confirm and Apply
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('scanning')}
                  className="text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-950 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/50 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-50 mb-2">
                Discount Applied Successfully!
              </h2>
              <p className="text-slate-400 mb-8 max-w-[250px]">
                The voucher has been validated, marked as used, and the
                transaction was recorded.
              </p>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="w-full h-14 rounded-xl font-bold bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> New Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
