import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from './ui/modern-card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Navigation,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { 
  getMyRideshares, 
  acceptRideshareRequest,
  declineRideshareRequest,
  cancelRideshare,
  type Rideshare,
  RideshareStatus,
  ShareType 
} from '../api/Rideshare'

export default function MyRideshares() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedRideshare, setSelectedRideshare] = useState<Rideshare | null>(null)
  const [responseNotes, setResponseNotes] = useState('')

  // Fetch user's rideshares
  const { data: rideshares = [], isLoading, error } = useQuery({
    queryKey: ['myRideshares', user?.userId],
    queryFn: getMyRideshares,
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Accept rideshare mutation
  const acceptMutation = useMutation({
    mutationFn: ({ rideshareId, notes }: { rideshareId: number; notes?: string }) =>
      acceptRideshareRequest(rideshareId, notes),
    onSuccess: () => {
      toast.success('Rideshare request accepted!')
      queryClient.invalidateQueries({ queryKey: ['myRideshares'] })
      setSelectedRideshare(null)
      setResponseNotes('')
    },
    onError: (error) => {
      console.error('Failed to accept rideshare:', error)
      toast.error('Failed to accept rideshare request')
    },
  })

  // Decline rideshare mutation
  const declineMutation = useMutation({
    mutationFn: ({ rideshareId, notes }: { rideshareId: number; notes?: string }) =>
      declineRideshareRequest(rideshareId, notes),
    onSuccess: () => {
      toast.success('Rideshare request declined')
      queryClient.invalidateQueries({ queryKey: ['myRideshares'] })
      setSelectedRideshare(null)
      setResponseNotes('')
    },
    onError: (error) => {
      console.error('Failed to decline rideshare:', error)
      toast.error('Failed to decline rideshare request')
    },
  })

  // Cancel rideshare mutation
  const cancelMutation = useMutation({
    mutationFn: cancelRideshare,
    onSuccess: () => {
      toast.success('Rideshare cancelled')
      queryClient.invalidateQueries({ queryKey: ['myRideshares'] })
    },
    onError: (error) => {
      console.error('Failed to cancel rideshare:', error)
      toast.error('Failed to cancel rideshare')
    },
  })

  const getStatusColor = (status: RideshareStatus) => {
    switch (status) {
      case RideshareStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case RideshareStatus.ACCEPTED:
        return 'bg-green-100 text-green-800'
      case RideshareStatus.DECLINED:
        return 'bg-red-100 text-red-800'
      case RideshareStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800'
      case RideshareStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getShareTypeLabel = (shareType: ShareType) => {
    switch (shareType) {
      case ShareType.PICKUP_SHARE:
        return 'Same Pickup Area'
      case ShareType.ROUTE_SHARE:
        return 'Similar Route'
      case ShareType.DESTINATION_SHARE:
        return 'Same Destination'
      default:
        return shareType
    }
  }

  // Separate rideshares by user role
  const asOwner = rideshares.filter(r => r.primaryBooking && user?.userId)
  const asSharer = rideshares.filter(r => r.sharerUser.userId === user?.userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading rideshares...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Failed to load rideshares</div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['myRideshares'] })}
          size="sm"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            My Rideshares
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">
                Requests to Join ({asSharer.length})
              </TabsTrigger>
              <TabsTrigger value="offers">
                My Rides ({asOwner.length})
              </TabsTrigger>
            </TabsList>

            {/* Requests to join other rides */}
            <TabsContent value="requests" className="space-y-4">
              {asSharer.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No rideshare requests yet</p>
                  <p className="text-sm text-gray-500">Find rides to join in the search tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {asSharer.map((rideshare) => (
                    <div
                      key={rideshare.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Request to join ride</p>
                            <p className="text-sm text-gray-600">
                              {new Date(rideshare.pickup_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(rideshare.status)}>
                          {rideshare.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="flex items-center text-green-600 mb-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="font-medium">Your Pickup</span>
                          </div>
                          <p className="text-gray-600">
                            {rideshare.sharer_pickup_latitude.toFixed(4)}, {rideshare.sharer_pickup_longitude.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center text-red-600 mb-1">
                            <Navigation className="h-4 w-4 mr-1" />
                            <span className="font-medium">Your Dropoff</span>
                          </div>
                          <p className="text-gray-600">
                            {rideshare.sharer_dropoff_latitude.toFixed(4)}, {rideshare.sharer_dropoff_longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                            <span>${rideshare.shared_fare}</span>
                          </div>
                          <Badge variant="outline">
                            {getShareTypeLabel(rideshare.shareType)}
                          </Badge>
                        </div>

                        {rideshare.status === RideshareStatus.PENDING && (
                          <Button
                            onClick={() => cancelMutation.mutate(rideshare.id)}
                            variant="outline"
                            size="sm"
                            disabled={cancelMutation.isPending}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>

                      {rideshare.sharer_notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium">Your message:</p>
                          <p className="text-gray-600">{rideshare.sharer_notes}</p>
                        </div>
                      )}

                      {rideshare.primary_user_notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <p className="font-medium">Response:</p>
                          <p className="text-gray-600">{rideshare.primary_user_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Requests to join user's rides */}
            <TabsContent value="offers" className="space-y-4">
              {asOwner.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No one has requested to join your rides yet</p>
                  <p className="text-sm text-gray-500">Create a booking to allow others to join</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {asOwner.map((rideshare) => (
                    <div
                      key={rideshare.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {rideshare.sharerUser.firstName} {rideshare.sharerUser.lastName}
                            </p>
                            <p className="text-sm text-gray-600">wants to join your ride</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(rideshare.status)}>
                          {rideshare.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="flex items-center text-green-600 mb-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="font-medium">Their Pickup</span>
                          </div>
                          <p className="text-gray-600">
                            {rideshare.sharer_pickup_latitude.toFixed(4)}, {rideshare.sharer_pickup_longitude.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center text-red-600 mb-1">
                            <Navigation className="h-4 w-4 mr-1" />
                            <span className="font-medium">Their Dropoff</span>
                          </div>
                          <p className="text-gray-600">
                            {rideshare.sharer_dropoff_latitude.toFixed(4)}, {rideshare.sharer_dropoff_longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {rideshare.sharer_notes && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium">Their message:</p>
                          <p className="text-gray-600">{rideshare.sharer_notes}</p>
                        </div>
                      )}

                      {rideshare.status === RideshareStatus.PENDING && (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setSelectedRideshare(rideshare)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => declineMutation.mutate({ rideshareId: rideshare.id })}
                            variant="outline"
                            size="sm"
                            disabled={declineMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm mt-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span>They'll pay: ${rideshare.shared_fare}</span>
                        </div>
                        <Badge variant="outline">
                          {getShareTypeLabel(rideshare.shareType)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ModernCardContent>
      </ModernCard>

      {/* Response Modal */}
      {selectedRideshare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Accept Rideshare Request</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Accepting request from:</p>
                <p className="font-medium">
                  {selectedRideshare.sharerUser.firstName} {selectedRideshare.sharerUser.lastName}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  You'll receive: ${selectedRideshare.shared_fare}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Response Message (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Looking forward to sharing the ride!"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => acceptMutation.mutate({ 
                    rideshareId: selectedRideshare.id, 
                    notes: responseNotes 
                  })}
                  disabled={acceptMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {acceptMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Request
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedRideshare(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}