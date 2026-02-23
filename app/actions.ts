'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// HELPER: AUTO-CALCULATE HEADER
// ==========================================
async function recalculateParent(supabase: any, parentId: string | null, projectId: string) {
  if (!parentId) return

  // 1. Fetch all children of this parent
  const { data: children } = await supabase
    .from('gantt_tasks')
    .select('start_date, end_date, progress')
    .eq('parent_id', parentId)

  if (!children || children.length === 0) return

  // 2. Calculate Min Start and Max End
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

  // 3. Calculate Average Progress
  const avgProgress = Math.round(totalProgress / children.length)

  // 4. Update the Parent Header
  await supabase.from('gantt_tasks').update({
    start_date: new Date(minStart).toISOString(),
    end_date: new Date(maxEnd).toISOString(),
    progress: avgProgress
  }).eq('id', parentId)

  // 5. Revalidate
  revalidatePath(`/projects/${projectId}/gantt`)
}

// ==========================================
// 1. AUTH & PROJECT MANAGEMENT
// ==========================================

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) { redirect('/login') }

  const name = formData.get('name') as string
  const model = formData.get('model') as string
  const part_name = formData.get('part_name') as string
  const part_number = formData.get('part_number') as string
  const product_type = formData.get('category') as string
  const customer = formData.get('customer') as string

  const { error } = await supabase.from('projects').insert({
    name, model, part_name, part_number, product_type, customer,
    owner_id: user.id, status: 'draft'
  })

  if (error) { console.error('Error creating project:', error); return; }
  revalidatePath('/')
}

export async function updateProjectDetails(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string
  
  // Extract all fields
  const data: any = {}
  formData.forEach((value, key) => {
    if (key !== 'project_id') data[key] = value === '' ? null : value
  })

  const { error } = await supabase.from('projects').update(data).eq('id', projectId)
  if (error) console.error('Error updating project details:', error)

  revalidatePath(`/projects/${projectId}`)
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
  const projectId = formData.get('project_id') as string
  
  const data: any = {}
  formData.forEach((value, key) => { if(key !== 'project_id') data[key] = value === '' ? null : value })
  
  // Integers
  ['severity','occurrence','detection','act_severity','act_occurrence','act_detection'].forEach(k => {
     if(data[k]) data[k] = parseInt(data[k])
  })

  await supabase.from('pfmea_records').insert(data)
  revalidatePath(`/projects/${projectId}/fmea`)
}

export async function updateFmeaRow(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('row_id') as string
  const projectId = formData.get('project_id') as string
  
  const data: any = {}
  formData.forEach((value, key) => { if(key !== 'row_id' && key !== 'project_id') data[key] = value === '' ? null : value })

  // Integers
  ['severity','occurrence','detection','act_severity','act_occurrence','act_detection'].forEach(k => {
     if(data[k]) data[k] = parseInt(data[k])
  })

  await supabase.from('pfmea_records').update(data).eq('id', id)
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
// 5. GANTT CHART ACTIONS (WITH AUTO-CALC)
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

  // Recalculate Parent if added to a group
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

  // Recalculate Parent if it has one
  if (parentId && parentId !== 'none') {
    await recalculateParent(supabase, parentId, projectId)
  }

  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function deleteGanttTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('task_id') as string
  const projectId = formData.get('project_id') as string

  // Get task info before delete to know parent
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