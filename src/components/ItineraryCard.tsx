import { Itinerary } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ItineraryCardProps {
  itinerary: Itinerary
  className?: string
}

export function ItineraryCard({ itinerary, className }: ItineraryCardProps) {
  return (
    <Link
      to={`/travel/${itinerary.id}`}
      className={cn('block group h-full', className)}
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={itinerary.image}
            alt={itinerary.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70" />
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {itinerary.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-normal bg-black/40 text-white border-0 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="absolute bottom-2 left-2 right-2 text-white">
            <div className="flex items-center gap-1 text-xs font-bold text-green-400 mb-1">
              <TrendingUp className="h-3 w-3" /> {itinerary.matchScore}% Match
            </div>
            <h3 className="font-bold leading-tight">{itinerary.title}</h3>
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {itinerary.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {itinerary.duration}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {itinerary.stops.length} Paradas
            </div>
            <div className="flex items-center gap-1 font-bold text-green-600">
              R$ {itinerary.totalSavings} off
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
