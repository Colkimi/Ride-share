export const API_BASE_URL = 'http://localhost:8000';

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData = `Error: ${response.status} ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorInfo = await response.json();
        errorData = errorInfo.message || errorInfo.error || JSON.stringify(errorInfo);
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

export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  return handleApiResponse(response);
};

export { authenticatedFetchWithRefresh } from './tokenRefresh';

export const callChatbotAPI = async (userId: number, message: string, contextMessages: any[] = []) => {
  const url = `${API_BASE_URL}/chatbot`; 
  const body = JSON.stringify({
    userId,
    message,
    contextMessages: contextMessages.length > 0 ? contextMessages : undefined,
  });
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body,
  });
  const data = await response.json();
  return data;
};
