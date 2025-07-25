import { useForm, Field } from '@tanstack/react-form'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { createPaymentMethod, type PaymentMethod } from '@/api/PaymentMethods'

const formSchema = z.object({
  payment_type: z.string().min(1, 'Payment type is required'),
  amount: z.number().optional(),
  currency: z.string().optional(),
  userId: z.number().int().positive('User ID must be a positive integer').optional(),
  is_default: z.boolean().optional(),
})

export type FormData = z.infer<typeof formSchema>

const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
  const result = schema.safeParse(value)
  if (!result.success) {
    return result.error.issues[0]?.message || 'Validation error'
  }
  return undefined
}

interface CreatePaymentMethodFormProps {
  onSuccess?: (paymentMethod?: PaymentMethod) => void | Promise<void>
}


export function CreatePaymentMethodForm({ onSuccess }: CreatePaymentMethodFormProps = {}) {
 const paymentMethodMutation = useMutation({
  mutationFn: async (data: FormData) => {
    const response = await createPaymentMethod(data)
    return response
  },
})

  const form = useForm({
    defaultValues: {
      payment_type: '',
      amount: undefined,
      currency: '',
      is_default: true,
      userId: Number(localStorage.getItem('userId')) || 0,
    } as FormData,
    onSubmit: async ({ value }) => {
      const res = formSchema.safeParse(value)
      if (!res.success) {
        console.error('Validation errors', res.error.issues)
        toast.error('Please ensure your data is correct before submitting')
        return
      }
    try {
      const createdPaymentMethod = await paymentMethodMutation.mutateAsync(res.data)
      form.reset()
      toast.success('Payment method created successfully')

      if (onSuccess) {
     await onSuccess(createdPaymentMethod) 
    }
    } catch (error) {
  console.error('Error creating payment method:', error)
  toast.error('Failed to create payment method. Please try again.')
    }
    },
  })

  return (
    <>
      <Toaster richColors position="top-center" closeButton={false} />
      <form
        className={styles.formContainer}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className={styles.formTitle}>Create Payment Method</div>
  <Field
  form={form}
  name="payment_type"
  validators={{
    onChange: ({ value }) => validateField(value, formSchema.shape.payment_type),
    onBlur: ({ value }) => validateField(value, formSchema.shape.payment_type),
  }}
  children={(field) => (
    <div className={styles.formGroup}>
      <label htmlFor="payment_type" className={styles.label}>
        Select Payment Method:
      </label>
      <select
        id="payment_type"
        name={field.name}
        className={styles.input}
        value={field.state.value as string}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        <option value="">-- Select a payment method --</option>
        <option value="paypal">PayPal</option>
        <option value="mpesa">M-Pesa</option>
        <option value="visa">Visa</option>
      </select>
      {field.state.meta.errors?.[0] && <div className={styles.error}>{field.state.meta.errors[0]}</div>}
    </div>
  )}
/>
        <Field
          form={form}
          name="amount"
          validators={{
            onChange: ({ value }) => (value !== undefined ? undefined : undefined),
            onBlur: ({ value }) => (value !== undefined ? undefined : undefined),
          }}
          children={(field) => (
            <div className={styles.formGroup}>
              <label htmlFor={field.name} className={styles.label}>
                Amount:
              </label>
              <input
                className={styles.input}
                type="number"
                name={field.name}
                value={field.state.value as number | undefined || ''}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                onBlur={field.handleBlur}
                placeholder="Enter amount"
              />
            </div>
          )}
        />
        <Field
          form={form}
          name="currency"
          validators={{
            onChange: ({ value }) => undefined,
            onBlur: ({ value }) => undefined,
          }}
          children={(field) => (
            <div className={styles.formGroup}>
              <label htmlFor={field.name} className={styles.label}>
                Currency:
              </label>
              <input
                className={styles.input}
                type="text"
                name={field.name}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter currency"
              />
            </div>
          )}
        />
        <Field
          form={form}
          name="is_default"
          validators={{
            onChange: ({ value }) => undefined,
            onBlur: ({ value }) => undefined,
          }}
          children={(field) => (
            <div className={styles.formGroup}>
              <label htmlFor={field.name} className={styles.label}>
                Make this payment method default:
              </label>
              <input
                className={styles.checkbox}
                type="checkbox"
                name={field.name}
                checked={field.state.value as boolean}
                onChange={(e) => field.handleChange(e.target.checked)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
          />
        
        <div className="pt-4 space-y-2">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button className={styles.button} type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Creating payment method...' : 'Submit'}
              </button>
            )}
          />
        </div>
      </form>
    </>
  )
}
