import { useForm, Field } from '@tanstack/react-form'
import { Toaster, toast } from 'sonner'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { createPaymentMethod, type PaymentMethod } from '@/api/PaymentMethods'
import { 
  CreditCard, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  Smartphone,
  Loader2 
} from 'lucide-react'

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

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'paypal':
      return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
    case 'mpesa':
      return <Smartphone className="w-5 h-5 text-green-600" />
    case 'visa':
    case 'master_card':
      return <CreditCard className="w-5 h-5 text-blue-600" />
    default:
      return <DollarSign className="w-5 h-5 text-gray-500" />
  }
}

export function CreatePaymentMethodForm({ onSuccess }: CreatePaymentMethodFormProps = {}) {
  const paymentMethodMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await createPaymentMethod(data)
      return response
    },
  })

  // Get fare from localStorage
  const fareAmount = Number(localStorage.getItem('fare')) || 0

  const form = useForm({
    defaultValues: {
      payment_type: 'paypal', // Default to PayPal
      amount: fareAmount, // Default to fare amount
      currency: 'USD',
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
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add Payment Method</h2>
              <p className="text-blue-100 text-sm">Secure your payment information</p>
            </div>
          </div>
        </div>

        <form
          className="p-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          {/* Payment Type Selection - Hidden since it's PayPal only */}
          <Field
            form={form}
            name="payment_type"
            validators={{
              onChange: ({ value }) => validateField(value, formSchema.shape.payment_type),
              onBlur: ({ value }) => validateField(value, formSchema.shape.payment_type),
            }}
            children={(field) => (
              <div className="space-y-2">
                <label htmlFor="payment_type" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Payment Method Type
                </label>
                <div className="relative">
                  <select
                    id="payment_type"
                    name={field.name}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    value={field.state.value as string}
                    disabled // Make it read-only since it's PayPal only
                  >
                    <option value="paypal">PayPal</option>
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {getPaymentIcon(field.state.value as string)}
                  </div>
                </div>
              </div>
            )}
          />

          {/* Amount and Currency Row */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              form={form}
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  if (value !== undefined && value < fareAmount) {
                    return `Amount cannot be less than the fare amount ($${fareAmount.toFixed(2)})`
                  }
                  return undefined
                },
                onBlur: ({ value }) => {
                  if (value !== undefined && value < fareAmount) {
                    return `Amount cannot be less than the fare amount ($${fareAmount.toFixed(2)})`
                  }
                  return undefined
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
                      type="number"
                      name={field.name}
                      value={field.state.value as number || ''}
                      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : fareAmount)}
                      onBlur={field.handleBlur}
                      placeholder={fareAmount.toFixed(2)}
                      step="0.01"
                      min={fareAmount} // Set minimum to fare amount
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {field.state.meta.errors?.[0] && (
                    <div className="text-red-500 text-sm flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum fare amount: ${fareAmount.toFixed(2)}
                  </p>
                </div>
              )}
            />

            <Field
              form={form}
              name="currency"
              validators={{
                onChange: () => undefined,
                onBlur: () => undefined,
              }}
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200 appearance-none bg-white"
                      name={field.name}
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="KES">KES (KSh)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Default Payment Method Toggle */}
          <Field
            form={form}
            name="is_default"
            validators={{
              onChange: () => undefined,
              onBlur: () => undefined,
            }}
            children={(field) => (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <label htmlFor={field.name} className="text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                      Set as default payment method
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use this for future transactions
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={field.state.value as boolean}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    onBlur={field.handleBlur}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          />

          {/* Submit Button */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || paymentMethodMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting || paymentMethodMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Payment Method...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Add Payment Method</span>
                  </>
                )}
              </button>
            )}
          />

          {/* Security Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Your payment information is encrypted and secure</span>
            </p>
          </div>
        </form>
      </div>
    </>
  )
}