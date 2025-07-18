import { useForm, Field } from '@tanstack/react-form';
import styles from '../FormStyles.module.css';
import { Toaster,toast } from 'sonner'
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/api/apiUtils';


const formSchema = z.object({
  userId: z
  .number()
  .min(1, 'User Id is required'),
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
  password: z
  .string()
  .min(7, 'Password should be atleast 8 characters')
  .max(100, 'Password must be less than 100 characters'),
  role: z
  .string()  
})
export type FormData = z.infer<typeof formSchema>

const validateUser = <T,>(value: T, schema: z.ZodType<T>) => {
    const result = schema.safeParse(value)
    if (!result.success) {
        return result.error.issues[0]?.message || 'Validation error'
    }
    return undefined
}

export function CreateUserForm() {

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
  });
  const form = useForm({
    defaultValues: {
      userId: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'driver',
    }as FormData,
    onSubmit: async ({ value }) => {
      const res = formSchema.safeParse(value);
      if(!res.success){
        console.error('Validation errors', res.error.issues);

        toast.error('Please ensure your data is correct before submitting');
        return
      }

      try {
        await userMutation.mutateAsync(res.data)
        form.reset();
        toast.success('Driver created successfully');
      } catch (error) {
        console.error('Error creating user profile:', error);
        toast.error('Failed to create user.Please try again.');
      }
    },
  });

  return (
    <>
    <Toaster richColors position="top-center" closeButton={false} />
      <form className={styles.formContainer} onSubmit={(e) =>{
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <div className={styles.formTitle}>Create User</div>
      <Field
        form={form}
        name="userId"
        validators={{
          onChange: ({value}) => validateUser(value, formSchema.shape.userId),
          onBlur: ({value}) => validateUser(value, formSchema.shape.userId),
        }}
        children={(field) => (
          <div className={styles.formGroup}>
            <label htmlFor={field.name} className={styles.label}>User Id:</label>
            <input
              className={styles.input}
              type='number'
              name={field.name}
              value={field.state.value as number}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              placeholder='Enter user id'
            />
            {field.state.meta.errors?.[0] && (
              <div className={styles.error}>{field.state.meta.errors[0]}</div>
            )}
          </div>
        )}/>
      <Field
        form={form}
        name="firstName"
        validators={{
          onChange: ({value}) => validateUser(value, formSchema.shape.firstName),
          onBlur: ({value}) => validateUser(value, formSchema.shape.firstName),
        }}
        children={(field) => (
          <div className={styles.formGroup}>
            <label htmlFor={field.name} className={styles.label}>First Name:</label>
            <input
              className={styles.input}
              type='text'
              name= {field.name}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder='Enter your first name'
            />
            {field.state.meta.errors?.[0] && (
              <div className={styles.error}>{field.state.meta.errors[0]}</div>
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
          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name:</label>
            <input
              className={styles.input}
              type='text'
              name={field.name}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.[0] && (
              <div className={styles.error}>{field.state.meta.errors[0]}</div>
            )}
          </div>
        )}
      />
      <Field
        form={form}
        name="email"
        validators={{
          onChange: ({value}) => validateUser(value, formSchema.shape.email),
          onBlur: ({value}) => validateUser(value, formSchema.shape.email),
        }}
        children={(field) => (
          <div className={styles.formGroup}>
            <label htmlFor={field.name} className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              name={field.name}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.[0] && (
              <div className={styles.error}>{field.state.meta.errors[0]}</div>
            )}
          </div>
        )}
      />
        <Field
          form={form}
          name="password"
          validators={{
            onChange: ({value}) => validateUser(value, formSchema.shape.password),
            onBlur: ({value}) => validateUser(value, formSchema.shape.password),
          }}
          children={(field) => (
            <div className={styles.formGroup}>
              <label htmlFor={field.name} className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                name={field.name}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors?.[0] && (
                <div className={styles.error}>{field.state.meta.errors[0]}</div>
              )}
            </div>
          )}
        />
        <div className='pt-4 space-y-2'>
        <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) =>(
      <button 
      className={styles.button} 
      type="submit"
      disabled= {!canSubmit

      }>{isSubmitting ? 'Creating Driver...': 'Submit'}
      </button>
        )}
        />
      </div>
      <p>Already have an account? <a href='/login'>Sign in</a></p>
    </form>
    </>
  );
}
