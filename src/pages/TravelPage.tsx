import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { TravelDashboard } from '@/components/TravelDashboard'
import { TravelDetail } from '@/components/TravelDetail'
import { CreateTripWizard } from '@/components/CreateTripWizard'
import { useState } from 'react'

export default function TravelPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [refreshKey, setRefreshKey] = useState(0)

  const isNew = location.pathname === '/travel/new'

  if (id && id !== 'new') {
    return (
      <TravelDetail tripId={id} onBack={() => navigate('/travel?tab=trips')} />
    )
  }

  return (
    <>
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
    </>
  )
}
