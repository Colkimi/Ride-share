import { API_BASE_URL } from './apiUtils'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

export const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  
  refreshPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data: TokenResponse = await response.json()
      
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      resolve(data.accessToken)
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
            window.location.href = '/login'
      
      reject(error)
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })

  return refreshPromise
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
        return payload.exp < (currentTime + 300)
  } catch {
    return true
  }
}

export const authenticatedFetchWithRefresh = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = localStorage.getItem('accessToken')
  
  if (!accessToken || isTokenExpired(accessToken)) {
    try {
      accessToken = await refreshAccessToken()
    } catch (error) {
      throw new Error('Authentication failed')
    }
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401 && !isRefreshing) {
    try {
      accessToken = await refreshAccessToken()
      
      // Retry the request with new token
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      return fetch(url, {
        ...options,
        headers: retryHeaders,
      })
    } catch (error) {
      throw new Error('Authentication failed')
    }
  }

  return response
}

export const setupTokenRefreshInterval = () => {
  const checkAndRefreshToken = async () => {
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken && isTokenExpired(accessToken)) {
      try {
        await refreshAccessToken()
        console.log('Token refreshed automatically')
      } catch (error) {
        console.error('Failed to refresh token:', error)
      }
    }
  }

  const intervalId = setInterval(checkAndRefreshToken, 4 * 60 * 1000)
  
  checkAndRefreshToken()
  
  return intervalId
}
