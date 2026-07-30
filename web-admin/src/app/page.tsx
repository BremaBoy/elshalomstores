'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hasAuthToken =
      Boolean(window.location.hash) ||
      window.location.search.includes('code=') ||
      window.location.search.includes('type=recovery') ||
      window.location.search.includes('error=')

    // Supabase can fall back to the configured Site URL when a redirect URL is
    // not allow-listed. Preserve the recovery parameters and finish the flow
    // on the reset-password page instead of leaving the user on a blank page.
    if (hasAuthToken) {
      window.location.replace(
        `/reset-password${window.location.search}${window.location.hash}`
      )
      return
    }

    router.replace('/login')
  }, [router])

  return null
}
