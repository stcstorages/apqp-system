'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// HELPER: AUTO-CALCULATE PARENT (GANTT)
// ==========================================
async function recalculateParent(supabase: any, parentId: string | null, projectId: string) {
  if (!parentId || parentId === 'none') return

  const { data: children } = await supabase
    .from('gantt_tasks')
    .select('start_date, end_date, progress')
    .eq('parent_id', parentId)

  if (!children || children.length === 0) return

  let minStart = new Date(children[0].start_date).getTime()
  let maxEnd = new Date(children[0].end_date).getTime()
  let totalProgress = 0

  children.forEach((child: any) => {
    const s = new Date(child.start_date).getTime()
    const e = new Date(child.end_date).getTime()
    if (s < minStart) minStart = s
    if (e > maxEnd) maxEnd = e
    totalProgress += (child.progress || 0)
  })

  const avgProgress = Math.round(totalProgress / children.length)

  await supabase.from('gantt_tasks').update({
    start_date: new Date(minStart).toISOString(),
    end_date: new Date(maxEnd).toISOString(),
    progress: avgProgress
  }).eq('id', parentId)

  revalidatePath(`/projects/${projectId}/gantt`)
}

// ==========================================
// 1. AUTH & PROJECT MANAGEMENT
// ==========================================

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) { return { error: "User not logged in" } }

  const name = formData.get('name') as string
  const model = formData.get('model') as string
  const part_name = formData.get('part_name') as string
  const part_number = formData.get('part_number') as string
  const product_type = formData.get('category') as string 
  const customer = formData.get('customer') as string
  
  const is_template_creation = formData.get('is_template_creation') === 'true'
  let source_id = formData.get('copy_from_id') as string

  // Insert Project
  const { data: newProject, error: projError } = await supabase.from('projects').insert({
    name,
    model,
    part_name,
    part_number,
    product_type,
    customer,
    owner_id: user.id,
    status: is_template_creation ? 'template' : 'draft',
    is_template: is_template_creation
  }).select().single()

  // FIX: Handle potential null error safely
  if (projError || !newProject) { 
    console.error('Error creating project:', projError)
    return { error: projError?.message || 'Failed to create project data' }
  }

  // Template Copying Logic
  if (!is_template_creation && (!source_id || source_id === 'none')) {
    const { data: custTemplate } = await supabase.from('projects').select('id')
      .eq('is_template', true).eq('customer', customer).eq('product_type', product_type).single()
    
    if (custTemplate) source_id = custTemplate.id
    else {
      const { data: sibTemplate } = await supabase.from('projects').select('id')
        .eq('is_template', true).eq('customer', 'SIB').eq('product_type', product_type).single()
      if (sibTemplate) source_id = sibTemplate.id
    }
  }

  // Deep Copy Data
  if (source_id && source_id !== 'none') {
    const { data: sourceSteps } = await supabase
      .from('process_steps')
      .select(`*, pfmea_records (*, control_plan_records (*))`)
      .eq('project_id', source_id)
      .order('step_number', { ascending: true })

    if (sourceSteps) {
      for (const step of sourceSteps) {
        const { data: newStep } = await supabase.from('process_steps').insert({
          project_id: newProject.id,
          step_number: step.step_number,
          description: step.description,
          symbol_type: step.symbol_type,
          special_char_id: step.special_char_id,
          remarks: step.remarks,
          machine_tools: step.machine_tools
        }).select().single()

        if (!newStep) continue;

        for (const risk of step.pfmea_records) {
          const { data: newRisk } = await supabase.from('pfmea_records').insert({
            step_id: newStep.id,
            failure_mode: risk.failure_mode,
            failure_effect: risk.failure_effect,
            severity: risk.severity,
            special_char_id: risk.special_char_id,
            cause: risk.cause,
            control_prevention: risk.control_prevention,
            occurrence: risk.occurrence,
            current_controls: risk.current_controls,
            detection: risk.detection,
            recommended_actions: risk.recommended_actions, 
            responsibility: risk.responsibility 
          }).select().single()

          if (!newRisk) continue;

          for (const cp of risk.control_plan_records) {
             await supabase.from('control_plan_records').insert({
               pfmea_id: newRisk.id,
               characteristic_product: cp.characteristic_product,
               characteristic_process: cp.characteristic_process,
               specification_tolerance: cp.specification_tolerance,
               eval_measurement_technique: cp.eval_measurement_technique,
               sample_size: cp.sample_size,
               sample_freq: cp.sample_freq,
               control_method: cp.control_method,
               reaction_plan: cp.reaction_plan,
               reaction_owner: cp.reaction_owner
             })
          }
        }
      }
    }
  }

  if (newProject) {
    revalidatePath('/')
    if (!is_template_creation) return { success: true, newProjectId: newProject.id }
    else return { success: true }
  }
}

export async function addCustomer(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('new_customer_name') as string

  if (!name) return { error: "Name is empty" }

  const { error } = await supabase.from('customers').insert({ name })

  if (error) {
    console.error('Error adding customer:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateProjectDetails(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  const updates: any = {}
  formData.forEach((value, key) => { 
      if(key !== 'project_id' && !key.startsWith('$')) updates[key] = value === '' ? null : value 
  })

  const { error } = await supabase.from('projects').update(updates).eq('id', projectId)
  if (error) console.error('Error updating details:', error)

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/fmea`)
  revalidatePath(`/projects/${projectId}/control-plan`)
  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  
  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
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
  
  const data: any = { project_id: projectId }
  formData.forEach((value, key) => { if(key !== 'project_id') data[key] = value })

  const { error } = await supabase.from('process_steps').insert(data)
  if (error) { console.error('Error adding step:', error); return; }

  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function updateProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  const data: any = {}
  formData.forEach((value, key) => { if(key !== 'step_id' && key !== 'project_id') data[key] = value })

  await supabase.from('process_steps').update(data).eq('id', id)
  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/control-plan`)
}

export async function deleteProcessStep(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  await supabase.from('process_steps').delete().eq('id', id)
  revalidatePath(`/projects/${projectId}/process-flow`)
}

// ==========================================
// 3. FMEA ACTIONS
// ==========================================

export async function addFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const stepId = formData.get('step_id') as string
  const projectId = formData.get('project_id') as string
  
  // Explicit Extraction
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

  await supabase.from('pfmea_records').insert({
    step_id: stepId,
    failure_mode, failure_effect, severity, special_char_id: specialCharId,
    cause, control_prevention, occurrence, current_controls, detection,
    recommended_actions, responsibility, action_taken,
    act_severity, act_occurrence, act_detection
  })

  revalidatePath(`/projects/${projectId}/fmea`)
}

export async function updateFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string
  
  // Explicit Extraction
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

  await supabase.from('pfmea_records').update({
    failure_mode, failure_effect, severity, special_char_id: specialCharId,
    cause, control_prevention, occurrence, current_controls, detection,
    recommended_actions, responsibility, action_taken,
    act_severity, act_occurrence, act_detection
  }).eq('id', id)

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
  const data: any = {}
  formData.forEach((value, key) => { if(key !== 'project_id') data[key] = value })
  await supabase.from('control_plan_records').insert(data)
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
  const type = formData.get('type') as string
  const parentId = formData.get('parent_id') as string

  let start = formData.get('start_date') as string
  let end = formData.get('end_date') as string

  if (type === 'project' && (!start || !end)) {
    const today = new Date().toISOString()
    start = today
    end = today
  }

  const { data: maxOrder } = await supabase
    .from('gantt_tasks')
    .select('order_index')
    .eq('project_id', projectId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.order_index || 0) + 1

  await supabase.from('gantt_tasks').insert({
    project_id: projectId,
    name,
    start_date: new Date(start).toISOString(),
    end_date: new Date(end).toISOString(),
    progress: 0,
    type: type || 'task',
    parent_id: parentId === 'none' ? null : parentId,
    order_index: nextOrder
  })

  if (parentId && parentId !== 'none') {
    await recalculateParent(supabase, parentId, projectId)
  }

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
  const type = formData.get('type') as string
  const parentId = formData.get('parent_id') as string

  await supabase.from('gantt_tasks').update({
    name,
    start_date: new Date(start).toISOString(),
    end_date: new Date(end).toISOString(),
    progress: parseInt(progress),
    type: type,
    parent_id: parentId === 'none' ? null : parentId
  }).eq('id', id)

  // Recalculate Parent
  if (parentId && parentId !== 'none') {
    await recalculateParent(supabase, parentId, projectId)
  }

  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function deleteGanttTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('task_id') as string
  const projectId = formData.get('project_id') as string

  const { data: task } = await supabase.from('gantt_tasks').select('parent_id').eq('id', id).single()

  await supabase.from('gantt_tasks').delete().eq('id', id)
  
  if (task?.parent_id) {
    await recalculateParent(supabase, task.parent_id, projectId)
  }

  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function reorderGanttTasks(items: { id: string; order_index: number }[]) {
  const supabase = await createClient()
  for (const item of items) {
    await supabase.from('gantt_tasks').update({ order_index: item.order_index }).eq('id', item.id)
  }
}

export async function moveGanttTask(formData: FormData) {
  const supabase = await createClient()
  const taskId = formData.get('task_id') as string
  const direction = formData.get('direction') as string
  const projectId = formData.get('project_id') as string

  const { data: allTasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (!allTasks) return

  const currentIndex = allTasks.findIndex(t => t.id === taskId)
  if (currentIndex === -1) return

  const movingTask = allTasks[currentIndex]
  let movingBlockIds = [movingTask.id]
  
  if (movingTask.type === 'project') {
    for (let i = currentIndex + 1; i < allTasks.length; i++) {
      if (allTasks[i].parent_id === movingTask.id) {
        movingBlockIds.push(allTasks[i].id)
      } else {
        break 
      }
    }
  }

  let swapTargetIndex = -1

  if (direction === 'up') {
    if (currentIndex > 0) {
      swapTargetIndex = currentIndex - 1
      const prevTask = allTasks[currentIndex - 1]
      if (prevTask.parent_id && prevTask.parent_id !== movingTask.id) {
         const parentIndex = allTasks.findIndex(t => t.id === prevTask.parent_id)
         if (parentIndex !== -1) swapTargetIndex = parentIndex
      }
    }
  } else {
    const lastMyChildIndex = currentIndex + movingBlockIds.length - 1
    if (lastMyChildIndex < allTasks.length - 1) {
      swapTargetIndex = lastMyChildIndex + 1
      const targetTask = allTasks[swapTargetIndex]
      if (targetTask.type === 'project') {
         let endTargetBlock = swapTargetIndex
         for (let i = swapTargetIndex + 1; i < allTasks.length; i++) {
            if (allTasks[i].parent_id === targetTask.id) endTargetBlock = i
            else break
         }
         swapTargetIndex = endTargetBlock
      }
    }
  }

  if (swapTargetIndex !== -1) {
    const newOrder = [...allTasks]
    const block = newOrder.splice(currentIndex, movingBlockIds.length)
    
    let insertPos = swapTargetIndex
    if (direction === 'down') {
       if (swapTargetIndex > currentIndex) insertPos = swapTargetIndex - movingBlockIds.length + 1
    }

    newOrder.splice(insertPos, 0, ...block)

    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('gantt_tasks').update({ order_index: i }).eq('id', newOrder[i].id)
    }
  }

  revalidatePath(`/projects/${projectId}/gantt`)
}