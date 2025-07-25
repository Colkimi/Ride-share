import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from './ui/modern-card'
import { Button } from './ui/button'
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock,
  Star,
  Navigation,
  Eye,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { LocationSearch } from './LocationSearch'
import Map from './Map'
import DemoTrackingPage from './Demo'
import { 
  getUserLocations, 
  getLocationsByUserId,
  createUserLocation, 
  updateUserLocation, 
  deleteUserLocation,
  type Location, 
  Label
} from '../api/Location'
import { useAuth } from '../hooks/useAuth'

interface CustomerLocation extends Location {
  location_id: number;
}

type TabType = 'locations' | 'demo'

interface LocationFormData {
  label: Label;
  address: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export default function CustomerLocations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('locations');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CustomerLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    label: Label.CUSTOM,
    address: '',
    latitude: undefined,
    longitude: undefined,
    is_default: false
  });

  // Fetch user's saved locations using the new endpoint
  const { data: savedLocations = [], isLoading, error } = useQuery({
    queryKey: ['userLocations', user?.userId],
    queryFn: getUserLocations,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: createUserLocation,
    onSuccess: (data) => {
      console.log('Location created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
      setShowLocationForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create location:', error);
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: updateUserLocation,
    onSuccess: (data) => {
      console.log('Location updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
      setEditingLocation(null);
      setShowLocationForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to update location:', error);
    },
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: deleteUserLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
    },
    onError: (error) => {
      console.error('Failed to delete location:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      label: Label.CUSTOM,
      address: '',
      latitude: undefined,
      longitude: undefined,
      is_default: false
    });
    setSelectedLocation(null);
    setEditingLocation(null);
  };

  const handleLocationSelect = (loc: { label: string; coordinates: { latitude: number; longitude: number } }) => {
    const locationData = {
      ...formData,
      address: loc.label,
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude
    };
    
    setFormData(locationData);
    setSelectedLocation({
      label: String(formData.label), // Convert to string
      address: loc.label,
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude
    });
  };

  const handleEditLocation = (location: CustomerLocation) => {
    setEditingLocation(location);
    setFormData({
      label: location.label as Label || Label.CUSTOM,
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      is_default: location.is_default || false
    });
    setSelectedLocation(location);
    setShowLocationForm(true);
  };

  // Enhanced validation and save function
  const handleSaveLocation = () => {
    // More specific validation
    if (!formData.label || !formData.address) {
      alert('Please fill in the label and address fields');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map or search for an address');
      return;
    }

    const locationData = {
      label: formData.label,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      is_default: formData.is_default // This should now be properly included
    };

    console.log('Saving location with data:', locationData); // Debug log

    if (editingLocation) {
      updateLocationMutation.mutate({
        location_id: editingLocation.location_id!,
        ...locationData
      });
    } else {
      createLocationMutation.mutate(locationData);
    }
  };

  const handleDeleteLocation = (locationId: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteLocationMutation.mutate(locationId);
    }
  };

  if (activeTab === 'demo') {
    return <DemoTrackingPage />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p>You need to be logged in to manage locations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Locations</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your saved addresses and explore tracking</p>
          </div>
          
          <div className="flex space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
            <Button
              onClick={() => setActiveTab('locations')}
              variant={activeTab === 'locations' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              My Locations
            </Button>
            <Button
              onClick={() => setActiveTab('demo')}
              variant={activeTab === 'demo' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Live Demo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Locations */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle className="flex items-center justify-between">
                <span>Saved Locations</span>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowLocationForm(!showLocationForm);
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading locations...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-2">Failed to load locations</div>
                  <Button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['userLocations'] })}
                    size="sm"
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedLocations.map((location) => (
                    <div
                      key={location.location_id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-full">
                          {location.type === 'home' ? (
                            <Home className="h-5 w-5 text-green-600" />
                          ) : location.type === 'work' ? (
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          ) : (
                            <MapPin className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {location.name || location.label}
                            </p>
                            {location.is_default && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {location.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLocation(location as CustomerLocation);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLocation(location.location_id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {savedLocations.length === 0 && (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No saved locations yet</p>
                      <p className="text-sm text-gray-500">Add your first location to get started</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Form */}
              {showLocationForm && (
                <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      {editingLocation ? 'Edit Location' : 'Add New Location'}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowLocationForm(false);
                        setEditingLocation(null);
                        resetForm();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <select
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value as Label })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={Label.HOME}>Home</option>
                        <option value={Label.WORK}>Work</option>
                        <option value={Label.CUSTOM}>Other</option>
                      </select>
                    </div>     
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <LocationSearch
                        label=""
                        placeholder="Search for a location..."
                        onSelect={handleLocationSelect}
                        currentLocation={selectedLocation ? {
                          label: selectedLocation.address || selectedLocation.label || '',
                          coordinates: {
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude
                          }
                        } : null}
                      />
                    </div>

                    {/* Display current coordinates for debugging */}
                    {formData.latitude && formData.longitude && (
                      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        Coordinates: {formData.latitude}, {formData.longitude}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={(e) => {
                          console.log('Setting is_default to:', e.target.checked); // Debug log
                          setFormData({ ...formData, is_default: e.target.checked });
                        }}
                        className="rounded"
                      />
                      <label htmlFor="is_default" className="text-sm">Set as default location</label>
                    </div>



                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleSaveLocation}
                        disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {(createLocationMutation.isPending || updateLocationMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        {editingLocation ? 'Update' : 'Save'} Location
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowLocationForm(false);
                          setEditingLocation(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>

          {/* Map */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Your Locations Map</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="h-96">
                <Map 
                  selectedLocation={selectedLocation} 
                  showUserLocations={true}
                  onLocationSelect={(location) => {
                    const newLocation = {
                      latitude: location[0],
                      longitude: location[1],
                      label: formData.label || Label.CUSTOM,
                      address: `${location[0].toFixed(4)}, ${location[1].toFixed(4)}`
                    };
                    
                    setSelectedLocation(newLocation);
                    setFormData({
                      ...formData,
                      latitude: location[0],
                      longitude: location[1],
                      address: newLocation.address
                    });
                  }}
                />
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Demo Card */}
        <ModernCard>
          <ModernCardContent>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Experience Real-Time Tracking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    See how we track your driver's location in real-time during your ride
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('demo')}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}