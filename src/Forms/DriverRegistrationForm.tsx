import { useForm, Field } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { createDriver, Status } from '@/api/Driver';
import { createVehicle } from '@/api/Vehicle';
import { API_BASE_URL } from '@/api/apiUtils';
import { getCurrentUser } from '@/hooks/useAuth';
import styles from '../FormStyles.module.css';
import { MapPin } from 'lucide-react';

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

      // Step 3: Upload documents if provided
      if (uploadedFiles.licenseDocument || uploadedFiles.insuranceDocument || uploadedFiles.vehiclePhotos.length > 0) {
        const formData = new FormData();
        
        if (uploadedFiles.licenseDocument) {
          formData.append('licenseDocument', uploadedFiles.licenseDocument);
        }
        if (uploadedFiles.insuranceDocument) {
          formData.append('insuranceDocument', uploadedFiles.insuranceDocument);
        }
        uploadedFiles.vehiclePhotos.forEach((photo, index) => {
          formData.append(`vehiclePhoto${index}`, photo);
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/driver/${driverData.driver_id}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.warn('Failed to upload some documents');
        }
      }

      return { driver: driverData };
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
      vehicleType: 'sedan',
      termsAccepted: false,
    } as unknown as DriverRegistrationData,
    onSubmit: async ({ value }) => {
      const validation = driverRegistrationSchema.safeParse(value);
      if (!validation.success) {
        toast.error('Please correct the validation errors');
        return;
      }

      try {
        await createDriverMutation.mutateAsync(validation.data);
        toast.success('Driver registration submitted successfully! You will be notified once approved.');
        form.reset();
        setUploadedFiles({ vehiclePhotos: [] });
      } catch (error) {
        console.error('Driver registration error:', error);
        toast.error('Failed to register driver. Please try again.');
      }
    },
  });

  const handleFileUpload = (field: 'licenseDocument' | 'insuranceDocument' | 'vehiclePhotos', files: FileList | null) => {
    if (!files) return;

    if (field === 'vehiclePhotos') {
      const newPhotos = Array.from(files);
      setUploadedFiles(prev => ({
        ...prev,
        vehiclePhotos: [...prev.vehiclePhotos, ...newPhotos]
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [field]: files[0]
      }));
    }
  };
  
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
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Complete Driver Registration</h2>
        <p className={styles.formDescription}>
          Fill out all required information to register as a driver. Your application will be reviewed within 24-48 hours.
        </p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }} className={styles.form}>
          
          {/* Driver Information Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Driver Information</h3>
            
            <Field
              form={form}
              name="license_number"
              validators={{
                onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.license_number),
              }}
              children={(field) => (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Driver's License Number *</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(parseInt(e.target.value))}
                    placeholder="e.g., 12345678"
                  />
                  {field.state.meta.errors?.[0] && (
                    <div className={styles.error}>{field.state.meta.errors[0]}</div>
                  )}
                </div>
              )}
            />
            
            {/* Location Fields */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Current Location *</label>
              <div className={styles.locationGroup}>
                <Field
                  form={form}
                  name="latitude"
                  validators={{
                    onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.latitude),
                  }}
                  children={(field) => (
                    <input
                      className={styles.input}
                      type="number"
                      step="0.000001"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                      placeholder="Latitude"
                    />
                  )}
                />
                <Field
                  form={form}
                  name="longitude"
                  validators={{
                    onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.longitude),
                  }}
                  children={(field) => (
                    <input
                      className={styles.input}
                      type="number"
                      step="0.000001"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                      placeholder="Longitude"
                    />
                  )}
                />
                <button 
                  type="button" 
                  className={styles.locationButton}
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isGettingLocation ? 'Getting location...' : 'Get Current Location'}
                </button>
              </div>
              {locationError && <div className={styles.error}>{locationError}</div>}
            </div>
            
            {/* Vehicle Information Section */}
            <h3 className={styles.sectionTitle}>Vehicle Information</h3>
            
            <div className={styles.formRow}>
              <Field
                form={form}
                name="vehicleMake"
                validators={{
                  onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleMake),
                }}
                children={(field) => (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Make *</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Toyota"
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
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
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Model *</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Camry"
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className={styles.formRow}>
              <Field
                form={form}
                name="vehicleYear"
                validators={{
                  onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleYear),
                }}
                children={(field) => (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Year *</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseInt(e.target.value))}
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
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
                  <div className={styles.formGroup}>
                    <label className={styles.label}>License Plate *</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., ABC123"
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className={styles.formRow}>
              <Field
                form={form}
                name="vehicleColor"
                validators={{
                  onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleColor),
                }}
                children={(field) => (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Color *</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Black"
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
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
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Capacity *</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      max="20"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseInt(e.target.value))}
                    />
                    {field.state.meta.errors?.[0] && (
                      <div className={styles.error}>{field.state.meta.errors[0]}</div>
                    )}
                  </div>
                )}
              />
            </div>
            
            <Field
              form={form}
              name="vehicleType"
              validators={{
                onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.vehicleType),
              }}
              children={(field) => (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Vehicle Type *</label>
                  <select
                    className={styles.input}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                  </select>
                  {field.state.meta.errors?.[0] && (
                    <div className={styles.error}>{field.state.meta.errors[0]}</div>
                  )}
                </div>
              )}
            />
            
            {/* Document Upload Section */}
            <h3 className={styles.sectionTitle}>Document Upload</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Driver's License Document</label>
              <input
                className={styles.fileInput}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('licenseDocument', e.target.files)}
              />
              {uploadedFiles.licenseDocument && (
                <p className={styles.uploadedFile}>{uploadedFiles.licenseDocument.name}</p>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Vehicle Insurance Document</label>
              <input
                className={styles.fileInput}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('insuranceDocument', e.target.files)}
              />
              {uploadedFiles.insuranceDocument && (
                <p className={styles.uploadedFile}>{uploadedFiles.insuranceDocument.name}</p>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Vehicle Photos</label>
              <input
                className={styles.fileInput}
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileUpload('vehiclePhotos', e.target.files)}
              />
              {uploadedFiles.vehiclePhotos.length > 0 && (
                <div className={styles.uploadedFiles}>
                  <p>Uploaded {uploadedFiles.vehiclePhotos.length} photos</p>
                  <ul>
                    {uploadedFiles.vehiclePhotos.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Field
              form={form}
              name="termsAccepted"
              validators={{
                onChange: ({ value }) => validateField(value, driverRegistrationSchema.shape.termsAccepted),
              }}
              children={(field) => (
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms and Conditions</a>
                  </label>
                  {field.state.meta.errors?.[0] && (
                    <div className={styles.error}>{field.state.meta.errors[0]}</div>
                  )}
                </div>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button 
                className={styles.button} 
                type="submit"
                disabled={!canSubmit || isSubmitting || createDriverMutation.isPending}
              >
                {isSubmitting || createDriverMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          />
        </form>
      </div>
    </>
  );
}