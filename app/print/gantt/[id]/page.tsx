import { createClient } from '@/utils/supabase/server'

export default async function GanttPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project Info
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()

  // 2. Fetch Tasks sorted by Start Date
  const { data: tasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  // 3. Calculate Timeline Bounds (Min Start & Max End)
  let minDate = new Date()
  let maxDate = new Date()
  
  if (tasks && tasks.length > 0) {
    minDate = new Date(tasks[0].start_date)
    maxDate = new Date(tasks[0].end_date)
    
    tasks.forEach(t => {
      const s = new Date(t.start_date)
      const e = new Date(t.end_date)
      if (s < minDate) minDate = s
      if (e > maxDate) maxDate = e
    })
  }

  // Add buffer (5 days before and after) so bars don't touch edges
  minDate.setDate(minDate.getDate() - 5)
  maxDate.setDate(maxDate.getDate() + 5)

  const totalDuration = maxDate.getTime() - minDate.getTime()
  
  // Helper to calculate % position
  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr).getTime()
    return ((d - minDate.getTime()) / totalDuration) * 100
  }

  // Helper to calculate % width
  const getWidth = (startStr: string, endStr: string) => {
    const s = new Date(startStr).getTime()
    const e = new Date(endStr).getTime()
    return ((e - s) / totalDuration) * 100
  }

  return (
    <div className="min-h-screen bg-white text-black p-4">
      {/* Force Landscape Print */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
          .no-break { break-inside: avoid; }
        }
      `}</style>

      {/* 1. Header */}
      <div className="border-2 border-black mb-6">
        <div className="grid grid-cols-4 divide-x-2 divide-black border-b-2 border-black">
          <div className="col-span-1 p-2 font-bold text-xl flex items-center justify-center bg-gray-100 text-center">
            PROJECT SCHEDULE
          </div>
          <div className="col-span-3 p-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="font-bold">Project:</span> {project.name}</div>
              <div><span className="font-bold">Part Number:</span> {project.part_number}</div>
              <div><span className="font-bold">Customer:</span> {project.customer}</div>
              <div><span className="font-bold">Timeline:</span> {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Gantt Chart */}
      <div className="border border-black text-xs relative">
        
        {/* Table Header */}
        <div className="flex border-b border-black bg-gray-200 font-bold">
          <div className="w-1/4 p-2 border-r border-black">Task Name</div>
          <div className="w-3/4 p-2 relative">
             {/* Simple Time Scale Labels (Start - Mid - End) */}
             <div className="flex justify-between text-[10px] text-gray-600">
               <span>{minDate.toLocaleDateString()}</span>
               <span>{new Date((minDate.getTime() + maxDate.getTime()) / 2).toLocaleDateString()}</span>
               <span>{maxDate.toLocaleDateString()}</span>
             </div>
          </div>
        </div>

        {/* Rows */}
        {tasks?.map((task) => {
          const left = getPosition(task.start_date)
          const width = getWidth(task.start_date, task.end_date)
          const progress = task.progress || 0

          return (
            <div key={task.id} className="flex border-b border-gray-300 no-break">
              
              {/* Task Name Column */}
              <div className="w-1/4 p-2 border-r border-black flex flex-col justify-center bg-gray-50">
                <span className="font-medium truncate pr-2">{task.name}</span>
                <span className="text-[9px] text-gray-500">
                  {task.progress}% • {new Date(task.end_date).toLocaleDateString()}
                </span>
              </div>

              {/* Timeline Column */}
              <div className="w-3/4 relative h-10 bg-white">
                {/* Vertical Grid Lines (Background) */}
                <div className="absolute inset-0 w-full h-full flex justify-between px-2 pointer-events-none opacity-20">
                  <div className="border-r border-gray-400 h-full w-full"></div>
                  <div className="border-r border-gray-400 h-full w-full"></div>
                  <div className="border-r border-gray-400 h-full w-full"></div>
                  <div className="border-r border-gray-400 h-full w-full"></div>
                </div>

                {/* The Gantt Bar */}
                <div 
                  className="absolute top-2 h-6 bg-blue-100 border border-blue-600 rounded-sm overflow-hidden flex items-center"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {/* Progress Fill (Darker Blue) */}
                  <div 
                    className="h-full bg-blue-600 print:bg-gray-800"
                    style={{ width: `${progress}%` }}
                  ></div>
                  
                  {/* Tooltip text inside bar if wide enough, otherwise hidden */}
                  {width > 15 && (
                     <span className="absolute inset-0 flex items-center justify-center text-[9px] text-blue-900 font-bold z-10 print:text-black">
                        {progress}%
                     </span>
                  )}
                </div>
              </div>

            </div>
          )
        })}

        {tasks?.length === 0 && (
           <div className="p-8 text-center italic text-gray-500">No tasks defined for timeline.</div>
        )}

      </div>

      {/* 3. Auto-Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
