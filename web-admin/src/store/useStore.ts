import { create } from 'zustand'
import { AdminUser } from '@/types'

interface UIState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

interface AuthState {
  user: AdminUser | null
  setUser: (user: AdminUser | null) => void
  logout: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}))

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initialized as null, will be set on session load
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
