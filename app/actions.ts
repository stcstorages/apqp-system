'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // Get current userR
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

  revalidatePath(`/projects/${projectId}/process-flow`)
}
// ... existing imports

export async function addFmeaRow(formData: FormData) {
  const supabase = await createClient()
  
  const stepId = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string // Needed for revalidation
  
  // Extract FMEA Dataa
  const failure_mode = formData.get('failure_mode') as string
  const failure_effect = formData.get('failure_effect') as string
  const severity = parseInt(formData.get('severity') as string)
  const cause = formData.get('cause') as string
  const occurrence = parseInt(formData.get('occurrence') as string)
  const current_controls = formData.get('current_controls') as string
  const detection = parseInt(formData.get('detection') as string)

  const { error } = await supabase.from('pfmea_records').insert({
    step_id: stepId,
    failure_mode,
    failure_effect,
    severity,
    cause,
    occurrence,
    current_controls,
    detection
  })

  if (error) {
    console.error('Error adding FMEA row:', error)
    return
  }

  revalidatePath(`/projects/${projectId}/fmea`)
}

export async function deleteFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const rowId = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string

  await supabase.from('pfmea_records').delete().eq('id', rowId)
  revalidatePath(`/projects/${projectId}/fmea`)
}
// ... existing imports

export async function addControlPlanRow(formData: FormData) {
  const supabase = await createClient()
  
  const pfmeaId = formData.get('pfmea_id') as string
  const projectId = formData.get('project_id') as string
  
  // Extract Control Plan Dataaa
  const char_product = formData.get('characteristic_product') as string
  const char_process = formData.get('characteristic_process') as string
  const spec = formData.get('specification_tolerance') as string
  const eval_method = formData.get('eval_measurement_technique') as string
  const sample_size = formData.get('sample_size') as string
  const sample_freq = formData.get('sample_freq') as string
  const control_method = formData.get('control_method') as string
  const reaction_plan = formData.get('reaction_plan') as string

  const { error } = await supabase.from('control_plan_records').insert({
    pfmea_id: pfmeaId,
    characteristic_product: char_product,
    characteristic_process: char_process,
    specification_tolerance: spec,
    eval_measurement_technique: eval_method,
    sample_size,
    sample_freq,
    control_method,
    reaction_plan
  })

  if (error) {
    console.error('Error adding CP row:', error)
    return
  }

  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function deleteControlPlanRow(formData: FormData) {
  const supabase = await createClient()
  const rowId = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string

  await supabase.from('control_plan_records').delete().eq('id', rowId)
  revalidatePath(`/projects/${projectId}/control-plan`)
}
// ... existing imports

export async function addGanttTask(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  const name = formData.get('name') as string
  const start = formData.get('start_date') as string
  const end = formData.get('end_date') as string

  // Default new tasks to 0% progressss
  await supabase.from('gantt_tasks').insert({
    project_id: projectId,
    name,
    start_date: new Date(start).toISOString(),
    end_date: new Date(end).toISOString(),
    progress: 0,
    type: 'task'
  })

  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function updateGanttTask(task: any) {
  // This function will be called via Client Component, so we just use the Supabase client directly there usually, 
  // but for security we should use a Server Action.
  const supabase = await createClient()
  
  await supabase.from('gantt_tasks').update({
    start_date: task.start,
    end_date: task.end,
    progress: task.progress
  }).eq('id', task.id)
  
  // Note: No revalidatePath needed here because the UI updates instantly on drag
}
// ... existing imports

export async function updateProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  const number = formData.get('step_number') as string
  const desc = formData.get('description') as string

  const { error } = await supabase.from('process_steps').update({
    step_number: number,
    description: desc
  }).eq('id', id)

  if (error) console.error('Error updating step:', error)

  revalidatePath(`/projects/${projectId}/process-flow`)
}

export async function deleteProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string

  const { error } = await supabase.from('process_steps').delete().eq('id', id)
  
  if (error) console.error('Error deleting step:', error)

  revalidatePath(`/projects/${projectId}/process-flow`)
}
