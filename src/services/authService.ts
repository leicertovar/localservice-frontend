import api from '@/lib/api'

// Tipos que devuelve el backend
export interface AuthResponse {
  access_token: string
  token_type: string
  message?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const login = async (
  email: string, password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(
    '/auth/login', { email, password }
  )
  localStorage.setItem('access_token', data.access_token)
  return data
}

export const register = async (
  payload: RegisterData
): Promise<AuthResponse> => {
  // El backend usa "registrer" (nota el typo)
  const { data } = await api.post<AuthResponse>(
    '/auth/registrer', payload
  )
  localStorage.setItem('access_token', data.access_token)
  return data
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } finally {
    localStorage.removeItem('access_token')
  }
}

export const isAuthenticated = () =>
  Boolean(localStorage.getItem('access_token'))