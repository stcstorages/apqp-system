import { createClient } from '@/utils/supabase/server'
import { addGanttTask, updateGanttTaskDetails, deleteGanttTask, moveGanttTask } from '@/app/actions'
import GanttView from './GanttView'
import GanttTaskList from './GanttTaskList'

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

      {/* 1. Add Task Form */}
      <div className="bg-white p-4 rounded shadow border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Add New Task</h3>
        <form action={addGanttTask} className="flex flex-wrap gap-4 items-end">
          <input type="hidden" name="project_id" value={id} />
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Name</label>
            <input name="name" required placeholder="e.g. Kick-off Meeting" className="w-full border rounded p-2 text-sm" />
          </div>
          
          {/* TYPE */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
            <select name="type" className="w-32 border rounded p-2 text-sm bg-white">
              <option value="task">Standard Task</option>
              <option value="project">HEADER / GROUP</option>
              <option value="milestone">Milestone (◆)</option>
            </select>
          </div>

          {/* PARENT (Group Under) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Under</label>
            <select name="parent_id" className="w-40 border rounded p-2 text-sm bg-white">
              <option value="none">-- None (Root) --</option>
              {headers.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
            <input name="start_date" type="date" required className="w-full border rounded p-2 text-sm" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
            <input name="end_date" type="date" required className="w-full border rounded p-2 text-sm" />
          </div>

          <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm hover:bg-blue-500 h-[38px]">
            Add +
          </button>
        </form>
      </div>

      {/* 2. Visual Chart */}
      <GanttView tasks={tasks || []} projectId={id} />

      {/* 3. Task Management List */}
      <GanttTaskList 
        tasks={tasks || []} 
        headers={headers} 
        projectId={id} 
      />

    </div>
  )
}