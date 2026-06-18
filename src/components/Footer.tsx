import { Link } from 'react-router-dom'
import { Share2, AlertCircle, BellOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function Footer() {
  const languageContext = useLanguage() as any
  const t = languageContext.t
  const lang =
    languageContext.language ||
    languageContext.locale ||
    localStorage.getItem('app_language') ||
    'pt'

  const [footerContent, setFooterContent] = useState<Record<string, any>>({
    en: { about: '', company: '', mission: '', contact: '' },
    pt: { about: '', company: '', mission: '', contact: '' },
    es: { about: '', company: '', mission: '', contact: '' },
  })

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'footer_content')
          .maybeSingle()

        if (!error && data?.value) {
          const val = data.value as any
          if (val.en || val.pt || val.es) {
            setFooterContent((prev) => ({
              en: { ...prev.en, ...(val.en || {}) },
              pt: { ...prev.pt, ...(val.pt || {}) },
              es: { ...prev.es, ...(val.es || {}) },
            }))
          } else {
            // legacy flat structure support
            setFooterContent((prev) => ({
              ...prev,
              pt: { ...prev.pt, ...val },
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching footer content:', err)
      }
    }
    fetchFooter()
  }, [])

  const currentContent = footerContent[lang] || footerContent.pt

  const defaultAbout = t(
    'footer.default_about',
    'Somos uma plataforma dedicada a trazer as melhores ofertas e oportunidades aos nossos usuários através de geolocalização.',
  )
  const defaultCompany = t(
    'footer.default_company',
    'Routevoy Inc. é uma empresa de tecnologia focada em conectar negócios locais com consumidores.',
  )
  const defaultMission = t(
    'footer.default_mission',
    'Nossa missão é fortalecer o comércio local e ajudar os usuários a economizar em suas compras diárias.',
  )
  const defaultContact = t(
    'footer.default_contact',
    'Email: contact@routevoy.com\nTelefone: +1 234 567 8900\nEndereço: 123 Tech Street, Suite 456, City, Country',
  )

  return (
    <>
      <footer className="bg-[#0f172a] text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* About Us */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">
                {t('footer.about_us', 'Sobre Nós')}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentContent.about || defaultAbout}
              </p>
            </div>

            {/* Our Company */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">
                {t('footer.our_company', 'Nossa Empresa')}
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentContent.company || defaultCompany}
              </p>
            </div>

            {/* Our Mission */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">
                {t('footer.our_mission', 'Nossa Missão')}
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentContent.mission || defaultMission}
              </p>
            </div>

            {/* Contact Us */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">
                {t('footer.contact_us', 'Contate-nos')}
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {currentContent.contact || defaultContact}
              </p>
              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  to="/contact"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors block"
                >
                  {t('nav.contact', 'Enviar Mensagem / Fale Conosco')}
                </Link>
                <Link
                  to="/pwa-guide"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors block"
                >
                  {t('nav.pwa_guide', 'Instalar App (PWA Guide)')}
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50 text-center text-sm text-slate-500">
            <p>
              &copy; 2026 ROUTEVOY. {t('footer.rights', 'All rights reserved.')}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer">
          <Share2 className="w-5 h-5 text-indigo-600" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer">
          <BellOff className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </>
  )
}
