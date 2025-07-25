import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  getUserReviews,
  getDriverReviews,
  type Review, 
  type ReviewFilters,
  type PaginatedReviewsResponse
} from '@/api/Review'
import styles from '../FormStyles.module.css'

interface UserReviewsProps {
  userId?: number
  driverId?: number
  title?: string
  showFilters?: boolean
  maxItems?: number
}

export function UserReviews({ 
  userId, 
  driverId, 
  title = "Reviews", 
  showFilters = true, 
  maxItems = 5 
}: UserReviewsProps) {
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: maxItems,
    sortBy: 'timestamp',
    sortOrder: 'DESC',
  })

  const [searchInput, setSearchInput] = useState('')

  // Determine which API to use based on props
  const queryKey = userId ? ['userReviews', userId, filters] : ['driverReviews', driverId, filters]
  const queryFn = userId 
    ? () => getUserReviews(userId, filters)
    : () => getDriverReviews(driverId!, filters)

  const { data: reviewsResponse, isLoading, isError } = useQuery<PaginatedReviewsResponse>({
    queryKey,
    queryFn,
    enabled: !!(userId || driverId),
  })

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
    return <div className="p-4">Loading reviews...</div>
  }

  if (isError) {
    return <div className="p-4 text-red-600">Error loading reviews.</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviewsResponse && reviewsResponse.data.length > 0 ? (
        <div className="space-y-4">
          {reviewsResponse.data.map((review: Review) => (
            <div key={review.review_id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium">
                    {userId ? `From: ${review.reviewer.name}` 
                           : `For: ${review.reviewee.name}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.timeAgo}
                  </div>
                </div>
                <div className="text-yellow-500 font-semibold">
                  {review.starDisplay}
                </div>
              </div>
              
              <p className="text-gray-700 mb-2">{review.comment}</p>
              
              {review.booking && (
                <div className="text-sm text-gray-600">
                  📍 {review.booking.pickup_location} → {review.booking.destination}
                </div>
              )}
            </div>
          ))}

          {/* Pagination for full view */}
          {showFilters && reviewsResponse.meta.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                className={`px-3 py-1 rounded ${!reviewsResponse.meta.hasPrev ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                disabled={!reviewsResponse.meta.hasPrev}
                onClick={() => handlePageChange(reviewsResponse.meta.page - 1)}
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {reviewsResponse.meta.page} of {reviewsResponse.meta.totalPages}
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
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      )}
    </div>
  )
}

export default UserReviews
