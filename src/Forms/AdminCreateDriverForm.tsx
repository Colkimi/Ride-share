import { useForm, Field } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';
import { API_BASE_URL } from '@/api/apiUtils';
import styles from '../FormStyles.module.css';

const adminDriverSchema = z.object({
  userId: z.number().min(1, 'User ID is required'),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  rating: z.number().min(0).max(5).default(0),
  verificationStatus: z.enum(['verified', 'unverified', 'rejected']).default('unverified'),
  totalTrips: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AdminDriverData = z.infer<typeof adminDriverSchema>;

const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Validation error';
  }
  return undefined;
};

export function AdminCreateDriverForm() {
  const createDriverMutation = useMutation({
    mutationFn: async (data: AdminDriverData) => {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create driver');
      }
      return response.json();
    },
  });

  const form = useForm({
    defaultValues: {
      userId: 0,
      licenseNumber: '',
      rating: 0,
      verificationStatus: 'unverified' as const,
      totalTrips: 0,
      isAvailable: true,
      latitude: undefined,
      longitude: undefined,
    } as AdminDriverData,
    onSubmit: async ({ value }) => {
      const validation = adminDriverSchema.safeParse(value);
      if (!validation.success) {
        toast.error('Please correct the validation errors');
        return;
      }

      try {
        await createDriverMutation.mutateAsync(validation.data);
        toast.success('Driver created successfully!');
        form.reset();
      } catch (error) {
        console.error('Driver creation error:', error);
        toast.error('Failed to create driver. Please try again.');
      }
    },
  });

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Create New Driver (Admin)</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
          
          <Field
            form={form}
            name="userId"
            validators={{
              onChange: ({ value }) => validateField(value, adminDriverSchema.shape.userId),
            }}
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>User ID:</label>
                <input
                  className={styles.input}
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                  placeholder="Enter existing user ID"
                />
                {field.state.meta.errors?.[0] && (
                  <div className={styles.error}>{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          <Field
            form={form}
            name="licenseNumber"
            validators={{
              onChange: ({ value }) => validateField(value, adminDriverSchema.shape.licenseNumber),
            }}
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>License Number:</label>
                <input
                  className={styles.input}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'verified' | 'unverified' | 'rejected')}
                  placeholder="Enter driver's license number"
                />
                {field.state.meta.errors?.[0] && (
                  <div className={styles.error}>{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          <Field
            form={form}
            name="rating"
            validators={{
              onChange: ({ value }) => validateField(value, adminDriverSchema.shape.rating),
            }}
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Rating (0-5):</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                />
                {field.state.meta.errors?.[0] && (
                  <div className={styles.error}>{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          <Field
            form={form}
            name="verificationStatus"
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>Verification Status:</label>
                <select
                  className={styles.input}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'verified' | 'unverified' | 'rejected')}
                >
                  <option value="unverified">Unverified</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          />

          <Field
            form={form}
            name="totalTrips"
            validators={{
              onChange: ({ value }) => validateField(value, adminDriverSchema.shape.totalTrips),
            }}
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>Total Trips:</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
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
            name="isAvailable"
            children={(field) => (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  Available for rides
                </label>
              </div>
            )}
          />

          <div className={styles.formGroup}>
            <label className={styles.label}>Initial Location (Optional):</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field
                form={form}
                name="latitude"
                children={(field) => (
                  <input
                    className={styles.input}
                    type="number"
                    step="0.000001"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Latitude"
                  />
                )}
              />
              <Field
                form={form}
                name="longitude"
                children={(field) => (
                  <input
                    className={styles.input}
                    type="number"
                    step="0.000001"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Longitude"
                  />
                )}
              />
            </div>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button 
                className={styles.button} 
                type="submit"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Creating Driver...' : 'Create Driver'}
              </button>
            )}
          />
        </form>
      </div>
    </>
  );
}
