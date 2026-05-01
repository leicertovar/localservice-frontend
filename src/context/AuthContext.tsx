import { createContext, useContext, useState, useEffect } from 'react'
import { isAuthenticated } from '@/services/authService'

interface AuthCtx {
  isLoggedIn: boolean
  setLoggedIn: (v: boolean) => void
}

const AuthContext = createContext<AuthCtx>({
  isLoggedIn: false,
  setLoggedIn: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setLoggedIn] = useState(isAuthenticated())

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)