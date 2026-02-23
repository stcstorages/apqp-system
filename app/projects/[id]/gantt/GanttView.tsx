'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  tasks: any[]
  projectId: string
}

export default function GanttView({ tasks: initialTasks, projectId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  
  const mapTasks = (data: any[]): Task[] => data.map(t => {
    // VISUAL STYLING BASED ON TYPE
    let styles = { progressColor: '#2563eb', progressSelectedColor: '#1d4ed8', backgroundColor: '#3b82f6' }
    
    if (t.type === 'project') {
      // HEADER: Grey Bar
      styles = { progressColor: '#4b5563', progressSelectedColor: '#374151', backgroundColor: '#9ca3af' }
    } else if (t.type === 'milestone') {
      // MILESTONE: Gold Bar (Visual library handles shape, but color helps)
      styles = { progressColor: '#d97706', progressSelectedColor: '#b45309', backgroundColor: '#f59e0b' }
    }

    return {
      start: new Date(t.start_date),
      end: new Date(t.end_date),
      name: t.name,
      id: t.id,
      type: t.type || 'task', 
      progress: t.progress,
      isDisabled: false,
      styles: styles,
    }
  })

  const [tasks, setTasks] = useState<Task[]>(mapTasks(initialTasks))

  useEffect(() => {
    setTasks(mapTasks(initialTasks))
  }, [initialTasks])

  const handleTaskChange = async (task: Task) => {
    let newTasks = tasks.map(t => (t.id === task.id ? task : t))
    setTasks(newTasks)

    await supabase.from('gantt_tasks').update({
      start_date: task.start.toISOString(),
      end_date: task.end.toISOString(),
      progress: task.progress
    }).eq('id', task.id)

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
