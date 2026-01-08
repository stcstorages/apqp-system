'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// 1. AUTH & PROJECT MANAGEMENT
// ==========================================

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) { redirect('/login') }

  const name = formData.get('name') as string
  const part_number = formData.get('part_number') as string
  const customer = formData.get('customer') as string

  const { error } = await supabase.from('projects').insert({
    name,
    part_number,
    customer,
    owner_id: user.id,
    status: 'draft'
  })

  if (error) { console.error('Error creating project:', error); return; }

  revalidatePath('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ==========================================
// 2. PROCESS FLOW ACTIONS
// ==========================================

export async function addProcessStep(formData: FormData) {
  const supabase = await createClient()
  
  const projectId = formData.get('project_id') as string
  const stepNumber = formData.get('step_number') as string
  const description = formData.get('description') as string
  const symbolType = formData.get('symbol_type') as string
  
  const remarks = formData.get('remarks') as string
  const specialCharId = formData.get('special_char_id') as string || null
  const machineTools = formData.get('machine_tools') as string || null // AIAG Update

  const { error } = await supabase.from('process_steps').insert({
    project_id: projectId,
    step_number: stepNumber,
    description: description,
    symbol_type: symbolType,
    remarks: remarks,
    special_char_id: specialCharId,
    machine_tools: machineTools
  })

  if (error) { console.error('Error adding step:', error); return; }

  // Revalidate both Flow and Control Plan as they share data
  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function updateProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  
  const number = formData.get('step_number') as string
  const desc = formData.get('description') as string
  const symbolType = formData.get('symbol_type') as string
  const remarks = formData.get('remarks') as string
  const specialCharId = formData.get('special_char_id') as string || null
  const machineTools = formData.get('machine_tools') as string || null // AIAG Update

  const { error } = await supabase.from('process_steps').update({
    step_number: number,
    description: desc,
    symbol_type: symbolType,
    remarks: remarks,
    special_char_id: specialCharId,
    machine_tools: machineTools
  }).eq('id', id)

  if (error) console.error('Error updating step:', error)

  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function deleteProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string

  const { error } = await supabase.from('process_steps').delete().eq('id', id)
  
  if (error) console.error('Error deleting step:', error)

  revalidatePath(`/projects/${projectId}/process-flow`)
}

// ==========================================
// 3. FMEA ACTIONS
// ==========================================

export async function addFmeaRow(formData: FormData) {
  const supabase = await createClient()
  
  const stepId = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  
  // Basic Info
  const failure_mode = formData.get('failure_mode') as string
  const failure_effect = formData.get('failure_effect') as string
  const severity = parseInt(formData.get('severity') as string) || 0
  const specialCharId = formData.get('special_char_id') as string || null
  const cause = formData.get('cause') as string
  
  // Prevention & Detection
  const control_prevention = formData.get('control_prevention') as string
  const occurrence = parseInt(formData.get('occurrence') as string) || 0
  const current_controls = formData.get('current_controls') as string // Detection Control
  const detection = parseInt(formData.get('detection') as string) || 0
  
  // Actions & Results
  const recommended_actions = formData.get('recommended_actions') as string
  const responsibility = formData.get('responsibility') as string
  const action_taken = formData.get('action_taken') as string
  const act_severity = parseInt(formData.get('act_severity') as string) || null
  const act_occurrence = parseInt(formData.get('act_occurrence') as string) || null
  const act_detection = parseInt(formData.get('act_detection') as string) || null

  const { error } = await supabase.from('pfmea_records').insert({
    step_id: stepId,
    failure_mode,
    failure_effect,
    severity,
    special_char_id: specialCharId,
    cause,
    control_prevention,
    occurrence,
    current_controls,
    detection,
    recommended_actions,
    responsibility,
    action_taken,
    act_severity,
    act_occurrence,
    act_detection
  })

  if (error) { console.error('Error adding FMEA row:', error); return; }

  revalidatePath(`/projects/${projectId}/fmea`)
}

export async function updateFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string
  
  const failure_mode = formData.get('failure_mode') as string
  const failure_effect = formData.get('failure_effect') as string
  const severity = parseInt(formData.get('severity') as string) || 0
  const specialCharId = formData.get('special_char_id') as string || null
  const cause = formData.get('cause') as string
  const control_prevention = formData.get('control_prevention') as string
  const occurrence = parseInt(formData.get('occurrence') as string) || 0
  const current_controls = formData.get('current_controls') as string
  const detection = parseInt(formData.get('detection') as string) || 0
  const recommended_actions = formData.get('recommended_actions') as string
  const responsibility = formData.get('responsibility') as string
  const action_taken = formData.get('action_taken') as string
  const act_severity = parseInt(formData.get('act_severity') as string) || null
  const act_occurrence = parseInt(formData.get('act_occurrence') as string) || null
  const act_detection = parseInt(formData.get('act_detection') as string) || null

  const { error } = await supabase.from('pfmea_records').update({
    failure_mode,
    failure_effect,
    severity,
    special_char_id: specialCharId,
    cause,
    control_prevention,
    occurrence,
    current_controls,
    detection,
    recommended_actions,
    responsibility,
    action_taken,
    act_severity,
    act_occurrence,
    act_detection
  }).eq('id', id)

  if (error) console.error('Error updating FMEA row:', error)

  revalidatePath(`/projects/${projectId}/fmea`)
}

export async function deleteFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const rowId = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string

  await supabase.from('pfmea_records').delete().eq('id', rowId)
  revalidatePath(`/projects/${projectId}/fmea`)
}

// ==========================================
// 4. CONTROL PLAN ACTIONS
// ==========================================

export async function addControlPlanRow(formData: FormData) {
  const supabase = await createClient()
  
  const pfmeaId = formData.get('pfmea_id') as string
  const projectId = formData.get('project_id') as string
  
  const char_product = formData.get('characteristic_product') as string
  const char_process = formData.get('characteristic_process') as string
  const spec = formData.get('specification_tolerance') as string
  const eval_method = formData.get('eval_measurement_technique') as string
  const sample_size = formData.get('sample_size') as string
  const sample_freq = formData.get('sample_freq') as string
  const control_method = formData.get('control_method') as string
  const reaction_plan = formData.get('reaction_plan') as string
  const reaction_owner = formData.get('reaction_owner') as string // AIAG Update

  const { error } = await supabase.from('control_plan_records').insert({
    pfmea_id: pfmeaId,
    characteristic_product: char_product,
    characteristic_process: char_process,
    specification_tolerance: spec,
    eval_measurement_technique: eval_method,
    sample_size,
    sample_freq,
    control_method,
    reaction_plan,
    reaction_owner // AIAG Update
  })

  if (error) { console.error('Error adding CP row:', error); return; }

  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function deleteControlPlanRow(formData: FormData) {
  const supabase = await createClient()
  const rowId = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string

  await supabase.from('control_plan_records').delete().eq('id', rowId)
  revalidatePath(`/projects/${projectId}/control-plan`)
}

// ==========================================
// 5. GANTT CHART ACTIONS
// ==========================================

export async function addGanttTask(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  const name = formData.get('name') as string
  const start = formData.get('start_date') as string
  const end = formData.get('end_date') as string

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

export async function updateGanttTaskDetails(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('task_id') as string
  const projectId = formData.get('project_id') as string
  
  const name = formData.get('name') as string
  const start = formData.get('start_date') as string
  const end = formData.get('end_date') as string
  const progress = formData.get('progress') as string

  const { error } = await supabase.from('gantt_tasks').update({
    name,
    start_date: new Date(start).toISOString(),
    end_date: new Date(end).toISOString(),
    progress: parseInt(progress)
  }).eq('id', id)

  if (error) console.error('Error updating task:', error)

  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function deleteGanttTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('task_id') as string
  const projectId = formData.get('project_id') as string

  const { error } = await supabase.from('gantt_tasks').delete().eq('id', id)
  
  if (error) console.error('Error deleting task:', error)

  revalidatePath(`/projects/${projectId}/gantt`)
}
