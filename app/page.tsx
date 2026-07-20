import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// 1. Isolate the cookie-reading logic into an async component
async function AuthRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/protected') 
  } else {
    redirect('/sign-in') 
  }
  return null
}

// 2. Wrap it in Suspense on the main page export
export default function Index() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
      <AuthRedirect />
    </Suspense>
  )
}