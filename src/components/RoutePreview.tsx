import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Route } from 'lucide-react'

interface RoutePreviewProps {
  pickupLocation: { latitude: number; longitude: number } | null
  dropoffLocation: { latitude: number; longitude: number } | null
  onRouteCalculated?: (routeData: any) => void
}

export function RoutePreview({ pickupLocation, dropoffLocation, onRouteCalculated }: RoutePreviewProps) {
  const [routeData, setRouteData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateRoute()
    }
  }, [pickupLocation, dropoffLocation])

  const calculateRoute = async () => {
    if (!pickupLocation || !dropoffLocation) return

    setLoading(true)
    try {
      // Simulate route calculation
      const mockRouteData = {
        distance: 12.5,
        duration: 25,
        fare: 450,
        traffic: 'moderate',
        alternatives: [
          { distance: 12.5, duration: 25, traffic: 'moderate' },
          { distance: 15.2, duration: 22, traffic: 'light' },
          { distance: 11.8, duration: 30, traffic: 'heavy' }
        ]
      }
      
      setRouteData(mockRouteData)
      onRouteCalculated?.(mockRouteData)
    } catch (error) {
      console.error('Error calculating route:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!pickupLocation || !dropoffLocation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Select pickup and dropoff locations to see route preview</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Route className="w-5 h-5 mr-2" />
          Route Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm">Distance</span>
            </div>
            <span className="font-semibold">{routeData?.distance} km</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm">Estimated Time</span>
            </div>
            <span className="font-semibold">{routeData?.duration} min</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm">Estimated Fare</span>
            </div>
            <span className="font-semibold">${routeData?.fare}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Traffic</span>
            <Badge 
              variant={routeData?.traffic === 'light' ? 'default' : 
                       routeData?.traffic === 'moderate' ? 'secondary' : 'destructive'}
            >
              {routeData?.traffic}
            </Badge>
          </div>

          {routeData?.alternatives && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Route Alternatives</h4>
              <div className="space-y-2">
                {routeData.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Route {index + 1}</span>
                    <span>{alt.distance} km • {alt.duration} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
