// Example usage of the new review components

import { UserReviews } from '@/components/UserReviews'
import ReviewStatsCard from '@/components/ReviewStatsCard'

// Example 1: Show reviews for a specific user (e.g., in a profile page)
export function UserProfilePage({ userId }: { userId: number }) {
  return (
    <div className="space-y-6">
      <h1>User Profile</h1>
      
      {/* Show reviews received by this user */}
      <UserReviews 
        userId={userId} 
        title="Reviews Received" 
        showFilters={true}
        maxItems={10}
      />
    </div>
  )
}

// Example 2: Show reviews for a specific driver (e.g., in driver profile)
export function DriverProfilePage({ driverId }: { driverId: number }) {
  return (
    <div className="space-y-6">
      <h1>Driver Profile</h1>
      
      {/* Show reviews received by this driver */}
      <UserReviews 
        driverId={driverId} 
        title="Driver Reviews" 
        showFilters={false}
        maxItems={5}
      />
    </div>
  )
}

// Example 3: Dashboard with statistics
export function ReviewsDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ReviewStatsCard title="Overall Review Statistics" />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Reviews</h2>
        {/* You could add a limited view of recent reviews here */}
      </div>
    </div>
  )
}

// Example 4: Usage in DriverDashboard
export function DriverDashboardWithReviews({ driverId }: { driverId: number }) {
  return (
    <div className="space-y-6">
      {/* Other dashboard content */}
      
      <UserReviews 
        driverId={driverId}
        title="My Recent Reviews"
        showFilters={false}
        maxItems={3}
      />
    </div>
  )
}
