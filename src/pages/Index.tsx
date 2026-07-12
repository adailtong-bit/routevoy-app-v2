import { useEffect, useState } from 'react'
import { AggregatorFeed } from '@/components/AggregatorFeed'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { MapPin, Tag, Compass, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function IndexPage() {
  const { user, loading, profile } = useAuth()
  const languageContext = useLanguage() as any
  const t = languageContext.t
  const lang =
    languageContext.language ||
    languageContext.locale ||
    localStorage.getItem('app_language') ||
    'pt'

  const [heroContent, setHeroContent] = useState<Record<string, any>>({
    en: { title: '', subtitle: '', cta_text: '' },
    pt: { title: '', subtitle: '', cta_text: '' },
    es: { title: '', subtitle: '', cta_text: '' },
  })
  const [profileWaited, setProfileWaited] = useState(false)

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_content')
          .maybeSingle()

        if (error) throw error
        if (data && data.value) {
          const val = data.value as any
          if (val.en || val.pt || val.es) {
            setHeroContent((prev) => ({
              en: { ...prev.en, ...(val.en || {}) },
              pt: { ...prev.pt, ...(val.pt || {}) },
              es: { ...prev.es, ...(val.es || {}) },
            }))
          } else {
            // legacy flat structure support
            setHeroContent((prev) => ({
              ...prev,
              pt: { ...prev.pt, ...val },
            }))
          }
        }
      } catch (e) {
        console.error('Failed to load hero settings:', e)
      }
    }
    fetchHeroContent()
  }, [])

  const currentHero = heroContent[lang] || heroContent.pt

  useEffect(() => {
    if (user && !profile && !loading) {
      const timer = setTimeout(() => setProfileWaited(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [user, profile, loading])

  // Guard to prevent premature rendering before auth/profile sync is complete,
  // preventing null-reference crashes (like undefined arrays for .filter())
  // The profileWaited flag ensures we don't loop forever if profile fails to load
  if (loading || (user && !profile && !profileWaited)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          {t('common.loading_platform', 'Loading platform...')}
        </p>
      </div>
    )
  }

  // Defensive array checks to avoid runtime errors like "Cannot read properties of undefined (reading 'filter')"
  const safeUser = user || null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            {currentHero.title ||
              t('home.hero_title', 'Discover the Best Local Deals')}
          </h1>
          <p
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {currentHero.subtitle ||
              t(
                'home.hero_subtitle',
                'Find exclusive coupons, must-see promotions and amazing experiences based on your location.',
              )}
          </p>

          {!safeUser && (
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-100 w-full sm:w-auto font-bold px-8"
                >
                  {currentHero.cta_text || t('home.hero_cta', 'Enter Platform')}
                </Button>
              </Link>
              <Link to="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-600 w-full sm:w-auto px-8"
                >
                  {t('home.explore_offers', 'Explore Offers')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white border-b border-gray-200 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('home.feature_geo_title', 'Geolocation')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'home.feature_geo_desc',
                  'Find the closest opportunities to you in real-time.',
                )}
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('home.feature_coupons_title', 'Exclusive Campaigns')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'home.feature_coupons_desc',
                  'Access discounts you only find here at Routevoy.',
                )}
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('home.feature_experiences_title', 'Experiences')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'home.feature_experiences_desc',
                  'Discover new places and live unforgettable moments.',
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('home.weekly_highlights_title', 'Weekly Campaigns')}
            </h2>
            <p className="text-gray-600">
              {t(
                'home.weekly_highlights_desc',
                'The hottest campaigns selected for you.',
              )}
            </p>
          </div>
        </div>

        <AggregatorFeed />
      </main>
    </div>
  )
}
