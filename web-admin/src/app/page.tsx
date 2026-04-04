'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // If there is no hash or code/recovery param, redirect to login
    const hasAuthToken = window.location.hash || 
                        window.location.search.includes('code=') || 
                        window.location.search.includes('type=recovery')

    if (!hasAuthToken) {
      router.replace('/login')
    }
  }, [router])

  return null
}
