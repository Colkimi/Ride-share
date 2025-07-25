import { useQuery } from '@tanstack/react-query'
import { getReviewStats, type ReviewStats } from '@/api/Review'

interface ReviewStatsCardProps {
  title?: string
  className?: string
  statsData?: ReviewStats // Allow passing stats data directly
}

export function ReviewStatsCard({ 
  title = "Review Statistics", 
  className = "",
  statsData 
}: ReviewStatsCardProps) {
  // Only fetch stats if not provided directly
  const { data: fetchedStats, isLoading, isError } = useQuery<ReviewStats>({
    queryKey: ['reviewStats'],
    queryFn: getReviewStats,
    enabled: !statsData, // Only fetch if statsData is not provided
  })

  // Use provided stats or fetched stats
  const reviewStats = statsData || fetchedStats

  if (isLoading && !statsData) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if ((isError && !statsData) || !reviewStats) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-3 text-red-600">Error loading review statistics</h3>
      </div>
    )
  }

  const maxRating = Math.max(...Object.values(reviewStats.ratingDistribution))

  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{reviewStats.averageRating}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-yellow-500 text-lg">
            {'★'.repeat(Math.round(parseFloat(reviewStats.averageRating)))}
          </div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{reviewStats.totalReviews}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]
          const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0
          const barWidth = maxRating > 0 ? (count / maxRating) * 100 : 0
          
          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-400 h-3 rounded-full" 
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewStatsCard
