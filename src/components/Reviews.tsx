import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, deleteReview, updateReview, type Review, type UpdateReviewData } from '@/api/Review'
import { useAuth } from '@/hooks/useAuth'
import { Toaster, toast } from 'sonner'
import styles from '../FormStyles.module.css'

function Reviews() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: allReviews, isLoading, isError } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: getReviews,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: () => {
      toast.error('Failed to delete review')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateReviewData) => updateReview(data),
    onSuccess: () => {
      toast.success('Review updated successfully')
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      setEditingReview(null)
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })

  const [editingReview, setEditingReview] = useState<Review | null>(null)

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>
  }

  if (isError) {
    return <div className="p-6">Error loading reviews.</div>
  }

  const handleEditClick = (review: Review) => {
    setEditingReview(review)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
  }

  const handleUpdate = (updated: UpdateReviewData) => {
    updateMutation.mutate(updated)
  }

  const handleDelete = (id?: number) => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="p-6">
      <Toaster richColors position="top-center" />

      <h1 className="text-2xl font-bold mb-6">All Reviews</h1>

      {editingReview && (
        <div className="mb-6">
          <EditReviewForm
            review={editingReview}
            onCancel={handleCancelEdit}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {allReviews && allReviews.length > 0 ? (
        <div className="grid gap-4">
          {allReviews.map((review) => (
            <div key={review.review_id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{review.reviewer_id}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 mr-2">★ {review.rating.toFixed(1)}</span>
                <span className="text-gray-700">{review.comment}</span>
              </div>
              {(user?.role === 'admin' ) && (
                <div className={styles.actions}>
                  <button
                    className={`${styles.actionButton} ${styles.edit}`}
                    onClick={() => handleEditClick(review)}
                  >
                    Edit
                  </button>
                  {user?.userId === review.reviewer_id&& (
                    <button
                      className={`${styles.actionButton} ${styles.delete}`}
                      onClick={() => handleDelete(review.review_id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      )}
    </div>
  )
}

type EditReviewFormProps = {
  review: Review
  onCancel: () => void
  onUpdate: (updated: UpdateReviewData) => void
}

function EditReviewForm({ review, onCancel, onUpdate }: EditReviewFormProps) {
  const [formData, setFormData] = useState<UpdateReviewData>({
    review_id: review.review_id,
    rating: review.rating,
    comment: review.comment,
  })

  const handleChange = (field: keyof UpdateReviewData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Edit Review</div>

      <label className={styles.label}>Rating (1–5):</label>
      <input
        className={styles.input}
        type="number"
        min="1"
        max="5"
        step="0.1"
        value={formData.rating}
        onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
      />

      <label className={styles.label}>Comment:</label>
      <textarea
        className={styles.input}
        value={formData.comment}
        onChange={(e) => handleChange('comment', e.target.value)}
      />

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update Review
        </button>
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default Reviews
