import { createClient } from '@/utils/supabase/server'
import CustomerLogo from '@/app/components/CustomerLogo'
import PrintControls from '@/app/components/PrintControls' // Import the new control

// Format Date Helper (DD-MMM) - Shorter for the table column
const formatDateShort = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// Format Date Helper (Full)
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
}

export default async function GanttPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  const { data: tasks } = await supabase.from('gantt_tasks').select('*').eq('project_id', id).order('order_index', { ascending: true })

  // Calculate Timeline Bounds
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
  minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 6, 0)
  const totalDuration = maxDate.getTime() - minDate.getTime()

  // Generate Months
  const months = []
  const tempDate = new Date(minDate)
  while (tempDate < maxDate) {
    months.push(new Date(tempDate))
    tempDate.setMonth(tempDate.getMonth() + 1)
  }

  const getPos = (dateStr: string) => ((new Date(dateStr).getTime() - minDate.getTime()) / totalDuration) * 100
  const getWidth = (startStr: string, endStr: string) => ((new Date(endStr).getTime() - new Date(startStr).getTime()) / totalDuration) * 100
  const getDuration = (s: string, e: string) => Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 3600 * 24))

  return (
    <div className="min-h-screen bg-white text-black text-[10px] font-sans">
      
      {/* NEW: Client Component for Orientation Toggle */}
      <PrintControls />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={project.customer} />
      </div>

      <div className="border border-black mb-2 flex">
        <div className="flex-1 p-2 border-r border-black">
          <h1 className="font-bold text-lg leading-tight">MASTER PROJECT SCHEDULE</h1>
          <h2 className="text-sm font-semibold">{project.model || ''} - {project.name}</h2>
        </div>
        <div className="p-2 flex flex-col justify-center items-end min-w-[200px]">
          <div className="text-xs">Date: {formatDate(new Date().toISOString())}</div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex border border-black">
        
        {/* LEFT: DATA TABLE */}
        <div className="w-[300px] flex-shrink-0 border-r border-black flex flex-col">
          <div className="h-8 border-b border-black bg-gray-200 flex items-center font-bold px-1 text-center">
            {/* 1. ID Column Removed */}
            <div className="flex-1 px-2 border-r border-gray-400 text-left">Task Name</div>
            {/* 2. Added Start Date Column */}
            <div className="w-14 border-r border-gray-400">Start</div>
            <div className="w-12">Dur.</div>
          </div>
          
          {tasks?.map((task, index) => {
            const isHeader = task.type === 'project';
            const isChild = !!task.parent_id;

            return (
              <div 
                key={task.id} 
                className={`h-6 border-b border-gray-200 flex items-center px-1 ${isHeader ? 'bg-gray-100 font-bold' : 'bg-white'}`}
              >
                <div className={`flex-1 px-2 border-r border-gray-200 truncate ${isChild ? 'pl-4' : ''}`}>
                   {task.name}
                </div>
                {/* Start Date Column */}
                <div className="w-14 text-center border-r border-gray-200 text-[9px]">
                   {formatDateShort(task.start_date)}
                </div>
                <div className="w-12 text-center text-[9px]">
                   {isHeader ? '' : `${getDuration(task.start_date, task.end_date)}d`}
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: GANTT CHART */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          
          {/* Month Header */}
          <div className="h-8 border-b border-black bg-white flex relative">
            {months.map((m, i) => (
              <div key={i} className="border-r border-gray-400 text-center flex items-center justify-center font-bold" style={{ width: `${(1 / months.length) * 100}%` }}>
                {m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </div>
            ))}
          </div>

          {/* Vertical Grid Lines (With Weeks) */}
          <div className="absolute top-8 bottom-0 left-0 right-0 flex z-0">
             {months.map((_, i) => (
               <div key={i} className="border-r border-gray-400 h-full relative" style={{ width: `${(1 / months.length) * 100}%` }}>
                  {/* 3. Thin Week Lines (Approximate 4 weeks per month) */}
                  <div className="absolute left-[25%] top-0 bottom-0 border-r border-gray-200 border-dashed w-[1px]"></div>
                  <div className="absolute left-[50%] top-0 bottom-0 border-r border-gray-200 border-dashed w-[1px]"></div>
                  <div className="absolute left-[75%] top-0 bottom-0 border-r border-gray-200 border-dashed w-[1px]"></div>
               </div>
             ))}
          </div>

          {/* Timeline Bars */}
          <div className="relative z-10">
            {tasks?.map((task) => {
              const left = getPos(task.start_date)
              const width = getWidth(task.start_date, task.end_date)
              const isHeader = task.type === 'project';
              const isMilestone = task.type === 'milestone';

              return (
                <div 
                  key={task.id} 
                  className={`h-6 border-b border-gray-100 relative w-full ${isHeader ? 'bg-gray-100/50' : ''}`}
                >
                  {isMilestone ? (
                    // Milestone
                    <>
                      <div className="absolute top-1 w-3 h-3 bg-black transform rotate-45" style={{ left: `${left}%`, marginLeft: '-6px' }}></div>
                      <div className="absolute top-0 left-0 text-[9px] font-bold hidden print:block whitespace-nowrap pl-2" style={{ left: `${left}%` }}>
                         {formatDate(task.start_date)}
                      </div>
                    </>
                  ) : isHeader ? (
                    // Header Bar
                    <div className="absolute top-1.5 h-3 bg-gray-600 rounded-sm opacity-80" style={{ left: `${left}%`, width: `${width}%` }}></div>
                  ) : (
                    // Standard Task Bar
                    <div className="absolute top-1.5 h-3 bg-blue-600 border border-blue-800" style={{ left: `${left}%`, width: `${width}%` }}>
                      <div className="h-full bg-blue-900" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <div className="mt-2 border border-black flex">
        <div className="flex-1 p-2 border-r border-black grid grid-cols-4 gap-2 text-[9px]">
           <div className="flex items-center gap-2"><div className="w-8 h-2 bg-gray-600 rounded-sm"></div> Header/Stage</div>
           <div className="flex items-center gap-2"><div className="w-8 h-2 bg-blue-600 border border-blue-800"></div> Task</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black transform rotate-45"></div> Milestone</div>
           <div className="flex items-center gap-2"><div className="w-8 h-2 bg-blue-900"></div> Progress</div>
           <div className="col-span-4 text-gray-500 mt-1">Project: {project.name} (PN: {project.part_number})</div>
        </div>
        <div className="w-[300px] grid grid-cols-3 divide-x divide-black">
          <div className="flex flex-col"><div className="bg-gray-100 border-b border-black text-center font-bold py-1">Prepared</div><div className="flex-1"></div></div>
          <div className="flex flex-col"><div className="bg-gray-100 border-b border-black text-center font-bold py-1">Checked</div><div className="flex-1"></div></div>
          <div className="flex flex-col"><div className="bg-gray-100 border-b border-black text-center font-bold py-1">Approved</div><div className="flex-1"></div></div>
        </div>
      </div>
    </div>
  )
}
