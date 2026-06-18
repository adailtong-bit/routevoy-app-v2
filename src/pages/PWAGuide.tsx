import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'

export default function PWAGuide() {
  const { t } = useLanguage()

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t('pwa_guide.title', 'Install our App')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            'pwa_guide.desc',
            "Keep RouteVoy always at hand, right on your phone's home screen. No need to download from the app store!",
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-green-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.523 15.3414C17.523 15.3414 16.5937 15.3414 15.3414 15.3414V11.523C15.3414 10.2707 14.4121 10.2707 14.4121 10.2707C14.4121 10.2707 14.4121 11.2001 14.4121 12.4524V16.2707C14.4121 17.523 15.3414 17.523 15.3414 17.523H17.523V15.3414ZM11.523 15.3414V17.523H12.4524V15.3414H11.523ZM12.4524 8.08906C10.0242 8.08906 8.08906 10.0242 8.08906 12.4524C8.08906 14.8806 10.0242 16.8157 12.4524 16.8157C14.8806 16.8157 16.8157 14.8806 16.8157 12.4524C16.8157 10.0242 14.8806 8.08906 12.4524 8.08906Z" />
              </svg>
              {t('pwa_guide.android.title', 'Android Users')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold">
                  {t('pwa_guide.android.step1_title', 'Open Google Chrome')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    'pwa_guide.android.step1_desc',
                    'Access our website using the Chrome browser on your Android phone.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold">
                  {t('pwa_guide.android.step2_title', 'Tap the options menu')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    'pwa_guide.android.step2_desc',
                    'Locate and tap the three dots icon in the top right corner of the screen.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold">
                  {t(
                    'pwa_guide.android.step3_title',
                    'Select "Add to Home Screen"',
                  )}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    'pwa_guide.android.step3_desc',
                    "Open the menu in Chrome (three dots) and select 'Add to Home Screen'.",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-gray-800"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.223 14.51c-.18.06-.475.105-.885.105-1.5 0-2.455-1.04-2.455-2.735v-3.79H10.45v-.865h1.43V7.275h.985v1.96h2.095v.865h-2.095v3.66c0 1.05.47 1.545 1.345 1.545.315 0 .585-.045.74-.09v.885z" />
              </svg>
              {t('pwa_guide.ios.title', 'iOS Users (iPhone)')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold">
                  {t('pwa_guide.ios.step1_title', 'Open Safari')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    'pwa_guide.ios.step1_desc',
                    'Access our website using the native Safari browser on your iPhone.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold">
                  {t('pwa_guide.ios.step2_title', 'Tap Share')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(
                    'pwa_guide.ios.step2_desc',
                    'Locate and tap the Share icon (a square with an upward arrow) in the bottom bar.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold">
                  {t(
                    'pwa_guide.ios.step3_title',
                    'Select "Add to Home Screen"',
                  )}
                </h3>
                <p className="text-muted-foreground text-sm">
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
  )
}
