'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const part_number = formData.get('part_number') as string
  const customer = formData.get('customer') as string

  // Insert into Supabase
  const { error } = await supabase.from('projects').insert({
    name,
    part_number,
    customer,
    owner_id: user.id,
    status: 'draft'
  })

  if (error) {
    console.error('Error creating project:', error)
    return // Just return nothing on error
  }

  revalidatePath('/')
  // Return nothing on success
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
// ... existing imports and functions ...

export async function addProcessStep(formData: FormData) {
  const supabase = await createClient()
  
  const projectId = formData.get('project_id') as string
  const stepNumber = formData.get('step_number') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('process_steps').insert({
    project_id: projectId,
    step_number: stepNumber,
    description: description
  })

  if (error) {
    console.error('Error adding step:', error)
    return
  }

  revalidatePath(`/projects/${projectId}`)
}
