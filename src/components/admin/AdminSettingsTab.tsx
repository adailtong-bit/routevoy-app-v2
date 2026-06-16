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
    default_country: 'Brasil',
    default_currency: 'BRL',
    default_language: 'pt-BR',
  })

  const [geoHierarchy, setGeoHierarchy] = useState({
    supported_countries: 'BR',
    default_radius: 50,
    levels: 'País > Estado > Cidade > Bairro',
  })

  const [footerContent, setFooterContent] = useState({
    about: '',
    company: '',
    mission: '',
    contact: '',
  })
  const [heroContent, setHeroContent] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
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
            setFooterContent(footer.value as any)
          }

          const hero = data.find((d) => d.key === 'hero_content')
          if (hero && hero.value) {
            setHeroContent(hero.value as any)
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
    setFooterContent((prev) => ({ ...prev, [field]: value }))
  }

  const handleHeroChange = (field: string, value: string) => {
    setHeroContent((prev) => ({ ...prev, [field]: value }))
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
      const { error } = await supabase.from('site_settings').upsert(
        {
          key,
          value: content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      )

      if (error) throw error
      toast.success(
        t('admin.settings_saved', 'Configurações salvas com sucesso!'),
      )
    } catch (err) {
      console.error(`Error saving ${key}:`, err)
      toast.error(t('admin.settings_error', 'Erro ao salvar configurações.'))
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
          {t('admin.settings.title', 'Configurações e Conteúdo')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.settings.desc',
            'Gerencie as configurações do sistema e o conteúdo institucional do site.',
          )}
        </p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="system">
            {t('admin.settings.system_tab', 'Configurações do Sistema')}
          </TabsTrigger>
          <TabsTrigger value="content">
            {t('admin.settings.content_tab', 'Conteúdo do Site')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.global_region', 'Região Global e Padrões')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.global_region_desc',
                  'Configure as preferências globais do sistema.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_country', 'País Padrão')}
                  </label>
                  <Input
                    value={systemConfig.default_country}
                    onChange={(e) =>
                      handleSystemChange('default_country', e.target.value)
                    }
                    placeholder="Ex: Brasil"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_currency', 'Moeda Padrão')}
                  </label>
                  <Input
                    value={systemConfig.default_currency}
                    onChange={(e) =>
                      handleSystemChange('default_currency', e.target.value)
                    }
                    placeholder="Ex: BRL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t('admin.settings.default_language', 'Idioma Padrão')}
                  </label>
                  <Input
                    value={systemConfig.default_language}
                    onChange={(e) =>
                      handleSystemChange('default_language', e.target.value)
                    }
                    placeholder="Ex: pt-BR"
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
                {t('common.save_changes', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  'admin.settings.geo_hierarchy_title',
                  'Gerenciador de Hierarquia Geográfica',
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.geo_hierarchy_desc',
                  'Configure os parâmetros de geolocalização e níveis de busca.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t(
                      'admin.settings.supported_countries',
                      'Países Suportados',
                    )}
                  </label>
                  <Input
                    value={geoHierarchy.supported_countries}
                    onChange={(e) =>
                      handleGeoChange('supported_countries', e.target.value)
                    }
                    placeholder="Ex: BR, US, PT"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    {t(
                      'admin.settings.default_radius',
                      'Raio de Busca Padrão (km)',
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
                    {t(
                      'admin.settings.hierarchy_levels',
                      'Níveis de Hierarquia',
                    )}
                  </label>
                  <Input
                    value={geoHierarchy.levels}
                    onChange={(e) => handleGeoChange('levels', e.target.value)}
                    placeholder="Ex: País > Estado > Cidade > Bairro"
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
                {t('common.save_changes', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.hero_title', 'Página Inicial (Hero)')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.hero_desc',
                  'Gerencie os textos principais que aparecem na primeira seção da página inicial.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.main_title', 'Título Principal')}
                </label>
                <Input
                  value={heroContent.title}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  placeholder="Ex: Descubra as Melhores Ofertas Locais"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.subtitle', 'Subtítulo')}
                </label>
                <Textarea
                  rows={3}
                  value={heroContent.subtitle}
                  onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                  placeholder="Texto descritivo abaixo do título"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.cta', 'Texto de Chamada (Botão)')}
                </label>
                <Input
                  value={heroContent.cta_text}
                  onChange={(e) => handleHeroChange('cta_text', e.target.value)}
                  placeholder="Ex: Entrar na Plataforma"
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
                {t('common.save_changes', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.settings.footer_title', 'Conteúdo do Rodapé')}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.settings.footer_desc',
                  'Gerencie os textos institucionais exibidos no rodapé do site.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.about', 'Sobre Nós')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent.about}
                  onChange={(e) => handleFooterChange('about', e.target.value)}
                  placeholder="Texto para a seção Sobre Nós"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.company', 'Nossa Empresa')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent.company}
                  onChange={(e) =>
                    handleFooterChange('company', e.target.value)
                  }
                  placeholder="Texto para a seção Nossa Empresa"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.mission', 'Nossa Missão')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent.mission}
                  onChange={(e) =>
                    handleFooterChange('mission', e.target.value)
                  }
                  placeholder="Texto para a seção Nossa Missão"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  {t('admin.settings.contact', 'Contato')}
                </label>
                <Textarea
                  rows={4}
                  value={footerContent.contact}
                  onChange={(e) =>
                    handleFooterChange('contact', e.target.value)
                  }
                  placeholder="Email, telefone, endereço..."
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
                {t('common.save_changes', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
