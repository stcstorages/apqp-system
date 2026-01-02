import { createClient } from '@/utils/supabase/server'
import { addGanttTask } from '@/app/actions'
import GanttView from './GanttView'

export default async function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  return (
    <div className="space-y-6">
      
      {/* PDF Export Button */}
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

      {/* Top Bar: Add Task */}
      <div className="bg-white p-4 rounded shadow flex items-end gap-4">
        <form action={addGanttTask} className="flex gap-4 w-full items-end">
          <input type="hidden" name="project_id" value={id} />
          
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Task Name</label>
            <input name="name" required placeholder="e.g. Kick-off Meeting" className="w-full border rounded p-2 text-sm" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
            <input name="start_date" type="date" required className="w-full border rounded p-2 text-sm" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
            <input name="end_date" type="date" required className="w-full border rounded p-2 text-sm" />
          </div>

          <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm hover:bg-blue-500">
            Add Task
          </button>
        </form>
      </div>

      {/* The Interactive Chart */}
      <GanttView tasks={tasks || []} projectId={id} />
    </div>
  )
}
