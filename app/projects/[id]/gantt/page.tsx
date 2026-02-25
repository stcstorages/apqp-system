import { createClient } from '@/utils/supabase/server'
import GanttView from './GanttView'
import GanttTaskList from './GanttTaskList'
import AddTaskForm from './AddTaskForm'

export default async function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch tasks sorted by ORDER INDEX
  const { data: tasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true })

  const headers = tasks?.filter((t) => t.type === 'project') || []

  return (
    <div className="space-y-8">
      
      <div className="flex justify-end">
        <a 
          href={`/print/gantt/${id}`} 
          target="_blank" 
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Export Report
        </a>
      </div>

      {/* 1. Add Task Form (New Client Component) */}
      <AddTaskForm projectId={id} headers={headers} />

      {/* 2. Visual Chart */}
      <GanttView tasks={tasks || []} projectId={id} />

      {/* 3. Task Management List (Draggable) */}
      <GanttTaskList 
        tasks={tasks || []} 
        headers={headers} 
        projectId={id} 
      />

    </div>
  )
}