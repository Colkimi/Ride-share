import { useForm, Field } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { createDriver, Status } from '@/api/Driver';
import { createVehicle } from '@/api/Vehicle';
import { API_BASE_URL } from '@/api/apiUtils';
import { getCurrentUser } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Car, 
  FileText, 
  Camera, 
  CheckCircle, 
  Upload,
  User,
  Shield,
  Clock,
  DollarSign,
  Star,
  Truck
} from 'lucide-react';

const driverRegistrationSchema = z.object({
  // Driver information
  license_number: z.number().min(5, 'License number must be at least 5 characters'),
  rating: z.number().min(0).max(5).default(0),
  verification_status: z.enum([Status.Verified, Status.Unverified, Status.REJECTED]).default(Status.Unverified),
  total_trips: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  
  // Vehicle information
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(2, 'License plate is required'),
  vehicleColor: z.string().min(1, 'Vehicle color is required'),
  vehicleCapacity: z.number().min(1).max(20),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  
  // Terms agreement
  termsAccepted: z.boolean().refine(val => val, {
    message: 'You must accept the terms and conditions',
  }),
});

type DriverRegistrationData = z.infer<typeof driverRegistrationSchema>;

const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Validation error';
  }
  return undefined;
};

export function DriverRegistrationForm() {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<{
    licenseDocument?: File;
    insuranceDocument?: File;
    vehiclePhotos: File[];
  }>({ vehiclePhotos: [] });
  
  // State to track location fetching
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Create driver mutation
  const createDriverMutation = useMutation({
    mutationFn: async (data: DriverRegistrationData) => {
      const accessToken = localStorage.getItem('accessToken');

      
      // Step 1: Create driver with proper DTO format including userId
      const driverResponse = await fetch(`${API_BASE_URL}/driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          license_number: data.license_number,
          rating: data.rating,
          verification_status: data.verification_status,
          total_trips: data.total_trips,
          isAvailable: data.isAvailable,
          latitude: data.latitude,
          longitude: data.longitude
        }),
      });

      if (!driverResponse.ok) {
        throw new Error('Failed to create driver');
      }

      const driverData = await driverResponse.json();
      
      // Step 2: Create vehicle
      const vehicleResponse = await fetch(`${API_BASE_URL}/vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
          license_plate: data.licensePlate,
          color: data.vehicleColor,
          capacity: data.vehicleCapacity,
          type: data.vehicleType,
          approved: false,
        }),
      });

      if (!vehicleResponse.ok) {
        throw new Error('Failed to create vehicle');
      }

      return { driver: driverData };
    },
    onSuccess: () => {
      toast.success('Driver application submitted successfully!', {
        description: 'Your application will be reviewed within 24-48 hours.',
      });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => {
      toast.error('Failed to submit application', {
        description: error.message,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      license_number: 0,
      rating: 0,
      verification_status: Status.Unverified,
      total_trips: 0,
      isAvailable: true,
      latitude: 0,
      longitude: 0,
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      licensePlate: '',
      vehicleColor: '',
      vehicleCapacity: 4,
      vehicleType: '',
      termsAccepted: false,
    } as DriverRegistrationData,
    onSubmit: async ({ value }) => {
      createDriverMutation.mutate(value);
    },
  });
  
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldValue('latitude', position.coords.latitude);
        form.setFieldValue('longitude', position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg">
                <Truck className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Join Our Driver Network
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Complete your driver registration and start earning money with flexible hours and competitive rates.
            </p>
          </div>

          {/* Benefits Section */}
          <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl">Why Drive With Us?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Flexible Schedule</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Drive when you want</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div className="p-3 bg-green-500 rounded-full">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Great Earnings</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">Competitive rates & tips</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Safety First</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">24/7 support & insurance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }} className="space-y-8">
            
            {/* Driver Information Section */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl">Driver Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Field
                  form={form}
                  name="license_number"
                  validators={{
                    onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.license_number),
                  }}
                  children={(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Driver's License Number *
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(parseInt(e.target.value))}
                        placeholder="Enter your license number (e.g., 12345678)"
                      />
                      {field.state.meta.errors?.[0] && (
                        <div className="text-red-500 text-sm flex items-center mt-2">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {field.state.meta.errors[0]}
                        </div>
                      )}
                    </div>
                  )}
                />
                
                {/* Location Fields */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    Current Location *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      form={form}
                      name="latitude"
                      validators={{
                        onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.latitude),
                      }}
                      children={(field) => (
                        <div className="space-y-2">
                          <input
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            type="number"
                            step="0.000001"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                            placeholder="Latitude"
                          />
                        </div>
                      )}
                    />
                    <Field
                      form={form}
                      name="longitude"
                      validators={{
                        onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.longitude),
                      }}
                      children={(field) => (
                        <div className="space-y-2">
                          <input
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            type="number"
                            step="0.000001"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                            placeholder="Longitude"
                          />
                        </div>
                      )}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 border-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>{isGettingLocation ? 'Getting location...' : 'Get Current Location'}</span>
                  </Button>
                  {locationError && (
                    <div className="text-red-500 text-sm flex items-center mt-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {locationError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information Section */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl">Vehicle Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field
                    form={form}
                    name="vehicleMake"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleMake),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle Make *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Toyota"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  
                  <Field
                    form={form}
                    name="vehicleModel"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleModel),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle Model *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Camry"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <Field
                    form={form}
                    name="vehicleYear"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleYear),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(parseInt(e.target.value))}
                          placeholder="2020"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <Field
                    form={form}
                    name="licensePlate"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.licensePlate),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">License Plate *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="ABC-123"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <Field
                    form={form}
                    name="vehicleColor"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleColor),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Color *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Black"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <Field
                    form={form}
                    name="vehicleCapacity"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleCapacity),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Passenger Capacity *</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          type="number"
                          min="1"
                          max="20"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(parseInt(e.target.value))}
                          placeholder="4"
                        />
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />

                  <Field
                    form={form}
                    name="vehicleType"
                    validators={{
                      onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleType),
                    }}
                    children={(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle Type *</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        >
                          <option value="">Select vehicle type</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="hatchback">Hatchback</option>
                          <option value="truck">Truck</option>
                          <option value="van">Van</option>
                        </select>
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6">
                <Field
                  form={form}
                  name="termsAccepted"
                  validators={{
                    onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.termsAccepted),
                  }}
                  children={(field) => (
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          I agree to the{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                            Terms and Conditions
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                            Privacy Policy
                          </a>
                          . I understand that my application will be reviewed and I may be contacted for additional verification.
                        </label>
                        {field.state.meta.errors?.[0] && (
                          <div className="text-red-500 text-sm flex items-center mt-2">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {field.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className="flex justify-center">
                  <Button 
                    type="submit"
                    disabled={!canSubmit || isSubmitting || createDriverMutation.isPending}
                    className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting || createDriverMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Application...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Submit Driver Application</span>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            />
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Application review typically takes 24-48 hours
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
