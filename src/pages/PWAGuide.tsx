import { useLanguage } from '@/stores/LanguageContext'
import {
  Smartphone,
  Apple,
  Chrome,
  Share,
  PlusSquare,
  MoreVertical,
} from 'lucide-react'

export default function PWAGuide() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('pwa_guide.title', 'Install our App')}
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            {t(
              'pwa_guide.desc',
              "Keep RouteVoy always at hand, right on your phone's home screen. No need to download from the app store!",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Android Guide */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="bg-green-500 p-6 text-white flex items-center gap-4">
              <Chrome className="w-8 h-8" />
              <h2 className="text-xl font-bold">
                {t('pwa_guide.android.title', 'Android Users')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('pwa_guide.android.step1_title', 'Open Google Chrome')}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.android.step1_desc',
                      'Access our website using the Chrome browser on your Android phone.',
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {t('pwa_guide.android.step2_title', 'Tap the options menu')}
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.android.step2_desc',
                      'Locate and tap the three dots icon in the top right corner of the screen.',
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {t(
                      'pwa_guide.android.step3_title',
                      'Select "Add to Home Screen"',
                    )}
                    <PlusSquare className="w-4 h-4 text-gray-400" />
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.android.step3_desc',
                      "Open the menu in Chrome (three dots) and select 'Add to Home Screen'.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* iOS Guide */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="bg-gray-900 p-6 text-white flex items-center gap-4">
              <Apple className="w-8 h-8" />
              <h2 className="text-xl font-bold">
                {t('pwa_guide.ios.title', 'iOS Users (iPhone)')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('pwa_guide.ios.step1_title', 'Open Safari')}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.ios.step1_desc',
                      'Access our website using the native Safari browser on your iPhone.',
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {t('pwa_guide.ios.step2_title', 'Tap Share')}
                    <Share className="w-4 h-4 text-blue-500" />
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.ios.step2_desc',
                      'Locate and tap the Share icon (a square with an upward arrow) in the bottom bar.',
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {t(
                      'pwa_guide.ios.step3_title',
                      'Select "Add to Home Screen"',
                    )}
                    <PlusSquare className="w-4 h-4 text-gray-400" />
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(
                      'pwa_guide.ios.step3_desc',
                      "Tap the 'Share' icon in Safari and select 'Add to Home Screen'.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
