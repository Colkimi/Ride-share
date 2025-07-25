export interface Review {
  review_id?: number;
  rating: number;
  comment: string;
  timestamp?: Date;
  reviewer: {
    userId: number;
    name: string;
    profile_picture?: string;
  };
  reviewee: {
    userId: number;
    name: string;
    profile_picture?: string;
  };
  booking?: {
    id: number;
    pickup_location: string;
    destination: string;
    created_at: Date;
  };
  timeAgo: string;
  starDisplay: string;
}

export interface PaginatedReviewsResponse {
  data: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    averageRating: string;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

export interface ReviewStats {
  averageRating: string;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'timestamp' | 'rating' | 'reviewer' | 'reviewee';
  sortOrder?: 'ASC' | 'DESC';
}

export type CreateReviewData = {
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
  booking_id?: number;
};

export type UpdateReviewData = Partial<Review> & { review_id: number };

const url = 'http://localhost:8000';

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData = `Error: ${response.status} ${response.statusText}`;

    try {
      const data = response.headers.get('Content-Type');
      if (data && data.includes('application/json')) {
        const errorInfo = await response.json();
        errorData = errorInfo.message || errorInfo.error || JSON.stringify(errorData);
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorData = errorText;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }
    throw new Error(errorData);
  }
  return response;
};

export const getReviews = async (filters: ReviewFilters = {}): Promise<PaginatedReviewsResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
  if (filters.maxRating) queryParams.append('maxRating', filters.maxRating.toString());
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const queryString = queryParams.toString();
  const urlWithParams = queryString ? `${url}/review?${queryString}` : `${url}/review`;

  const response = await fetch(urlWithParams, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getReviewStats = async (): Promise<ReviewStats> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review/stats`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getUserReviews = async (userId: number, filters: ReviewFilters = {}): Promise<PaginatedReviewsResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
  if (filters.maxRating) queryParams.append('maxRating', filters.maxRating.toString());
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const queryString = queryParams.toString();
  const urlWithParams = queryString ? `${url}/review/user/${userId}?${queryString}` : `${url}/review/user/${userId}`;

  const response = await fetch(urlWithParams, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDriverReviews = async (driverId: number, filters: ReviewFilters = {}): Promise<PaginatedReviewsResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
  if (filters.maxRating) queryParams.append('maxRating', filters.maxRating.toString());
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const queryString = queryParams.toString();
  const urlWithParams = queryString ? `${url}/review/driver/${driverId}?${queryString}` : `${url}/review/driver/${driverId}`;

  const response = await fetch(urlWithParams, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getReview = async (id: number): Promise<Review> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateReview = async (data: UpdateReviewData): Promise<Review> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review/${data.review_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  await handleApiResponse(response);
  return response.json();
};

export const deleteReview = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid review ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
