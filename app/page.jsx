// app/page.jsx
'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router=useRouter()
  useEffect(()=>{
      router.push('/login')
  },[])
  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome</h1>
      
    </main>
  )
}
