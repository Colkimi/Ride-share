import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPaymentMethods,
  deletePaymentMethod,
  updatePaymentMethod,
  type PaymentMethod,
  type UpdatePaymentMethodData,
  methodPay,
} from '@/api/PaymentMethods'
import { CreatePaymentMethodForm } from '@/Forms/CreatePaymentMethodForm'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'

function PaymentMethodList() {
  const queryClient = useQueryClient()
  const { data: paymentMethods, isLoading, isError } = useQuery<PaymentMethod[]>({
    queryKey: ['paymentMethods'],
    queryFn: getPaymentMethods,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePaymentMethod(id),
    onSuccess: () => {
      toast.success('Payment method deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
    },
    onError: () => {
      toast.error('Failed to delete payment method')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePaymentMethodData) => updatePaymentMethod(data),
    onSuccess: () => {
      toast.success('Payment method updated successfully')
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
      setEditingPaymentMethod(null)
    },
    onError: () => {
      toast.error('Failed to update payment method')
    },
  })

  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)

  if (isLoading) {
    return <div>Loading payment methods...</div>
  }

  if (isError) {
    return <div>Error loading payment methods.</div>
  }

  const handleDelete = (id?: number) => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEditClick = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.id === undefined) {
      console.error('Payment method id is undefined, cannot edit')
      return
    }
    setEditingPaymentMethod(paymentMethod)
  }

  const handleCancelEdit = () => {
    setEditingPaymentMethod(null)
  }

  const handleUpdate = (updatedPaymentMethod: UpdatePaymentMethodData) => {
    if (updatedPaymentMethod.id === undefined) {
      console.error('Payment method id is undefined, cannot update')
      return
    }
    updateMutation.mutate(updatedPaymentMethod)
  }

  return (
    <div className="p-2 border-b border-gray-200">
      <Toaster richColors position="top-center" closeButton={false} />
      {!editingPaymentMethod && <CreatePaymentMethodForm />}
      <h2 className="text-xl font-bold mt-4 mb-2">Existing Payment Methods</h2>
      {paymentMethods && paymentMethods.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Payment Type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((pm) => (
              <tr key={pm.id}>
                <td>{pm.id}</td>
                <td>{pm.payment_type}</td>
                <td>{pm.amount}</td>
                <td>{pm.currency}</td>
                <td>{pm.details}</td>
                <td className={styles.actions}>
                  <button 
                    className={`${styles.actionButton} ${styles.edit}`} 
                    onClick={() => handleEditClick(pm)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.delete}`} 
                    onClick={() => handleDelete(pm.id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No payment methods found.</div>
      )}
      {editingPaymentMethod && (
        <EditPaymentMethodForm
          paymentMethod={editingPaymentMethod}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

type EditPaymentMethodFormProps = {
  paymentMethod: PaymentMethod
  onCancel: () => void
  onUpdate: (updatedPaymentMethod: UpdatePaymentMethodData) => void
}

function EditPaymentMethodForm({ paymentMethod, onCancel, onUpdate }: EditPaymentMethodFormProps) {
  const [formData, setFormData] = useState<UpdatePaymentMethodData>({
    id: paymentMethod.id!,
    payment_type: paymentMethod.payment_type,
    amount: paymentMethod.amount,
    currency: paymentMethod.currency,
    details: paymentMethod.details,
  })

  const handleChange = (field: keyof UpdatePaymentMethodData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Edit Payment Method</div>

      <label className={styles.label}>Payment Type:</label>
      <select
        className={styles.select}
        value={formData.payment_type || ''}
        onChange={(e) => handleChange('payment_type', e.target.value)}
      >
        <option value="">Select Payment Type</option>
        {Object.values(methodPay).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <label className={styles.label}>Amount:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.amount || 0}
        onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
      />

      <label className={styles.label}>Currency:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.currency || ''}
        onChange={(e) => handleChange('currency', e.target.value)}
      />

      <label className={styles.label}>Details:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.details || ''}
        onChange={(e) => handleChange('details', e.target.value)}
      />

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update Payment Method
        </button>{' '}
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default PaymentMethodList
