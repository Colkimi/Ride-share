export interface Review {
    review_id?: number,
    reviewer_id: number,
    reviewee_id: number,
    rating: number,
    comment: string,
    timestamp?: Date,
}

export type CreateReviewData = Omit<Review, 'review_id'>;
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

export const getReviews = async (): Promise<Review[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/review`, {
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
