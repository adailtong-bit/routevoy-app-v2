import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { PhoneInput } from '@/components/PhoneInput'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import {
  fetchAdvertisers,
  createAdvertiser,
  Advertiser,
} from '@/services/ad_advertisers'

import {
  Loader2,
  Building2,
  MapPin,
  CreditCard,
  ShieldAlert,
} from 'lucide-react'
import { useEnvironment } from '@/hooks/use-environment'

export function AdvertisersTab() {
  const { isDevelopment } = useEnvironment()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const { t } = useLanguage()

  const loadAdvertisers = async () => {
    setIsFetching(true)
    try {
      const data = await fetchAdvertisers(
        isDevelopment ? 'development' : 'production',
      )
      setAdvertisers(data || [])
    } catch (err) {
      console.error(err)
      toast.error(t('common.error', 'Erro ao carregar anunciantes'))
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    loadAdvertisers()
  }, [])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await createAdvertiser({
        company_name: data.companyName,
        tax_id: data.taxId,
        email: data.email,
        phone: data.phone,
        street: data.street,
        address_number: data.number,
        city: data.city,
        state: data.state,
        zip: data.zip,
        environment: isDevelopment ? 'development' : 'production',
      } as any)
      toast.success(t('common.success', 'Salvo com sucesso!'))
      setIsOpen(false)
      reset()
      await loadAdvertisers()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar anunciante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('ads.advertisers_companies', 'Anunciantes')}</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>{t('ads.new_advertiser', 'Novo Anunciante')}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t('ads.register_advertiser', 'Cadastrar')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <Building2 className="w-5 h-5" />
                  <h4>Dados Base do Anunciante</h4>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t('ads.company_name', 'Razão Social / Nome')}
                    </Label>
                    <Input
                      {...register('companyName')}
                      required
                      placeholder="Nome da empresa ou anunciante"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('auth.email', 'E-mail de Contato')}</Label>
                      <Input
                        type="email"
                        {...register('email')}
                        required
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('phone.label', 'Telefone / WhatsApp')}</Label>
                      <PhoneInput
                        value={watch('phone') || ''}
                        onChange={(val) =>
                          setValue('phone', val, { shouldValidate: true })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <CreditCard className="w-5 h-5" />
                  <h4>Dados de Cobrança & Faturamento</h4>
                </div>

                <div className="space-y-2">
                  <Label>{t('ads.tax_id', 'CNPJ / CPF')}</Label>
                  <Input
                    {...register('taxId')}
                    required
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '')
                      if (v.length <= 11) {
                        v = v.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
                          '$1.$2.$3-$4',
                        )
                      } else {
                        v = v.replace(
                          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/,
                          '$1.$2.$3/$4-$5',
                        )
                      }
                      e.target.value = v
                    }}
                  />
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>{t('address.street', 'Logradouro / Rua')}</Label>
                    <Input
                      {...register('street')}
                      required
                      placeholder="Av. Principal"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('address.number', 'Número')}</Label>
                      <Input
                        {...register('number')}
                        required
                        placeholder="123"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{t('address.city', 'Cidade')}</Label>
                      <Input
                        {...register('city')}
                        required
                        placeholder="São Paulo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('address.state', 'Estado (UF)')}</Label>
                      <Input
                        {...register('state')}
                        required
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('address.zip', 'CEP')}</Label>
                      <Input
                        {...register('zip')}
                        required
                        placeholder="00000-000"
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '')
                          v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2')
                          e.target.value = v
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="font-bold"
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isDevelopment && !isLoading && (
                    <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
                  )}
                  {isLoading
                    ? t('common.loading', 'Salvando...')
                    : isDevelopment
                      ? 'Salvar no Preview (Isolado)'
                      : 'Salvar Cadastro Base'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>
                    {t('ads.company', 'Empresa (Cadastro Base)')}
                  </TableHead>
                  <TableHead>
                    {t('ads.tax_id', 'CNPJ/CPF (Cobrança)')}
                  </TableHead>
                  <TableHead>{t('ads.contact', 'Contato')}</TableHead>
                  <TableHead>{t('ads.locality', 'Localidade')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisers.map((a) => (
                  <TableRow key={a.id || Math.random().toString()}>
                    <TableCell className="font-bold text-slate-800">
                      {a.company_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {a.tax_id}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{a.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {a.city}, {a.state}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {advertisers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-slate-300" />
                        <span className="text-lg font-medium">
                          {t(
                            'ads.no_advertisers',
                            'Nenhum anunciante cadastrado',
                          )}
                        </span>
                        <span className="text-sm">
                          Cadastre o primeiro anunciante para iniciar o
                          faturamento.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
