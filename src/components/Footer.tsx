import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'

export function Footer() {
  const [content, setContent] = useState({
    about:
      'We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.',
    company:
      'Routevoy Inc. is a technology company focused on connecting local businesses with consumers.',
    mission:
      'Our mission is to empower local commerce and help users save money on their everyday purchases.',
    contact:
      'Email: contact@routevoy.com\nPhone: +1 234 567 8900\nAddress: 123 Tech Street, Suite 456, City, Country',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'footer_content')
          .maybeSingle()

        if (error) throw error
        if (data && data.value) {
          setContent(data.value as any)
        }
      } catch (e) {
        console.error('Failed to load footer settings:', e)
      }
    }
    fetchSettings()
  }, [])

  const { t } = useLanguage()

  return (
    <footer className="bg-slate-900 text-slate-200 py-8 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">
            {t('footer.about', 'About Us')}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
            {content.about}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">
            {t('footer.company', 'Our Company')}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
            {content.company}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">
            {t('footer.mission', 'Our Mission')}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
            {content.mission}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">
            {t('footer.contact', 'Contact Us')}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-wrap mb-4">
            {content.contact}
          </p>
          <div className="flex flex-col space-y-2">
            <Link
              to="/contact"
              className="text-sm text-primary hover:underline"
            >
              {t('footer.contact_link', 'Enviar Mensagem / Fale Conosco')}
            </Link>
            <Link
              to="/pwa-guide"
              className="text-sm text-primary hover:underline"
            >
              {t('footer.pwa_link', 'Instalar App (PWA Guide)')}
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-6 pt-6 border-t border-slate-800/50 text-center text-xs text-slate-500">
        &copy; 2026 OPPORJOB. {t('footer.rights', 'All rights reserved.')}
      </div>
    </footer>
  )
}
