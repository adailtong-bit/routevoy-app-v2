import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Loader2, Save } from 'lucide-react'

export function AdminSettingsTab() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [systemConfig, setSystemConfig] = useState({
    default_country: 'United States',
    default_currency: 'USD',
    default_language: 'en',
  })

  const [geoHierarchy, setGeoHierarchy] = useState({
    supported_countries: 'US, BR',
    default_radius: 50,
    levels: 'Country > State > City > Neighborhood',
  })

  const [editingLang, setEditingLang] = useState<'pt' | 'en'>('pt')

  const [footerContent, setFooterContent] = useState<Record<string, any>>({
    en: { about: '', company: '', mission: '', contact: '' },
    pt: { about: '', company: '', mission: '', contact: '' },
  })
  const [heroContent, setHeroContent] = useState<Record<string, any>>({
    en: { title: '', subtitle: '', cta_text: '' },
    pt: { title: '', subtitle: '', cta_text: '' },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', [
            'footer_content',
            'hero_content',
            'system_config',
            'geo_hierarchy',
          ])

        if (error) throw error

        if (data) {
          const footer = data.find((d) => d.key === 'footer_content')
          if (footer && footer.value) {
            const val = footer.value as any
            if (val.pt || val.en) {
              setFooterContent((prev) => ({
                pt: { ...prev.pt, ...val.pt },
                en: { ...prev.en, ...val.en },
              }))
            } else {
              setFooterContent((prev) => ({
                pt: { ...prev.pt, ...val },
                en: { ...prev.en, ...val },
              }))
            }
          }

          const hero = data.find((d) => d.key === 'hero_content')
          if (hero && hero.value) {
            const val = hero.value as any
            if (val.pt || val.en) {
              setHeroContent((prev) => ({
                pt: { ...prev.pt, ...val.pt },
                en: { ...prev.en, ...val.en },
              }))
            } else {
              setHeroContent((prev) => ({
                pt: { ...prev.pt, ...val },
                en: { ...prev.en, ...val },
              }))
            }
          }

          const system = data.find((d) => d.key === 'system_config')
          if (system && system.value) {
            setSystemConfig(system.value as any)
          }

          const geo = data.find((d) => d.key === 'geo_hierarchy')
          if (geo && geo.value) {
            setGeoHierarchy(geo.value as any)
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleFooterChange = (field: string, value: string) => {
    setFooterContent((prev) => ({
      ...prev,
      [editingLang]: {
        ...prev[editingLang],
        [field]: value,
      },
    }))
  }

  const handleHeroChange = (field: string, value: string) => {
    setHeroContent((prev) => ({
      ...prev,
      [editingLang]: {
        ...prev[editingLang],
        [field]: value,
      },
    }))
  }

  const handleSystemChange = (field: string, value: string) => {
    setSystemConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleGeoChange = (field: string, value: string | number) => {
    setGeoHierarchy((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (key: string, content: any) => {
    setSaving(key)
    try {
      // First try to check if the setting exists, if not, insert it, else update it
      // Using explicit select + update/insert is more robust if RLS UPSERT has issues
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle()

      let error = null
      if (existing) {
        const res = await supabase
          .from('site_settings')
          .update({
            value: content,
            updated_at: new Date().toISOString(),
          })
          .eq('key', key)
        error = res.error
      } else {
        const res = await supabase.from('site_settings').insert({
          key,
          value: content,
          updated_at: new Date().toISOString(),
        })
        error = res.error
      }

      if (error) throw error
      toast.success(t('admin.settings_saved', 'Settings saved successfully!'))
    } catch (err) {
      console.error(`Error saving ${key}:`, err)
      toast.error(t('admin.settings_error', 'Error saving settings.'))
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('admin.settings.title', 'Settings and Content')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.settings.desc',
            'Manage system settings and institutional website content.',
          )}
        </p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="system">
            {t('admin.settings.system_tab', 'System Settings')}
          </TabsTrigger>
          <TabsTrigger value="content">
            {t('admin.settings.content_tab', 'Site Content')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.global_region', 'Global Region & Standards')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.global_region_desc',
                  'Configure global system preferences.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_country', 'Default Country')}
                  </label>
                  <Input
                    value={systemConfig.default_country}
                    onChange={(e) =>
                      handleSystemChange('default_country', e.target.value)
                    }
                    placeholder={t(
                      'admin.settings.ph_country',
                      'e.g. United States',
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_currency', 'Default Currency')}
                  </label>
                  <Input
                    value={systemConfig.default_currency}
                    onChange={(e) =>
                      handleSystemChange('default_currency', e.target.value)
                    }
                    placeholder={t('admin.settings.ph_currency', 'e.g. USD')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_language', 'Default Language')}
                  </label>
                  <Input
                    value={systemConfig.default_language}
                    onChange={(e) =>
                      handleSystemChange('default_language', e.target.value)
                    }
                    placeholder={t('admin.settings.ph_language', 'e.g. en')}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('system_config', systemConfig)}
                disabled={saving === 'system_config'}
                className="w-full sm:w-auto mt-4"
              >
                {saving === 'system_config' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('common.save_changes', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  'admin.settings.geo_hierarchy_title',
                  'Geographic Hierarchy Manager',
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.geo_hierarchy_desc',
                  'Configure geolocation parameters and search levels.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t(
                      'admin.settings.supported_countries',
                      'Supported Countries',
                    )}
                  </label>
                  <Input
                    value={geoHierarchy.supported_countries}
                    onChange={(e) =>
                      handleGeoChange('supported_countries', e.target.value)
                    }
                    placeholder={t(
                      'admin.settings.ph_supported_countries',
                      'e.g. US, BR, UK',
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t(
                      'admin.settings.default_radius',
                      'Default Search Radius (km)',
                    )}
                  </label>
                  <Input
                    type="number"
                    value={geoHierarchy.default_radius}
                    onChange={(e) =>
                      handleGeoChange('default_radius', Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.hierarchy_levels', 'Hierarchy Levels')}
                  </label>
                  <Input
                    value={geoHierarchy.levels}
                    onChange={(e) => handleGeoChange('levels', e.target.value)}
                    placeholder={t(
                      'admin.settings.ph_levels',
                      'e.g. Country > State > City > Neighborhood',
                    )}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('geo_hierarchy', geoHierarchy)}
                disabled={saving === 'geo_hierarchy'}
                className="w-full sm:w-auto mt-4"
              >
                {saving === 'geo_hierarchy' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('common.save_changes', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-6">
            <span className="text-sm font-medium ml-2">
              {t(
                'admin.settings.edit_language',
                'Editing Language (Translation Mask):',
              )}
            </span>
            <Tabs
              value={editingLang}
              onValueChange={(v) => setEditingLang(v as any)}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pt">PT-BR</TabsTrigger>
                <TabsTrigger value="en">EN-US</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.hero_title', 'Home Page (Hero)')} (
                {editingLang.toUpperCase()})
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.hero_desc',
                  'Manage the main texts that appear in the first section of the home page.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.main_title', 'Main Title')}
                </label>
                <Input
                  value={heroContent[editingLang]?.title || ''}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  placeholder={t(
                    'admin.settings.ph_hero_title',
                    'e.g. Discover the Best Local Deals',
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.subtitle', 'Subtitle')}
                </label>
                <Textarea
                  rows={3}
                  value={heroContent[editingLang]?.subtitle || ''}
                  onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                  placeholder={t(
                    'admin.settings.ph_hero_subtitle',
                    'Descriptive text below the title',
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.cta', 'Call to Action (Button)')}
                </label>
                <Input
                  value={heroContent[editingLang]?.cta_text || ''}
                  onChange={(e) => handleHeroChange('cta_text', e.target.value)}
                  placeholder={t(
                    'admin.settings.ph_hero_cta',
                    'e.g. Enter Platform',
                  )}
                />
              </div>

              <Button
                onClick={() => handleSave('hero_content', heroContent)}
                disabled={saving === 'hero_content'}
                className="w-full sm:w-auto mt-4"
              >
                {saving === 'hero_content' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('common.save_changes', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.footer_title', 'Footer Content')} (
                {editingLang.toUpperCase()})
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.footer_desc',
                  'Manage the institutional texts displayed in the site footer.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.about', 'About Us')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent[editingLang]?.about || ''}
                  onChange={(e) => handleFooterChange('about', e.target.value)}
                  placeholder={t(
                    'admin.settings.ph_about',
                    'Text for the About Us section',
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.company', 'Our Company')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent[editingLang]?.company || ''}
                  onChange={(e) =>
                    handleFooterChange('company', e.target.value)
                  }
                  placeholder={t(
                    'admin.settings.ph_company',
                    'Text for the Our Company section',
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.mission', 'Our Mission')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent[editingLang]?.mission || ''}
                  onChange={(e) =>
                    handleFooterChange('mission', e.target.value)
                  }
                  placeholder={t(
                    'admin.settings.ph_mission',
                    'Text for the Our Mission section',
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.contact', 'Contact')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent[editingLang]?.contact || ''}
                  onChange={(e) =>
                    handleFooterChange('contact', e.target.value)
                  }
                  placeholder={t(
                    'admin.settings.ph_contact',
                    'Email, phone, address...',
                  )}
                />
              </div>

              <Button
                onClick={() => handleSave('footer_content', footerContent)}
                disabled={saving === 'footer_content'}
                className="w-full sm:w-auto mt-4"
              >
                {saving === 'footer_content' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('common.save_changes', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
