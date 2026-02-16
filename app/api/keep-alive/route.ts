import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. Connect to Supabase
  const supabase = await createClient()

  // 2. Run a tiny query (fetching 1 row from projects)
  // This tells Supabase "Hey, I am still active!"
  const { data, error } = await supabase.from('projects').select('id').limit(1)

  if (error) {
    return NextResponse.json({ status: 'Error', error: error.message }, { status: 500 })
  }

  // 3. Return success
  return NextResponse.json({ 
    status: 'Alive', 
    timestamp: new Date().toISOString(),
    message: 'Supabase heartbeat successful' 
  })
}