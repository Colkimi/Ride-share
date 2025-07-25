import { useForm, Field } from '@tanstack/react-form';
import styles from '../FormStyles.module.css';
import { Toaster,toast } from 'sonner'
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/api/apiUtils';

export enum Role{
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    DRIVER = 'driver'
}

const formSchema = z.object({
  firstName: z
  .string()
  .min(2, 'First name should have atleast 2 characters')
  .max(30, 'first name should not exceed 30 characters'),
  lastName: z
  .string()
  .min(2, 'Last name should have atleast 2 characters')
  .max(30, 'last name should not exceed 30 characters'),
  email: z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required'),
  phone: z
  .string()
  .min(10, 'Phone number should be atleast 10 characters'),
  password: z
  .string()
  .min(7, 'Password should be atleast 8 characters')
  .max(100, 'Password must be less than 100 characters'),
  role: z.nativeEnum(Role)
})
export type FormData = z.infer<typeof formSchema> 

const validateUser = <T,>(value: T, schema: z.ZodType<T>) => {
    const result = schema.safeParse(value)
    if (!result.success) {
        return result.error.issues[0]?.message || 'Validation error'
    }
    return undefined
}

type AdminCreateUserFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function AdminCreateUserForm({ onSuccess, onCancel }: AdminCreateUserFormProps) {

  const userMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('User created successfully!');
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating user profile:', error);
      toast.error('Failed to create user. Please try again.');
    }
  });

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: Role.CUSTOMER,
    } as FormData,
    onSubmit: async ({ value }) => {
      const res = formSchema.safeParse(value);
      if(!res.success){
        console.error('Validation errors', res.error.issues);
        toast.error('Please ensure your data is correct before submitting');
        return
      }

      try {
        await userMutation.mutateAsync(res.data)
      } catch (error) {
        // Error handled in mutation
      }
    },
  });

  return (
    <>
      <Toaster richColors position="top-center" closeButton={false} />
      <div className="space-y-4">
        <form 
          className="space-y-4" 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Name Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              form={form}
              name="firstName"
              validators={{
                onChange: ({value}) => validateUser(value, formSchema.shape.firstName),
                onBlur: ({value}) => validateUser(value, formSchema.shape.firstName),
              }}
              children={(field) => (
                <div className="space-y-1">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    First Name *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    type='text'
                    name={field.name}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder='John'
                  />
                  {field.state.meta.errors?.[0] && (
                    <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                  )}
                </div>
              )}
            />

            <Field
              form={form}
              name="lastName"
              validators={{
                onChange: ({value}) => validateUser(value, formSchema.shape.lastName),
                onBlur: ({value}) => validateUser(value, formSchema.shape.lastName),
              }}
              children={(field) => (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Last Name *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    type='text'
                    placeholder='Doe'
                    name={field.name}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Email Field */}
          <Field
            form={form}
            name="email"
            validators={{
              onChange: ({value}) => validateUser(value, formSchema.shape.email),
              onBlur: ({value}) => validateUser(value, formSchema.shape.email),
            }}
            children={(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  type="email"
                  placeholder='user@example.com'
                  name={field.name}
                  value={field.state.value as string}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors?.[0] && (
                  <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          {/* Phone Field */}
          <Field
            form={form}
            name="phone"
            validators={{
              onChange: ({value}) => validateUser(value, formSchema.shape.phone),
              onBlur: ({value}) => validateUser(value, formSchema.shape.phone),
            }}
            children={(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Phone Number *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  type="tel"
                  placeholder='+254 (7) 456 7890'
                  name={field.name}
                  value={field.state.value as string}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors?.[0] && (
                  <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          {/* Password Field */}
          <Field
            form={form}
            name="password"
            validators={{
              onChange: ({value}) => validateUser(value, formSchema.shape.password),
              onBlur: ({value}) => validateUser(value, formSchema.shape.password),
            }}
            children={(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  type="password"
                  name={field.name}
                  value={field.state.value as string}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Enter password"
                />
                {field.state.meta.errors?.[0] && (
                  <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          {/* Role Field */}
          <Field 
            form={form}
            name='role'
            validators={{
              onChange: ({value}) => validateUser(value, formSchema.shape.role),
              onBlur: ({value}) => validateUser(value, formSchema.shape.role),
            }}
            children={(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Role *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  name={field.name}
                  value={field.state.value as Role}
                  onChange={(e) => field.handleChange(e.target.value as Role)}
                >
                  <option value={Role.CUSTOMER}>Customer</option>
                  <option value={Role.DRIVER}>Driver</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
                {field.state.meta.errors?.[0] && (
                  <div className="text-red-500 text-xs mt-1">{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating User...
                    </div>
                  ) : (
                    'Create User'
                  )}
                </button>
              )}
            />
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
