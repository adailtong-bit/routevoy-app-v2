import { Link } from 'react-router-dom'
import { MapPin, Mail } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { LanguageSelector } from '@/components/LanguageSelector'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-700">RouteVoy</h3>
            <p className="text-gray-600 text-sm">
              {t(
                'admin.settings.mission_ph',
                'Finding the best local deals and experiences near you.',
              )}
            </p>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <span className="text-sm text-gray-500">
                {t('common.language', 'Language')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">
              {t('nav.explore', 'Explore')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/explore" className="hover:text-blue-600">
                  {t('home.all_offers', 'All Offers')}
                </Link>
              </li>
              <li>
                <Link to="/seasonal-calendar" className="hover:text-blue-600">
                  {t('nav.seasonal', 'Seasonal')}
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-blue-600">
                  {t('nav.travel', 'Experiences')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">
              {t('admin.settings.company', 'Our Company')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/contact" className="hover:text-blue-600">
                  {t('admin.settings.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link to="/pwa-guide" className="hover:text-blue-600">
                  App (PWA)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600">
                  {t('admin.settings.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">
              {t('admin.settings.contact', 'Contact')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                <span>contato@routevoy.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                <span>Global</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} RouteVoy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
