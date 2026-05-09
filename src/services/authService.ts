import api from '@/lib/api'

// Tipos que devuelve el backend
export interface UserProfile {
  name: string
  email: string
  phone: string
  city: string
  role?: string
  [key: string]: any
}

export interface AuthResponse {
  access_token: string
  token_type: string
  message?: string
  user?: UserProfile
}

export interface RegisterData {
  name: string
  last_name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  role?: string
}

const USER_PROFILE_KEY = 'user_profile'

export const setUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
}

export const getUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(USER_PROFILE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export const clearUserProfile = () => {
  localStorage.removeItem(USER_PROFILE_KEY)
}

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>('/auth/me')
  setUserProfile(data)
  return data
}

export const login = async (
  email: string, password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(
    '/auth/login', { email, password }
  )
  localStorage.setItem('access_token', data.access_token)
  const currentUser = await fetchCurrentUser()
  return {
    ...data,
    user: currentUser,
  }
}

export const register = async (
  payload: RegisterData
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>(
    '/auth/register', payload
  )
  localStorage.setItem('access_token', data.access_token)
  const currentUser = await fetchCurrentUser()
  return {
    ...data,
    user: currentUser,
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } finally {
    localStorage.removeItem('access_token')
    clearUserProfile()
  }
}

export const isAuthenticated = () =>
  Boolean(localStorage.getItem('access_token'))