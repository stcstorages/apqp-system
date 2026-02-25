import { createClient } from '@/utils/supabase/server'
import CustomerLogo from '@/app/components/CustomerLogo'
import PrintControls from '@/app/components/PrintControls'

// Helper: Get ISO Week Number
const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper: Modern Color Palette
const getGroupColor = (index: number) => {
  const colors = [
    { bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' }, // Green
    { bar: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },       // Blue
    { bar: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },   // Purple
    { bar: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },      // Orange
    { bar: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },         // Red
  ]
  return colors[index % colors.length]
}

export default async function GanttPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  
  // Sort by Order Index
  const { data: rawTasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true })

  // --- 1. DYNAMICALLY RECALCULATE HEADERS ---
  const processedTasks = rawTasks?.map(t => ({ ...t })) || []
  
  if (processedTasks.length > 0) {
    const headerIndices: number[] = []
    processedTasks.forEach((t, i) => { if (t.type === 'project') headerIndices.push(i) })

    headerIndices.forEach((headerIndex, i) => {
      const nextHeaderIndex = headerIndices[i + 1] || processedTasks.length
      const children = processedTasks.slice(headerIndex + 1, nextHeaderIndex)
      
      if (children.length > 0) {
         let minStart = new Date(children[0].start_date).getTime()
         let maxEnd = new Date(children[0].end_date).getTime()
         
         children.forEach(child => {
            const s = new Date(child.start_date).getTime()
            const e = new Date(child.end_date).getTime()
            if (s < minStart) minStart = s
            if (e > maxEnd) maxEnd = e
         })
         
         processedTasks[headerIndex].start_date = new Date(minStart).toISOString()
         processedTasks[headerIndex].end_date = new Date(maxEnd).toISOString()
      }
    })
  }

  // --- 2. CALCULATE TIMELINE BOUNDS ---
  let minDate = new Date()
  let maxDate = new Date()
  
  if (processedTasks.length > 0) {
    minDate = new Date(processedTasks[0].start_date)
    maxDate = new Date(processedTasks[0].end_date)
    
    processedTasks.forEach(t => {
      const s = new Date(t.start_date)
      const e = new Date(t.end_date)
      if (s < minDate) minDate = s
      if (e > maxDate) maxDate = e
    })
  }

  // Add buffer: Start 1 week before, End 3 weeks after
  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 21)

  const totalDuration = maxDate.getTime() - minDate.getTime()

  // --- 3. GENERATE WEEK COLUMNS ---
  const weeks = []
  const tempDate = new Date(minDate)
  // Align to Monday
  const day = tempDate.getDay() || 7
  if (day !== 1) tempDate.setHours(-24 * (day - 1))

  while (tempDate < maxDate) {
    weeks.push(new Date(tempDate))
    tempDate.setDate(tempDate.getDate() + 7)
  }

  // Positioning Helpers
  // Fix: Add 1 day (86400000ms) to width so bars cover the end date fully (Inclusive)
  const getPos = (dateStr: string) => ((new Date(dateStr).getTime() - minDate.getTime()) / totalDuration) * 100
  const getWidth = (startStr: string, endStr: string) => {
      const durationMs = new Date(endStr).getTime() - new Date(startStr).getTime()
      // Add 1 day buffer for visibility unless it's a 0-day milestone
      const adjustedDuration = durationMs === 0 ? 0 : durationMs + 86400000 
      return (adjustedDuration / totalDuration) * 100
  }
  
  let currentGroupIndex = 0
  let currentParentId = null

  return (
    <div className="min-h-screen bg-white text-gray-800 text-[10px] font-sans">
      
      {/* PRINT CONTROLS */}
      <PrintControls />

      <style>{`
        @media print { 
          .no-break { break-inside: avoid; } 
          table, td, th { border: none !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-2 border-b-2 border-gray-200 pb-1">
         <div>
            <div className="flex items-center gap-2 mb-0">
                <div className="font-bold text-lg italic text-blue-900">SIB APQP</div>
                <div className="text-gray-400">|</div>
                <div className="text-md font-bold text-gray-700">Project Schedule</div>
            </div>
            <div className="text-[10px] text-gray-500">
                {project.customer} • {project.model} • {project.part_name}
            </div>
         </div>
         <div className="scale-75 origin-right">
             <CustomerLogo customer={project.customer} />
         </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[9px]">
        
        {/* LEFT SIDE: TASK LIST */}
        <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 z-20 shadow-lg">
          <div className="h-6 bg-gray-50 border-b border-gray-200 flex items-end px-2 pb-1 font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex-1">Task Name</div>
            <div className="w-10 text-right">Dur.</div>
          </div>
          
          <div className="bg-white">
            {processedTasks?.map((task) => {
               if (task.type === 'project') {
                 currentGroupIndex++
                 currentParentId = task.id
               }
               const colorTheme = getGroupColor(currentGroupIndex)
               const isHeader = task.type === 'project'
               const isChild = !!task.parent_id

               return (
                 <div 
                    key={task.id} 
                    className={`h-5 flex items-center px-2 border-b border-gray-50 ${isHeader ? 'bg-gray-100 font-bold text-gray-800' : 'text-gray-600'}`}
                 >
                    <div className={`w-1 h-3 rounded-full mr-2 ${isHeader ? 'bg-gray-400' : colorTheme.bar}`}></div>
                    <div className={`flex-1 truncate ${isChild ? 'pl-3' : ''}`}>
                       {task.name}
                    </div>
                    <div className="w-10 text-right text-gray-400 text-[8px]">
                       {Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 3600 * 24))}d
                    </div>
                 </div>
               )
            })}
          </div>
        </div>

        {/* RIGHT SIDE: TIMELINE */}
        <div className="flex-1 relative overflow-hidden bg-white">
          
          {/* Timeline Header */}
          <div className="h-6 bg-gray-50 border-b border-gray-200 relative whitespace-nowrap overflow-hidden">
            {weeks.map((w, i) => {
              const left = getPos(w.toISOString())
              const isNewMonth = i === 0 || w.getDate() < 8
              
              return (
                <div key={i} className="absolute top-0 bottom-0 border-l border-gray-200 pl-1" style={{ left: `${left}%` }}>
                   {isNewMonth && (
                     <div className="text-[9px] font-bold text-gray-800 uppercase absolute top-0 left-1">
                       {w.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                     </div>
                   )}
                   <div className="absolute bottom-0 text-[8px] text-gray-400">
                     W{getWeekNumber(w)}
                   </div>
                </div>
              )
            })}
          </div>

          {/* Grid Background */}
          <div className="absolute top-6 bottom-0 left-0 right-0 z-0">
             {weeks.map((w, i) => {
               const left = getPos(w.toISOString())
               return (
                 <div key={i} className="absolute top-0 bottom-0 border-l border-gray-100 h-full" style={{ left: `${left}%` }}></div>
               )
             })}
             <div className="absolute top-0 bottom-0 border-l-2 border-blue-400 opacity-30 z-0" style={{ left: `${getPos(new Date().toISOString())}%` }}></div>
          </div>

          {/* Bars Layer */}
          <div className="relative z-10 pt-[0px]">
             {(() => {
                currentGroupIndex = 0
                return processedTasks?.map((task) => {
                   if (task.type === 'project') currentGroupIndex++
                   const colorTheme = getGroupColor(currentGroupIndex)
                   const isHeader = task.type === 'project'
                   const isMilestone = task.type === 'milestone'

                   const left = getPos(task.start_date)
                   const width = getWidth(task.start_date, task.end_date)
                   
                   return (
                     <div key={task.id} className={`h-5 relative w-full ${isHeader ? 'border-b border-gray-100/50' : ''}`}>
                        
                        {/* Header Bar: FIXED WIDTH (No +80px) */}
                        {isHeader && (
                          <div className="absolute top-0.5" style={{ left: `${left}%`, width: `${width}%` }}>
                             {/* The Bar */}
                             <div className="h-4 bg-gray-300 rounded-md border-l-4 border-gray-500 absolute w-full"></div>
                             {/* The Label (Sitting TO THE RIGHT of the bar) */}
                             <span className="absolute left-full ml-1 top-0 text-[8px] font-bold text-gray-600 whitespace-nowrap leading-4">
                               {task.name}
                             </span>
                          </div>
                        )}

                        {/* Milestone */}
                        {isMilestone && (
                          <>
                             <div 
                               className="absolute top-1.5 w-2.5 h-2.5 bg-amber-400 border border-white shadow-sm transform rotate-45 z-20"
                               style={{ left: `${left}%`, marginLeft: '-5px' }}
                             ></div>
                             <div 
                               className="absolute top-0.5 text-[8px] font-bold text-gray-600 whitespace-nowrap z-20"
                               style={{ left: `${left}%`, marginLeft: '8px' }}
                             >
                               {task.name}
                             </div>
                          </>
                        )}

                        {/* Standard Task Bar */}
                        {!isHeader && !isMilestone && (
                          <>
                            <div 
                              className={`absolute top-0.5 h-4 rounded-full shadow-sm flex items-center overflow-hidden ${colorTheme.bar} bg-opacity-30 border ${colorTheme.border}`}
                              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                            >
                               <div className={`h-full ${colorTheme.bar}`} style={{ width: `${task.progress}%` }}></div>
                            </div>
                            
                            {/* Label Next to Bar */}
                            <div 
                              className="absolute top-0.5 text-[8px] text-gray-500 whitespace-nowrap flex items-center gap-1 leading-4"
                              style={{ left: `calc(${left}% + ${Math.max(width, 0.5)}% + 4px)` }}
                            >
                               <span className="text-gray-400">{task.progress}%</span>
                            </div>
                          </>
                        )}
                     </div>
                   )
                })
             })()}
          </div>

        </div>
      </div>
      
      <div className="mt-2 text-center text-gray-400 text-[8px]">
         Generated by SIB APQP System • {new Date().toLocaleDateString()}
      </div>

    </div>
  )
}