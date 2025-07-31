// apps/web/app/(dashboard)/auras/create-select/page.tsx

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateSelectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to digital-only version
    router.replace('/auras/create-select-digital')
  }, [router])

  return null
}