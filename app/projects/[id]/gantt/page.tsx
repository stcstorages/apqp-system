import { createClient } from '@/utils/supabase/server'
import { addGanttTask, updateGanttTaskDetails, deleteGanttTask } from '@/app/actions'
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

      {/* 3. Task Management List (Editable) */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase">Task Details (Edit / Delete)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks?.map((task) => (
                <tr key={task.id}>
                  {/* We wrap the row in a Form for updates */}
                  <td colSpan={5} className="p-0">
                    <form action={updateGanttTaskDetails} className="flex w-full">
                      <input type="hidden" name="task_id" value={task.id} />
                      <input type="hidden" name="project_id" value={id} />

                      {/* Name */}
                      <div className="p-2 w-1/3 min-w-[200px]">
                        <input name="name" defaultValue={task.name} className="w-full text-sm border-gray-300 rounded p-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>

                      {/* Start Date */}
                      <div className="p-2 w-32">
                        <input 
                          name="start_date" 
                          type="date" 
                          defaultValue={new Date(task.start_date).toISOString().split('T')[0]} 
                          className="w-full text-sm border-gray-300 rounded p-1"
                        />
                      </div>

                      {/* End Date */}
                      <div className="p-2 w-32">
                        <input 
                          name="end_date" 
                          type="date" 
                          defaultValue={new Date(task.end_date).toISOString().split('T')[0]} 
                          className="w-full text-sm border-gray-300 rounded p-1"
                        />
                      </div>

                      {/* Progress */}
                      <div className="p-2 w-20">
                         <div className="flex items-center">
                            <input name="progress" type="number" min="0" max="100" defaultValue={task.progress} className="w-full text-sm border-gray-300 rounded p-1 text-center" />
                            <span className="ml-1 text-xs text-gray-500">%</span>
                         </div>
                      </div>

                      {/* Buttons */}
                      <div className="p-2 flex-1 flex items-center justify-center gap-2">
                        <button type="submit" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Save Changes">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        
                        <button 
                          formAction={deleteGanttTask} 
                          className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100" 
                          title="Delete Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
