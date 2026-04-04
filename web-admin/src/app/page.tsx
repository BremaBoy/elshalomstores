'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // If there is no hash (which would contain the access token for resets), redirect to login
    if (!window.location.hash) {
      router.replace('/login')
    }
  }, [router])

  return null
}
