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

  // 1. Get Form Data
  const name = formData.get('name') as string
  const part_number = formData.get('part_number') as string || ''
  const customer = formData.get('customer') as string
  const product_type = formData.get('product_type') as string
  
  // Template Logic
  const is_template_creation = formData.get('is_template_creation') === 'true'
  let source_id = formData.get('copy_from_id') as string

  // 2. Insert Project
  const { data: newProject, error: projError } = await supabase.from('projects').insert({
    name,
    part_number,
    customer,
    product_type,
    owner_id: user.id,
    status: is_template_creation ? 'template' : 'draft',
    is_template: is_template_creation
  }).select().single()

  if (projError || !newProject) { 
    console.error('Error creating project:', projError); 
    return; 
  }

  // 3. Auto-Select Template if none selected
  if (!is_template_creation && (!source_id || source_id === 'none')) {
    const { data: custTemplate } = await supabase.from('projects').select('id')
      .eq('is_template', true).eq('customer', customer).eq('product_type', product_type).single()
    
    if (custTemplate) {
      source_id = custTemplate.id
    } else {
      const { data: sibTemplate } = await supabase.from('projects').select('id')
        .eq('is_template', true).eq('customer', 'SIB').eq('product_type', product_type).single()
      if (sibTemplate) source_id = sibTemplate.id
    }
  }

  // 4. Deep Copy Logic
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

  revalidatePath('/')
}

export async function updateProjectDetails(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  // Basic Info
  const name = formData.get('name') as string
  const part_number = formData.get('part_number') as string
  const customer = formData.get('customer') as string
  const model = formData.get('model') as string
  const drawing_number = formData.get('drawing_number') as string

  // Doc Control
  const cp_number = formData.get('cp_number') as string
  const key_contact = formData.get('key_contact') as string
  const core_team = formData.get('core_team') as string
  const cp_phase = formData.get('cp_phase') as string
  
  const flow_phase = formData.get('flow_phase') as string
  const flow_number = formData.get('flow_number') as string
  const flow_date_orig = formData.get('flow_date_orig') as string || null
  const flow_date_rev = formData.get('flow_date_rev') as string || null

  const pfmea_phase = formData.get('pfmea_phase') as string
  const pfmea_number = formData.get('pfmea_number') as string
  const pfmea_date_orig = formData.get('pfmea_date_orig') as string || null
  const pfmea_date_rev = formData.get('pfmea_date_rev') as string || null

  const cp_date_orig = formData.get('cp_date_orig') as string || null
  const cp_date_rev = formData.get('cp_date_rev') as string || null

  // Approvals
  const customer_eng_approval = formData.get('customer_eng_approval') as string || null
  const customer_quality_approval = formData.get('customer_quality_approval') as string || null
  const other_approval = formData.get('other_approval') as string || null

  const { error } = await supabase.from('projects').update({
    name, part_number, customer, model, drawing_number,
    cp_number, key_contact, core_team, cp_phase,
    flow_phase, flow_number, flow_date_orig, flow_date_rev,
    pfmea_phase, pfmea_number, pfmea_date_orig, pfmea_date_rev,
    cp_date_orig, cp_date_rev,
    customer_eng_approval, customer_quality_approval, other_approval
  }).eq('id', projectId)

  if (error) console.error('Error updating project details:', error)

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/fmea`)
  revalidatePath(`/projects/${projectId}/control-plan`)
  revalidatePath(`/projects/${projectId}/process-flow`)
  revalidatePath(`/projects/${projectId}/gantt`)
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
  const machineTools = formData.get('machine_tools') as string || null

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
  const machineTools = formData.get('machine_tools') as string || null

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
  const reaction_owner = formData.get('reaction_owner') as string

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
    reaction_owner
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
// 5. GANTT CHART ACTIONS (Enhanced)
// ==========================================

export async function addGanttTask(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  const name = formData.get('name') as string
  const start = formData.get('start_date') as string
  const end = formData.get('end_date') as string
  const type = formData.get('type') as string
  const parentId = formData.get('parent_id') as string

  // 1. Find Max Order
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

  const { error } = await supabase.from('gantt_tasks').update({
    name,
    start_date: new Date(start).toISOString(),
    end_date: new Date(end).toISOString(),
    progress: parseInt(progress),
    type: type,
    parent_id: parentId === 'none' ? null : parentId
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

// NEW: Bulk Reorder (Drag & Drop)
export async function reorderGanttTasks(items: { id: string; order_index: number }[]) {
  const supabase = await createClient()
  for (const item of items) {
    await supabase.from('gantt_tasks').update({ order_index: item.order_index }).eq('id', item.id)
  }
}

// NEW: Smart Move (Up/Down Buttons)
export async function moveGanttTask(formData: FormData) {
  const supabase = await createClient()
  const taskId = formData.get('task_id') as string
  const direction = formData.get('direction') as string
  const projectId = formData.get('project_id') as string

  // 1. Fetch ALL tasks to calculate logic in memory
  const { data: allTasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (!allTasks) return

  const currentIndex = allTasks.findIndex(t => t.id === taskId)
  if (currentIndex === -1) return

  const movingTask = allTasks[currentIndex]
  
  // 2. Identify the "Block" (Header + Children)
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

  // 3. Find Swap Target
  let swapTargetIndex = -1

  if (direction === 'up') {
    if (currentIndex > 0) {
      swapTargetIndex = currentIndex - 1
      // If moving UP into a block, jump to that block's parent?
      // For simplicity: Just swap with immediate row. 
      // If the row above is a child, this might break grouping visuals unless handled strictly.
      // Better logic: If row above is child, jump to its Parent.
      const prevTask = allTasks[currentIndex - 1]
      if (prevTask.parent_id && prevTask.parent_id !== movingTask.id) {
         const parentIndex = allTasks.findIndex(t => t.id === prevTask.parent_id)
         if (parentIndex !== -1) swapTargetIndex = parentIndex
      }
    }
  } else {
    // Moving Down: Jump over own block
    const lastMyChildIndex = currentIndex + movingBlockIds.length - 1
    if (lastMyChildIndex < allTasks.length - 1) {
      swapTargetIndex = lastMyChildIndex + 1
      
      // If target is a Header, we swap with IT + ITS CHILDREN?
      // Or just insert AFTER it? 
      // Let's insert AFTER the target (effectively swapping blocks).
      const targetTask = allTasks[swapTargetIndex]
      if (targetTask.type === 'project') {
         // Find end of target block
         let endTargetBlock = swapTargetIndex
         for (let i = swapTargetIndex + 1; i < allTasks.length; i++) {
            if (allTasks[i].parent_id === targetTask.id) endTargetBlock = i
            else break
         }
         swapTargetIndex = endTargetBlock // We want to jump past the whole group
      }
    }
  }

  if (swapTargetIndex !== -1) {
    // 4. Reconstruct Array
    const newOrder = [...allTasks]
    const block = newOrder.splice(currentIndex, movingBlockIds.length) // Remove my block
    
    // Adjust insert position because we removed items
    let insertPos = swapTargetIndex
    if (direction === 'down') {
       if (swapTargetIndex > currentIndex) insertPos = swapTargetIndex - movingBlockIds.length + 1
    }

    newOrder.splice(insertPos, 0, ...block)

    // 5. Save New Order
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('gantt_tasks').update({ order_index: i }).eq('id', newOrder[i].id)
    }
  }

  revalidatePath(`/projects/${projectId}/gantt`)
}