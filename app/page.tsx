import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Index() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, go to dashboard. If not, go to login.
  if (user) {
    redirect('/protected')
  } else {
    redirect('/sign-in') // Change to '/login' if that's what your template uses
  }
}