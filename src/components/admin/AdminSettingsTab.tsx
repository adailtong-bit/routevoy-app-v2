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
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, X, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMergedLocationData } from '@/lib/locationData'
import { supabase } from '@/lib/supabase/client'

function EditableListItem({
  name,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: {
  name: string
  isSelected: boolean
  onClick: () => void
  onEdit: (newName: string) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md mb-1 border border-slate-200 shadow-sm">
        <Input
          autoFocus
          size={1}
          className="h-7 text-sm px-2 flex-1 min-w-0 bg-white"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEdit(editValue)
              setIsEditing(false)
            } else if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(name)
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 hover:bg-green-100"
          onClick={() => {
            onEdit(editValue)
            setIsEditing(false)
          }}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 hover:bg-red-100"
          onClick={() => {
            setIsEditing(false)
            setEditValue(name)
          }}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`group flex items-center justify-between px-3 py-2 mb-1 rounded-md text-sm transition-colors ${isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-slate-100'}`}
    >
      <button className="flex-1 text-left truncate" onClick={onClick}>
        {name}
      </button>
      <div className="hidden group-hover:flex gap-1 shrink-0">
        <button
          className={`p-1 rounded ${isSelected ? 'hover:bg-white/20' : 'hover:bg-slate-200'}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
            setEditValue(name)
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          className={`p-1 rounded ${isSelected ? 'hover:bg-red-500/50' : 'hover:bg-red-100 text-red-600'}`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function AdminSettingsTab() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings')
    const parsed = saved ? JSON.parse(saved) : {}
    return {
      geoRadius: 50,
      maxPushPerDay: 3,
      sessionTimeout: 30,
      maintenanceMode: false,
      defaultRegion: 'Global',
      adRefreshInterval: 300,
      adminCommissionRate: 10,
      baseBoostPrice: 25.0,
      ...parsed,
      fullLocationData: parsed.fullLocationData || getMergedLocationData(),
    }
  })

  const [geoTree, setGeoTree] = useState<Record<string, any>>(
    settings.fullLocationData,
  )

  useEffect(() => {
    setSettings((prev: any) => ({ ...prev, fullLocationData: geoTree }))
  }, [geoTree])

  const handleSave = async () => {
    localStorage.setItem('system_settings', JSON.stringify(settings))

    const updates = [
      {
        key: 'ad_refresh_interval',
        value: { value: settings.adRefreshInterval },
      },
      {
        key: 'admin_commission_rate',
        value: { value: settings.adminCommissionRate },
      },
      { key: 'base_boost_price', value: { value: settings.baseBoostPrice } },
    ]

    for (const update of updates) {
      await supabase.from('site_settings').upsert(update, { onConflict: 'key' })
    }

    toast.success(
      t(
        'admin.settings_tab.save_success',
        'System parameters updated successfully.',
      ),
    )
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .in('key', [
        'ad_refresh_interval',
        'admin_commission_rate',
        'base_boost_price',
      ])
      .then(({ data }) => {
        if (data) {
          setSettings((prev) => {
            const newSettings = { ...prev }
            data.forEach((item) => {
              if (item.key === 'ad_refresh_interval')
                newSettings.adRefreshInterval = Number(item.value?.value || 300)
              if (item.key === 'admin_commission_rate')
                newSettings.adminCommissionRate = Number(
                  item.value?.value || 10,
                )
              if (item.key === 'base_boost_price')
                newSettings.baseBoostPrice = Number(item.value?.value || 25.0)
            })
            return newSettings
          })
        }
      })
  }, [])

  const ALL_REGIONS = Array.from(
    new Set([
      'Global',
      ...Object.keys(geoTree).sort(),
      'Europe',
      'North America',
      'South America',
    ]),
  ).sort()

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [newCountryName, setNewCountryName] = useState('')
  const [newStateName, setNewStateName] = useState('')
  const [newCityName, setNewCityName] = useState('')

  const handleAddCountry = () => {
    if (!newCountryName.trim()) return
    const name = newCountryName.trim()
    if (!geoTree[name]) {
      setGeoTree({ ...geoTree, [name]: { states: {} } })
    }
    setNewCountryName('')
    setSelectedCountry(name)
    setSelectedState(null)
  }

  const handleEditCountry = (oldName: string, newName: string) => {
    const name = newName.trim()
    if (!name || oldName === name) return
    const newTree = { ...geoTree }
    newTree[name] = newTree[oldName]
    delete newTree[oldName]
    setGeoTree(newTree)
    if (selectedCountry === oldName) setSelectedCountry(name)
  }

  const handleDeleteCountry = (name: string) => {
    if (
      !confirm(
        t(
          'admin.geo.confirm_delete',
          `Are you sure you want to delete ${name}?`,
        ).replace('{name}', name),
      )
    )
      return
    const newTree = { ...geoTree }
    delete newTree[name]
    setGeoTree(newTree)
    if (selectedCountry === name) {
      setSelectedCountry(null)
      setSelectedState(null)
    }
  }

  const handleAddState = () => {
    if (!selectedCountry || !newStateName.trim()) return
    const name = newStateName.trim()
    const newTree = { ...geoTree }
    if (!newTree[selectedCountry].states[name]) {
      newTree[selectedCountry].states[name] = []
      setGeoTree(newTree)
    }
    setNewStateName('')
    setSelectedState(name)
  }

  const handleEditState = (oldName: string, newName: string) => {
    if (!selectedCountry) return
    const name = newName.trim()
    if (!name || oldName === name) return
    const newTree = { ...geoTree }
    newTree[selectedCountry].states[name] =
      newTree[selectedCountry].states[oldName]
    delete newTree[selectedCountry].states[oldName]
    setGeoTree(newTree)
    if (selectedState === oldName) setSelectedState(name)
  }

  const handleDeleteState = (name: string) => {
    if (!selectedCountry) return
    if (
      !confirm(
        t(
          'admin.geo.confirm_delete',
          `Are you sure you want to delete ${name}?`,
        ).replace('{name}', name),
      )
    )
      return
    const newTree = { ...geoTree }
    delete newTree[selectedCountry].states[name]
    setGeoTree(newTree)
    if (selectedState === name) setSelectedState(null)
  }

  const handleAddCity = () => {
    if (!selectedCountry || !selectedState || !newCityName.trim()) return
    const name = newCityName.trim()
    const newTree = { ...geoTree }
    if (!newTree[selectedCountry].states[selectedState].includes(name)) {
      newTree[selectedCountry].states[selectedState] = [
        ...newTree[selectedCountry].states[selectedState],
        name,
      ].sort()
      setGeoTree(newTree)
    }
    setNewCityName('')
  }

  const handleEditCity = (oldName: string, newName: string) => {
    if (!selectedCountry || !selectedState) return
    const name = newName.trim()
    if (!name || oldName === name) return
    const newTree = { ...geoTree }
    let cities = newTree[selectedCountry].states[selectedState]
    cities = cities.filter((c: string) => c !== oldName)
    if (!cities.includes(name)) cities.push(name)
    cities.sort()
    newTree[selectedCountry].states[selectedState] = cities
    setGeoTree(newTree)
  }

  const handleDeleteCity = (name: string) => {
    if (!selectedCountry || !selectedState) return
    if (
      !confirm(
        t(
          'admin.geo.confirm_delete',
          `Are you sure you want to delete ${name}?`,
        ).replace('{name}', name),
      )
    )
      return
    const newTree = { ...geoTree }
    newTree[selectedCountry].states[selectedState] = newTree[
      selectedCountry
    ].states[selectedState].filter((c: string) => c !== name)
    setGeoTree(newTree)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('admin.settings_tab.title', 'System Settings')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.settings_tab.desc',
            'Configure dynamic parameters and system thresholds globally.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {t(
                'admin.settings_tab.global_region_title',
                'Global Region & Standards',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.global_region_desc',
                'Define the master default region for the entire platform. This applies standard formats (currency, phone, dates) globally.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 md:w-1/2">
              <Label>
                {t(
                  'admin.settings_tab.default_region',
                  'Master Default Region',
                )}
              </Label>
              <Select
                value={settings.defaultRegion || 'Global'}
                onValueChange={(v) =>
                  setSettings({ ...settings, defaultRegion: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select master region" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  'admin.settings_tab.default_region_help',
                  'All new franchises and merchants will inherit this region format unless overridden individually in their specific settings.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {t('admin.geo.manager_title', 'Geographic Hierarchy Manager')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.geo.manager_desc',
                'Manage Countries, States, and Cities. You can add, edit, or remove locations.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
              {/* Countries */}
              <div className="border rounded-md flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b bg-slate-50 font-medium shrink-0">
                  {t('admin.geo.countries', 'Countries')}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {Object.keys(geoTree)
                    .sort()
                    .map((c) => (
                      <EditableListItem
                        key={c}
                        name={c}
                        isSelected={selectedCountry === c}
                        onClick={() => {
                          setSelectedCountry(c)
                          setSelectedState(null)
                        }}
                        onEdit={(newName) => handleEditCountry(c, newName)}
                        onDelete={() => handleDeleteCountry(c)}
                      />
                    ))}
                </div>
                <div className="p-2 border-t mt-auto bg-slate-50 shrink-0">
                  <div className="flex gap-2">
                    <Input
                      size={1}
                      className="h-8 text-sm"
                      placeholder={t('admin.geo.new_country', 'New Country')}
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCountry()}
                    />
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleAddCountry}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* States */}
              <div className="border rounded-md flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b bg-slate-50 font-medium shrink-0">
                  {selectedCountry
                    ? t(
                        'admin.geo.states_in',
                        `States in ${selectedCountry}`,
                      ).replace('{country}', selectedCountry)
                    : t('admin.geo.select_country', 'Select a Country')}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {selectedCountry &&
                    Object.keys(geoTree[selectedCountry]?.states || {})
                      .sort()
                      .map((s) => (
                        <EditableListItem
                          key={s}
                          name={s}
                          isSelected={selectedState === s}
                          onClick={() => setSelectedState(s)}
                          onEdit={(newName) => handleEditState(s, newName)}
                          onDelete={() => handleDeleteState(s)}
                        />
                      ))}
                  {selectedCountry &&
                    Object.keys(geoTree[selectedCountry]?.states || {})
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">
                        {t('admin.geo.no_states', 'No states found.')}
                      </p>
                    )}
                </div>
                {selectedCountry && (
                  <div className="p-2 border-t mt-auto bg-slate-50 shrink-0">
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder={t('admin.geo.new_state', 'New State')}
                        value={newStateName}
                        onChange={(e) => setNewStateName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleAddState}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cities */}
              <div className="border rounded-md flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b bg-slate-50 font-medium shrink-0">
                  {selectedState
                    ? t(
                        'admin.geo.cities_in',
                        `Cities in ${selectedState}`,
                      ).replace('{state}', selectedState)
                    : t('admin.geo.select_state', 'Select a State')}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {selectedCountry &&
                    selectedState &&
                    (geoTree[selectedCountry]?.states[selectedState] || []).map(
                      (city: string) => (
                        <EditableListItem
                          key={city}
                          name={city}
                          isSelected={false}
                          onClick={() => {}}
                          onEdit={(newName) => handleEditCity(city, newName)}
                          onDelete={() => handleDeleteCity(city)}
                        />
                      ),
                    )}
                  {selectedCountry &&
                    selectedState &&
                    (geoTree[selectedCountry]?.states[selectedState] || [])
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">
                        {t('admin.geo.no_cities', 'No cities found.')}
                      </p>
                    )}
                </div>
                {selectedCountry && selectedState && (
                  <div className="p-2 border-t mt-auto bg-slate-50 shrink-0">
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder={t('admin.geo.new_city', 'New City')}
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleAddCity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {t(
                'admin.geo.remember_save',
                '* Remember to click Save Changes at the bottom of the page to persist these locations globally.',
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.geo_title', 'Geolocation Parameters')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.geo_desc',
                'Configure how proximity and distances are handled.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'admin.settings_tab.geo_radius',
                  'Default Search Radius (km)',
                )}
              </Label>
              <Input
                type="number"
                value={settings.geoRadius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    geoRadius: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t(
                  'admin.settings_tab.geo_radius_desc',
                  'Used as the default limit when exploring offers.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.notif_title', 'Notification Thresholds')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.notif_desc',
                'Limits and triggers for push notifications.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'admin.settings_tab.max_push',
                  'Max Push Notifications per User/Day',
                )}
              </Label>
              <Input
                type="number"
                value={settings.maxPushPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxPushPerDay: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.sec_title', 'Security & Sessions')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.sec_desc',
                'Configure user session parameters.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('admin.settings_tab.timeout', 'Session Timeout (minutes)')}
              </Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionTimeout: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monetização & Ads Engine</CardTitle>
            <CardDescription>
              Configurações do sistema de impulsionamento e priorização.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Refresh Interval (segundos)</Label>
              <Input
                type="number"
                value={settings.adRefreshInterval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    adRefreshInterval: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Commission Rate (%)</Label>
              <Input
                type="number"
                value={settings.adminCommissionRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    adminCommissionRate: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Base Boost Price ($)</Label>
              <Input
                type="number"
                value={settings.baseBoostPrice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    baseBoostPrice: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />{' '}
          {t('admin.settings_tab.save_changes', 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}
