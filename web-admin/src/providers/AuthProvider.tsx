'use client'

import { useEffect, ReactNode } from 'react'
import { supabaseAuth } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'

export function AuthProvider({ children }: { children: ReactNode }) {
    const { setUser } = useAuthStore()

    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            const { data: { session } } = await supabaseAuth.auth.getSession()
            if (session?.user) {
                const user = session.user
                setUser({
                    id: user.id,
                    name: (user.user_metadata as any)?.name || 'Admin',
                    email: user.email!,
                    role: (user.user_metadata as any)?.role || 'ADMIN',
                    status: (user.user_metadata as any)?.status || 'active',
                })
            }
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = session.user
                setUser({
                    id: user.id,
                    name: (user.user_metadata as any)?.name || 'Admin',
                    email: user.email!,
                    role: (user.user_metadata as any)?.role || 'ADMIN',
                    status: (user.user_metadata as any)?.status || 'active',
                })
            } else {
                setUser(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [setUser])

    return <>{children}</>
}
