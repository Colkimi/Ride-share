import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getReviews, 
  deleteReview, 
  updateReview, 
  type Review, 
  type UpdateReviewData, 
  type ReviewFilters,
  type PaginatedReviewsResponse
} from '@/api/Review'
import { useAuth } from '@/hooks/useAuth'
import { Toaster, toast } from 'sonner'
import ReviewStatsCard from './ReviewStatsCard'
import styles from '../FormStyles.module.css'

function Reviews() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // State for filters and pagination
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
    sortBy: 'timestamp',
    sortOrder: 'DESC',
  })

  const [searchInput, setSearchInput] = useState('')

  // Fetch paginated reviews
  const { data: reviewsResponse, isLoading, isError } = useQuery<PaginatedReviewsResponse>({
    queryKey: ['reviews', filters],
    queryFn: () => getReviews(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
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
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
      setEditingReview(null)
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })

  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchInput, filters.search])

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

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

      {/* Statistics Dashboard */}
      <ReviewStatsCard 
        className="mb-6" 
        statsData={reviewsResponse?.stats} 
      />

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search comments..."
              className={styles.input}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select
              className={styles.input}
              value={filters.minRating || ''}
              onChange={(e) => handleFilterChange({ minRating: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Any</option>
              <option value="1">1★</option>
              <option value="2">2★</option>
              <option value="3">3★</option>
              <option value="4">4★</option>
              <option value="5">5★</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              className={styles.input}
              value={filters.sortBy || 'timestamp'}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as ReviewFilters['sortBy'] })}
            >
              <option value="timestamp">Date</option>
              <option value="rating">Rating</option>
              <option value="reviewer">Reviewer</option>
              <option value="reviewee">Reviewee</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              className={styles.input}
              value={filters.sortOrder || 'DESC'}
              onChange={(e) => handleFilterChange({ sortOrder: e.target.value as ReviewFilters['sortOrder'] })}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {editingReview && (
        <div className="mb-6">
          <EditReviewForm
            review={editingReview}
            onCancel={handleCancelEdit}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {reviewsResponse && reviewsResponse.data.length > 0 ? (
        <div className="grid gap-4">
          {reviewsResponse.data.map((review: Review) => (
            <div key={review.review_id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">
                  {review.reviewer.name}
                </div>
                <div className="text-sm text-gray-500">
                  {review.timeAgo}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 mr-2">
                  {review.starDisplay}
                </span>
                <span className="text-gray-700">{review.comment}</span>
              </div>
              {review.reviewee && (
                <div className="text-sm text-gray-600 mb-2">
                  Review for: {review.reviewee.name}
                </div>
              )}
              {review.booking && (
                <div className="text-sm text-gray-600 mb-2">
                  Trip: {review.booking.pickup_location} → {review.booking.destination}
                </div>
              )}
              {(user?.role === 'admin' || user?.userId === review.reviewer.userId) && (
                <div className={styles.actions}>
                  <button
                    className={`${styles.actionButton} ${styles.edit}`}
                    onClick={() => handleEditClick(review)}
                  >
                    Edit
                  </button>
                  {(user?.role === 'admin' || user?.userId === review.reviewer.userId) && (
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
      ) : reviewsResponse && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      )}

      {/* Pagination */}
      {reviewsResponse && reviewsResponse.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            className={`px-3 py-1 rounded ${!reviewsResponse.meta.hasPrev ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            disabled={!reviewsResponse.meta.hasPrev}
            onClick={() => handlePageChange(reviewsResponse.meta.page - 1)}
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {reviewsResponse.meta.page} of {reviewsResponse.meta.totalPages} 
            ({reviewsResponse.meta.total} total reviews)
          </span>
          
          <button
            className={`px-3 py-1 rounded ${!reviewsResponse.meta.hasNext ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            disabled={!reviewsResponse.meta.hasNext}
            onClick={() => handlePageChange(reviewsResponse.meta.page + 1)}
          >
            Next
          </button>
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
    review_id: review.review_id!,
    rating: review.rating,
    comment: review.comment,
  })

  const handleChange = (field: keyof UpdateReviewData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!review.review_id) {
      console.error('Review ID is required for update')
      return
    }
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
        step="1"
        value={formData.rating}
        onChange={(e) => handleChange('rating', parseInt(e.target.value))}
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
