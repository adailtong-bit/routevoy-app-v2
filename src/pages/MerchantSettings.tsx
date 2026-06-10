import { Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'

export default function MerchantSettings() {
  const { t } = useLanguage()

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t('merchant.settings.title', 'Configurações')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-sm">
              Configure os detalhes da sua loja, horários de funcionamento e
              dados de contato. (Em desenvolvimento)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-sm">
              Gerencie alertas de campanhas, leads e interações dos usuários.
              (Em desenvolvimento)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
