import { useAuth } from '@/hooks/use-auth'
import { CrawlerSourcesTab } from '@/components/admin/CrawlerSourcesTab'
import { Bot } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function MerchantCrawler() {
  const { companyId } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            {t('admin.crawler', 'Crawler de Ofertas')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(
              'merchant.crawler.desc',
              'Configure fontes de dados orgânicas para captura da sua loja.',
            )}
          </p>
        </div>
        <Link to="/merchant/dashboard">
          <Button variant="outline">{t('common.back', 'Voltar')}</Button>
        </Link>
      </div>

      <div className="bg-white p-0 md:p-6 rounded-xl border-0 md:border border-slate-200 md:shadow-sm">
        <CrawlerSourcesTab companyId={companyId || undefined} />
      </div>
    </div>
  )
}
