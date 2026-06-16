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
  const [saving, setSaving] = useState(false)
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
          .in('key', ['footer_content', 'hero_content'])

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

  const handleSave = async (key: string, content: any) => {
    setSaving(true)
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
      setSaving(false)
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
          {t('admin.settings.title', 'Conteúdo do Site')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.settings.desc',
            'Gerencie o conteúdo institucional e estático do site.',
          )}
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="hero">
            {t('admin.settings.hero_tab', 'Página Inicial')}
          </TabsTrigger>
          <TabsTrigger value="footer">
            {t('admin.settings.footer_tab', 'Rodapé')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
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
                <label
                  htmlFor="hero-title"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.main_title', 'Título Principal')}
                </label>
                <Input
                  id="hero-title"
                  value={heroContent.title}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  placeholder="Ex: Descubra as Melhores Ofertas Locais"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hero-subtitle"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.subtitle', 'Subtítulo')}
                </label>
                <Textarea
                  id="hero-subtitle"
                  rows={3}
                  value={heroContent.subtitle}
                  onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                  placeholder="Texto descritivo abaixo do título"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hero-cta"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.cta', 'Texto de Chamada (Botão)')}
                </label>
                <Input
                  id="hero-cta"
                  value={heroContent.cta_text}
                  onChange={(e) => handleHeroChange('cta_text', e.target.value)}
                  placeholder="Ex: Entrar na Plataforma"
                />
              </div>

              <Button
                onClick={() => handleSave('hero_content', heroContent)}
                disabled={saving}
                className="w-full sm:w-auto mt-4"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t('common.save_changes', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
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
                <label
                  htmlFor="about"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.about', 'Sobre Nós')}
                </label>
                <Textarea
                  id="about"
                  rows={4}
                  value={footerContent.about}
                  onChange={(e) => handleFooterChange('about', e.target.value)}
                  placeholder="Texto para a seção Sobre Nós"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="company"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.company', 'Nossa Empresa')}
                </label>
                <Textarea
                  id="company"
                  rows={4}
                  value={footerContent.company}
                  onChange={(e) =>
                    handleFooterChange('company', e.target.value)
                  }
                  placeholder="Texto para a seção Nossa Empresa"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="mission"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.mission', 'Nossa Missão')}
                </label>
                <Textarea
                  id="mission"
                  rows={4}
                  value={footerContent.mission}
                  onChange={(e) =>
                    handleFooterChange('mission', e.target.value)
                  }
                  placeholder="Texto para a seção Nossa Missão"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact"
                  className="text-sm font-medium leading-none"
                >
                  {t('admin.settings.contact', 'Contato')}
                </label>
                <Textarea
                  id="contact"
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
                disabled={saving}
                className="w-full sm:w-auto mt-4"
              >
                {saving ? (
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
