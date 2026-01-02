import { createClient } from '@/utils/supabase/server'

export default async function GanttPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Project Info
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()

  // Fetch Tasks
  const { data: tasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      {/* 1. Header */}
      <div className="border-2 border-black mb-4">
        <div className="grid grid-cols-4 divide-x-2 divide-black border-b-2 border-black">
          <div className="col-span-1 p-2 font-bold text-xl flex items-center justify-center bg-gray-100 text-center">
            PROJECT TIMELINE
          </div>
          <div className="col-span-3 p-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="font-bold">Project:</span> {project.name}</div>
              <div><span className="font-bold">Part Number:</span> {project.part_number}</div>
              <div><span className="font-bold">Customer:</span> {project.customer}</div>
              <div><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Table */}
      <table className="w-full border-collapse border border-black text-sm">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border border-black p-2 text-left">Task Name</th>
            <th className="border border-black p-2 w-32">Start Date</th>
            <th className="border border-black p-2 w-32">End Date</th>
            <th className="border border-black p-2 w-24">Duration</th>
            <th className="border border-black p-2 w-24">Progress</th>
          </tr>
        </thead>
        <tbody>
          {tasks?.map((task) => {
            const start = new Date(task.start_date)
            const end = new Date(task.end_date)
            // Calculate duration in days
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

            return (
              <tr key={task.id}>
                <td className="border border-black p-2">{task.name}</td>
                <td className="border border-black p-2 text-center">{start.toLocaleDateString()}</td>
                <td className="border border-black p-2 text-center">{end.toLocaleDateString()}</td>
                <td className="border border-black p-2 text-center">{duration} Days</td>
                <td className="border border-black p-2 text-center">
                  {task.progress}%
                </td>
              </tr>
            )
          })}
          {tasks?.length === 0 && (
             <tr>
                 <td colSpan={5} className="border border-black p-4 text-center italic">No tasks defined.</td>
             </tr>
          )}
        </tbody>
      </table>

      {/* 3. Auto-Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
