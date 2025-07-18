import { useForm, Field } from '@tanstack/react-form';
import { z } from "zod"
import styles from '../FormStyles.module.css';
import { toast, Toaster } from "sonner"
import { useMutation } from '@tanstack/react-query';
import { loginUser, type LoginUser } from '@/api/Authenticate';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Dashboard } from '@/routes/dashboard';

const formSchema = z.object({
  email: z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required'),
  password: z
  .string()
  .min(7, 'Password should be atleast 8 characters')
  .max(100, 'Password must be less than 100 characters')
})
export type FormData = z.infer<typeof formSchema>

const validateUser = <T,>(value: T, schema: z.ZodType<T>) => {
    const result = schema.safeParse(value)
    if (!result.success) {
        return result.error.issues[0]?.message || 'Validation error'
    }
    return undefined
}

export function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      return await loginUser(data);
    },
  });
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as FormData,
    onSubmit: async ({ value }) => {
      const res = formSchema.safeParse(value);
      if (!res.success) {
        console.error('Validation error:', res.error.issues);
        toast.error('Please ensure your data is correct before submitting');
        return;
      }

      try {
        const loginResponse = await loginMutation.mutateAsync(res.data);
        
        const userData = login(loginResponse.accessToken, loginResponse.refreshToken);
        
        toast.success(`Welcome back!`);
        form.reset();
    
        navigate({ to: '/dashboard' });
        
      } catch (error) {
        console.error('Error logging in user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to log in. Check your details and try again.';
        console.log(errorMessage);
        toast.error('Failed to sign you in please check your credentials and try again');
      }
    },
  });

  return (
    <>
      <Toaster richColors position="top-center" closeButton={false} />
      <div 
      className="items-center justify-center min-h-screen bg-cover bg-center pt-20"
          style={{
              backgroundImage : `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/ride3.jpg')`,
          }}
          >
      <form className={styles.formContainer} onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      >
        <div className={styles.formTitle}>Sign In</div>
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
                placeholder='Enter your email address'
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
                placeholder='Enter your password'
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
            children={([canSubmit, isSubmitting]) => (
              <button 
                className={styles.button} 
                type="submit"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            )}
          />
        </div>
        <div className="text-md text-center mt-4">
          <span>Don't have an account? </span>
          <a href="/sign-up" className="text-blue-700 hover:underline">Sign up</a>
        </div>
      </form>
      </div>
    </>
  );
}
