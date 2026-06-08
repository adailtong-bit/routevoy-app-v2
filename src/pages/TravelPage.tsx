import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { TravelDashboard } from '@/components/TravelDashboard'
import { TravelDetail } from '@/components/TravelDetail'
import { CreateTripWizard } from '@/components/CreateTripWizard'
import { useState } from 'react'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { useSearchParams } from 'react-router-dom'

export default function TravelPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  const isNew = location.pathname === '/travel/new'

  const searchCountry = searchParams.get('country') || ''
  const searchState = searchParams.get('state') || ''
  const searchCity = searchParams.get('city') || ''

  const handleLocationChange = (c: string, s: string, ci: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (c) newParams.set('country', c)
    else newParams.delete('country')
    if (s) newParams.set('state', s)
    else newParams.delete('state')
    if (ci) newParams.set('city', ci)
    else newParams.delete('city')
    setSearchParams(newParams)
  }

  if (id && id !== 'new') {
    return (
      <TravelDetail tripId={id} onBack={() => navigate('/travel?tab=trips')} />
    )
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {!id && (
        <div className="bg-white border-b border-slate-200 py-4 mb-2 shadow-sm relative z-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Geolocalização de Roteiros
              </h3>
            </div>
            <HierarchicalLocationSelector
              country={searchCountry}
              state={searchState}
              city={searchCity}
              onChange={handleLocationChange}
            />
          </div>
        </div>
      )}
      <TravelDashboard
        refreshTrigger={refreshKey}
        onSelectTrip={(tripId) => navigate(`/travel/${tripId}`)}
        onCreateNew={() => navigate('/travel/new')}
      />
      {isNew && (
        <CreateTripWizard
          isOpen={true}
          onClose={() => navigate('/travel?tab=trips')}
          onCreated={(trip) => {
            setRefreshKey((prev) => prev + 1)
            navigate('/travel?tab=trips')
          }}
        />
      )}
    </div>
  )
}
