'use client'

import { useEffect, ReactNode } from 'react'
import { supabaseAuth } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'

export function AuthProvider({ children }: { children: ReactNode }) {
    const { setUser } = useAuthStore()

    useEffect(() => {
        const syncAdmin = async (authUser: { id: string; email?: string }) => {
            const { data: admin } = await supabaseAuth
                .from('admins')
                .select('name, role, status')
                .eq('id', authUser.id)
                .maybeSingle()

            if (!admin || admin.status !== 'active') {
                await supabaseAuth.auth.signOut()
                setUser(null)
                return
            }

            setUser({
                id: authUser.id,
                name: admin.name || 'Admin',
                email: authUser.email || '',
                role: admin.role as 'ADMIN' | 'SUPER_ADMIN',
                status: admin.status as 'active' | 'suspended',
            })
        }

        // Initial session check
        const initializeAuth = async () => {
            const { data: { session } } = await supabaseAuth.auth.getSession()
            if (session?.user) {
                await syncAdmin(session.user)
            }
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await syncAdmin(session.user)
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
