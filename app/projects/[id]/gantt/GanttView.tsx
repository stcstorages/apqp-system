'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateGanttTaskDetails } from '@/app/actions' // Use Server Action now

type Props = {
  tasks: any[]
  projectId: string
}

export default function GanttView({ tasks: initialTasks, projectId }: Props) {
  const router = useRouter()
  
  const mapTasks = (data: any[]): Task[] => data.map(t => {
    let styles = { progressColor: '#2563eb', progressSelectedColor: '#1d4ed8', backgroundColor: '#3b82f6' }
    
    // Headers are visually distinct
    if (t.type === 'project') {
      styles = { progressColor: '#4b5563', progressSelectedColor: '#374151', backgroundColor: '#9ca3af' }
    } else if (t.type === 'milestone') {
      styles = { progressColor: '#d97706', progressSelectedColor: '#b45309', backgroundColor: '#f59e0b' }
    }

    return {
      start: new Date(t.start_date),
      end: new Date(t.end_date),
      name: t.name,
      id: t.id,
      type: t.type || 'task', 
      progress: t.progress,
      isDisabled: t.type === 'project', // DISABLE DRAGGING FOR HEADERS (They are auto-calculated)
      styles: styles,
    }
  })

  const [tasks, setTasks] = useState<Task[]>(mapTasks(initialTasks))

  useEffect(() => {
    setTasks(mapTasks(initialTasks))
  }, [initialTasks])

  const handleTaskChange = async (task: Task) => {
    // 1. Optimistic UI update
    let newTasks = tasks.map(t => (t.id === task.id ? task : t))
    setTasks(newTasks)

    // 2. Call Server Action to save + recalculate parents
    const formData = new FormData()
    formData.append('task_id', task.id)
    formData.append('project_id', projectId)
    formData.append('name', task.name)
    formData.append('start_date', task.start.toISOString())
    formData.append('end_date', task.end.toISOString())
    formData.append('progress', task.progress.toString())
    formData.append('type', task.type)
    
    // Find parent ID from original props if needed, or assume backend handles it if we don't send 'parent_id'
    // Actually, we must preserve the parent_id. 
    const originalTask = initialTasks.find(t => t.id === task.id)
    if (originalTask) formData.append('parent_id', originalTask.parent_id || 'none')

    await updateGanttTaskDetails(formData)
    
    router.refresh()
  }

  const handleProgressChange = async (task: Task) => {
    handleTaskChange(task)
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-hidden border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Visual Timeline</h3>
      {tasks.length > 0 ? (
        <Gantt
          tasks={tasks}
          viewMode={ViewMode.Day}
          onDateChange={handleTaskChange}
          onProgressChange={handleProgressChange}
          listCellWidth="155px"
          columnWidth={60}
          barFill={60}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          No tasks yet. Add one above.
        </div>
      )}
    </div>
  )
}