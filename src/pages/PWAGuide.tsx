import { Smartphone, Share, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'

export default function PWAGuide() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-12 px-4 bg-slate-50/50 dark:bg-background">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            {t('pwa_guide.title', 'Install our App')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              'pwa_guide.desc',
              "Keep RouteVoy always at hand, right on your phone's home screen. No need to download from the app store!",
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-t-4 border-t-green-500 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <Smartphone className="w-6 h-6" />
                {t('pwa_guide.android.title', 'Android Users')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {t('pwa_guide.android.step1_title', 'Open Google Chrome')}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.android.step1_desc',
                      'Access our website using the Chrome browser on your Android phone.',
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    {t('pwa_guide.android.step2_title', 'Tap the options menu')}{' '}
                    <MoreVertical className="w-5 h-5 text-slate-500" />
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.android.step2_desc',
                      'Locate and tap the three dots icon in the top right corner of the screen.',
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {t(
                      'pwa_guide.android.step3_title',
                      'Select "Add to Home Screen"',
                    )}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.android.step3_desc',
                      "Open the menu in Chrome (three dots) and select 'Add to Home Screen'.",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                <Smartphone className="w-6 h-6" />
                {t('pwa_guide.ios.title', 'iOS Users (iPhone)')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {t('pwa_guide.ios.step1_title', 'Open Safari')}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.ios.step1_desc',
                      'Access our website using the native Safari browser on your iPhone.',
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    {t('pwa_guide.ios.step2_title', 'Tap Share')}{' '}
                    <Share className="w-4 h-4 text-blue-500" />
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.ios.step2_desc',
                      'Locate and tap the Share icon (a square with an upward arrow) in the bottom bar.',
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {t(
                      'pwa_guide.ios.step3_title',
                      'Select "Add to Home Screen"',
                    )}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {t(
                      'pwa_guide.ios.step3_desc',
                      "Tap the 'Share' icon in Safari and select 'Add to Home Screen'.",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
