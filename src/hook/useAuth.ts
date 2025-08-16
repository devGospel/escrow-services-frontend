import { useState, useEffect } from 'react';
import { BASEURL } from '@/constants/api';

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  role: 'buyer' | 'seller';
  business_verification?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    _id: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    business_verification?: string;
  };
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          setIsLoading(true);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Failed to parse user data', e);
          clearAuth();
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const register = async (data: RegisterData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${BASEURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        return result;
      } else {
        setError(result.message || 'Registration failed');
        return null;
      }
    } catch (err) {
      setError('Failed to connect to the server');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${BASEURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
        setSuccess('Login successful! Redirecting to dashboard...');
        return result;
      } else {
        setError(result.message || 'Login failed');
        return null;
      }
    } catch (err) {
      setError('Failed to connect to the server');
      return null;
    } finally {
      setIsLoading(false);
    }
  };


  

  const refreshToken = async (storedRefreshToken: string): Promise<AuthResponse | null> => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${BASEURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken })
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      } else {
        setError(result.message || 'Token refresh failed');
        clearAuth();
        return null;
      }
    } catch (err) {
      setError('Failed to connect to the server');
      clearAuth();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setSuccess('Logged out successfully!');
  };

 const getCurrentUser = async (): Promise<AuthResponse['user'] | null> => {
  const accessToken = localStorage.getItem('access_token');
  console.log('[getCurrentUser] Access token from storage:', accessToken ? 'exists' : 'missing');
  
  if (!accessToken) {
    console.warn('[getCurrentUser] No access token found - clearing auth');
    clearAuth();
    return null;
  }

  try {
    setIsLoading(true);
    
    // Debug token contents
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('[getCurrentUser] Token payload:', {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          issuedAt: new Date(payload.iat * 1000),
          expiresAt: new Date(payload.exp * 1000),
          now: new Date(),
          isValid: Date.now() < payload.exp * 1000
        });
      }
    } catch (e) {
      console.error('[getCurrentUser] Error parsing token:', e);
    }

    // Verify request
    console.log('[getCurrentUser] Sending verify request to:', `${BASEURL}/auth/verify`);
    const verifyResponse = await fetch(`${BASEURL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include' // Important for cookies if using them
    });

    console.log('[getCurrentUser] Verify response status:', verifyResponse.status);
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      console.error('[getCurrentUser] Verify failed:', {
        status: verifyResponse.status,
        statusText: verifyResponse.statusText,
        error: errorData
      });

      // Try refreshing token if 401
      if (verifyResponse.status === 401) {
        console.log('[getCurrentUser] Attempting token refresh...');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (storedRefreshToken) {
          try {
            const refreshResult = await refreshToken(storedRefreshToken);
            if (refreshResult) {
              console.log('[getCurrentUser] Token refresh successful');
              return refreshResult.user;
            }
          } catch (refreshError) {
            console.error('[getCurrentUser] Refresh token failed:', refreshError);
          }
        } else {
          console.warn('[getCurrentUser] No refresh token available');
        }
      }

      clearAuth();
      return null;
    }

    const result = await verifyResponse.json();
    console.log('[getCurrentUser] Verify success:', result);
    
    if (!result.user) {
      console.warn('[getCurrentUser] No user data in verify response');
      throw new Error('No user data received');
    }

    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    setIsAuthenticated(true);
    return result.user;
    
  } catch (err) {
    console.error('[getCurrentUser] Error:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error'
    });
    clearAuth();
    return null;
  } finally {
    setIsLoading(false);
  }
};
  return { 
    register, 
    login, 
    refreshToken, 
    logout, 
    getCurrentUser, 
    isLoading, 
    error, 
    success, 
    user,
    isAuthenticated
  };
}