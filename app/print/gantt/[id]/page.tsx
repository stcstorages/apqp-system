import { createClient } from '@/utils/supabase/server'

export default async function GanttPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project & Tasks
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  const { data: tasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  // 2. Calculate Global Timeline Bounds
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
  // Snap to start of the first month and end of the last month for the grid
  minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0) // Add buffer month

  const totalDuration = maxDate.getTime() - minDate.getTime()

  // 3. Generate Month Columns
  const months = []
  const tempDate = new Date(minDate)
  while (tempDate < maxDate) {
    months.push(new Date(tempDate))
    tempDate.setMonth(tempDate.getMonth() + 1)
  }

  // Helpers
  const getPos = (dateStr: string) => {
    return ((new Date(dateStr).getTime() - minDate.getTime()) / totalDuration) * 100
  }
  const getWidth = (startStr: string, endStr: string) => {
    return ((new Date(endStr).getTime() - new Date(startStr).getTime()) / totalDuration) * 100
  }
  const getDuration = (s: string, e: string) => {
    const diff = new Date(e).getTime() - new Date(s).getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  return (
    <div className="min-h-screen bg-white text-black text-[10px] font-sans">
      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; }
          .no-break { break-inside: avoid; }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="border border-black mb-2 flex">
        <div className="flex-1 p-2 border-r border-black">
          <h1 className="font-bold text-lg leading-tight">SAPURA TECHNICAL CENTRE SDN BHD</h1>
          <h2 className="text-sm font-semibold">SHOCK ABSORBER DIVISION</h2>
        </div>
        <div className="p-2 flex flex-col justify-center items-end min-w-[200px]">
          {/* Logo Placeholder */}
          <div className="font-bold text-xl italic text-red-700 flex items-center gap-1">
            <span className="text-blue-900">◆</span> Sapura <span className="text-gray-600 text-xs not-italic">Industrial</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT: TABLE (LEFT) + CHART (RIGHT) */}
      <div className="flex border border-black">
        
        {/* LEFT: DATA TABLE */}
        <div className="w-[300px] flex-shrink-0 border-r border-black flex flex-col">
          {/* Table Header */}
          <div className="h-8 border-b border-black bg-gray-200 flex items-center font-bold px-1">
            <div className="w-8 text-center border-r border-gray-400">ID</div>
            <div className="flex-1 px-2 border-r border-gray-400">Task Name</div>
            <div className="w-16 text-center">Duration</div>
          </div>
          
          {/* Table Rows */}
          {tasks?.map((task, index) => (
            <div key={task.id} className="h-6 border-b border-gray-200 flex items-center px-1 bg-white">
              <div className="w-8 text-center border-r border-gray-200">{index + 1}</div>
              <div className="flex-1 px-2 border-r border-gray-200 truncate">{task.name}</div>
              <div className="w-16 text-center">{getDuration(task.start_date, task.end_date)} days</div>
            </div>
          ))}
        </div>

        {/* RIGHT: GANTT CHART */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          
          {/* Timeline Header (Months) */}
          <div className="h-8 border-b border-black bg-white flex relative">
            {months.map((m, i) => (
              <div key={i} className="border-r border-gray-400 text-center flex items-center justify-center font-bold" style={{ width: `${(1 / months.length) * 100}%` }}>
                {m.toLocaleDateString('en-US', { month: 'long' })}
              </div>
            ))}
          </div>

          {/* Grid Background */}
          <div className="absolute top-8 bottom-0 left-0 right-0 flex z-0">
             {months.map((_, i) => (
               <div key={i} className="border-r border-gray-300 border-dashed h-full" style={{ width: `${(1 / months.length) * 100}%` }}></div>
             ))}
          </div>

          {/* Task Bars */}
          <div className="relative z-10">
            {tasks?.map((task) => {
              const left = getPos(task.start_date)
              const width = getWidth(task.start_date, task.end_date)
              const isMilestone = width < 0.5 // Treat < 1 day as milestone

              return (
                <div key={task.id} className="h-6 border-b border-gray-100 relative w-full">
                  
                  {isMilestone ? (
                    // Milestone Diamond
                    <div 
                      className="absolute top-1 w-3 h-3 bg-black transform rotate-45"
                      style={{ left: `${left}%`, marginLeft: '-6px' }}
                    >
                      <div className="absolute -top-4 left-0 w-20 text-[9px] font-bold">
                        {new Date(task.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    // Normal Task Bar
                    <div 
                      className="absolute top-1.5 h-3 bg-blue-600 border border-blue-800"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      {/* Optional Progress Fill */}
                      <div className="h-full bg-blue-900" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* FOOTER: LEGEND & APPROVAL */}
      <div className="mt-2 border border-black flex">
        
        {/* Legend */}
        <div className="flex-1 p-2 border-r border-black grid grid-cols-3 gap-2 text-[9px]">
           <div className="flex items-center gap-2">
             <div className="w-8 h-2 bg-blue-600 border border-blue-800"></div> Task
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-black transform rotate-45"></div> Milestone
           </div>
           <div className="flex items-center gap-2">
             <div className="w-8 h-2 bg-blue-900"></div> Progress
           </div>
           <div className="col-span-3 text-gray-500 mt-1">
             Project: {project.name} (PN: {project.part_number})
           </div>
        </div>

        {/* Sign-off Box */}
        <div className="w-[300px] grid grid-cols-3 divide-x divide-black">
          <div className="flex flex-col">
            <div className="bg-gray-100 border-b border-black text-center font-bold py-1">Prepared</div>
            <div className="flex-1"></div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray-100 border-b border-black text-center font-bold py-1">Checked</div>
            <div className="flex-1"></div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray-100 border-b border-black text-center font-bold py-1">Approved</div>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      <div className="text-right text-[8px] text-gray-400 mt-1">
        Generated by APQP System • {new Date().getFullYear()}
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
