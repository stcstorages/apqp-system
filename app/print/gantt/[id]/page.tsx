import { createClient } from '@/utils/supabase/server'
import PrintControls from '@/app/components/PrintControls'

// --- HELPERS ---

// Safe String Helper
const safeStr = (val: any) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return '' 
  return String(val)
}

// Get Week Number (ISO)
const getWeekNumber = (d: Date) => {
  if (isNaN(d.getTime())) return 0;
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Color Palette matching your screenshot (Blue -> Purple -> Orange -> Red -> Green)
const getGroupColor = (index: number) => {
  const colors = [
    { bar: 'bg-blue-500', border: 'border-blue-600', bg: 'bg-blue-50' },        // 1.0 Initiation
    { bar: 'bg-purple-500', border: 'border-purple-600', bg: 'bg-purple-50' },  // 2.0 Engineering
    { bar: 'bg-amber-500', border: 'border-amber-600', bg: 'bg-amber-50' },     // 3.0 Equipment
    { bar: 'bg-rose-500', border: 'border-rose-600', bg: 'bg-rose-50' },        // 4.0 Shohin
    { bar: 'bg-emerald-500', border: 'border-emerald-600', bg: 'bg-emerald-50' }// 5.0 Shutdown
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

  // 1. Safe Project Fetch
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) {
     return <div className="p-10 text-red-600 font-bold">Error loading project.</div>
  }

  // 2. Fetch Tasks (Simple Select)
  const { data: rawTasks } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true })

  // Clone tasks to avoid mutating read-only data
  const processedTasks = rawTasks?.map(t => ({ ...t })) || []

  // --- LOGIC: RECALCULATE HEADERS IN MEMORY ---
  // This ensures the gray header bars exactly match the children, even if DB is stale
  if (processedTasks.length > 0) {
    const headerIndices: number[] = []
    processedTasks.forEach((t, i) => { if (t.type === 'project') headerIndices.push(i) })

    headerIndices.forEach((headerIndex, i) => {
      const nextHeaderIndex = headerIndices[i + 1] || processedTasks.length
      // Get all tasks between this header and the next header
      const children = processedTasks.slice(headerIndex + 1, nextHeaderIndex)
      
      if (children.length > 0) {
         let minStart = new Date(8640000000000000) // Max Date
         let maxEnd = new Date(-8640000000000000)  // Min Date
         
         children.forEach(child => {
            const s = new Date(child.start_date).getTime()
            const e = new Date(child.end_date).getTime()
            if (!isNaN(s) && s < minStart) minStart = s
            if (!isNaN(e) && e > maxEnd) maxEnd = e
         })
         
         // Update Header Bounds
         if (minStart < maxEnd) {
             processedTasks[headerIndex].start_date = new Date(minStart).toISOString()
             processedTasks[headerIndex].end_date = new Date(maxEnd).toISOString()
         }
      }
    })
  }

  // --- CALCULATE TIMELINE BOUNDS ---
  let minDate = new Date()
  let maxDate = new Date()
  
  if (processedTasks.length > 0) {
    // Initialize with first task
    minDate = new Date(processedTasks[0].start_date)
    maxDate = new Date(processedTasks[0].end_date)
    
    processedTasks.forEach(t => {
      const s = new Date(t.start_date)
      const e = new Date(t.end_date)
      if (!isNaN(s.getTime()) && s < minDate) minDate = s
      if (!isNaN(e.getTime()) && e > maxDate) maxDate = e
    })
  } else {
    // Default range if empty
    minDate = new Date()
    maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
  }

  // Add Buffer (1 week before, 3 weeks after)
  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 21)

  const totalDuration = Math.max(1, maxDate.getTime() - minDate.getTime())

  // --- GENERATE WEEKS ---
  const weeks = []
  const tempDate = new Date(minDate)
  // Align to Monday
  const day = tempDate.getDay() || 7
  if (day !== 1) tempDate.setHours(-24 * (day - 1))

  while (tempDate < maxDate) {
    weeks.push(new Date(tempDate))
    tempDate.setDate(tempDate.getDate() + 7)
  }

  // --- POSITIONING FUNCTIONS ---
  const getPos = (dateStr: string) => {
    const d = new Date(dateStr)
    if(isNaN(d.getTime())) return 0
    return ((d.getTime() - minDate.getTime()) / totalDuration) * 100
  }
  const getWidth = (startStr: string, endStr: string) => {
      const s = new Date(startStr); const e = new Date(endStr);
      if(isNaN(s.getTime()) || isNaN(e.getTime())) return 0
      // Add 1 day buffer (inclusive bar)
      const durationMs = e.getTime() - s.getTime() + 86400000 
      return (durationMs / totalDuration) * 100
  }
  
  let currentGroupIndex = -1 // Start at -1 so first group is 0
  let currentParentId = null

  return (
    <div className="min-h-screen bg-white text-gray-800 text-[10px] font-sans">
      
      {/* 1. Print Controls (Landscape) */}
      <PrintControls />

      <style>{`
        @media print { 
          @page { size: landscape; margin: 5mm; }
          .no-break { break-inside: avoid; } 
          table, td, th { border: none !important; }
        }
      `}</style>

      {/* 2. HEADER */}
      <div className="flex justify-between items-end mb-2 border-b-2 border-gray-200 pb-1">
         <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-lg italic text-blue-900">SIB APQP</div>
                <div className="text-gray-400">|</div>
                <div className="text-md font-bold text-gray-700">Project Schedule</div>
            </div>
            <div className="flex justify-between items-end">
                <div className="text-[10px] text-gray-500 font-medium">
                    {safeStr(project.customer)} • {safeStr(project.part_number)} • {safeStr(project.name)}
                </div>
                {/* Removed Customer Logo Code as requested */}
            </div>
         </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[9px]">
        
        {/* LEFT: TASK TABLE */}
        <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 z-20 shadow-lg">
          <div className="h-6 bg-gray-50 border-b border-gray-200 flex items-end px-2 pb-1 font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex-1">Task Name</div>
            <div className="w-8 text-right">Dur.</div>
          </div>
          
          <div className="bg-white">
            {processedTasks?.map((task) => {
               const isHeader = task.type === 'project'
               const isChild = !!task.parent_id
               
               // Increment group color index on headers
               if (isHeader) currentGroupIndex++
               const colorTheme = getGroupColor(currentGroupIndex)

               // Calc Duration
               const s = new Date(task.start_date); const e = new Date(task.end_date);
               const days = (!isNaN(s.getTime()) && !isNaN(e.getTime())) ? Math.ceil((e.getTime() - s.getTime()) / 86400000) : 0

               return (
                 <div 
                    key={task.id} 
                    className={`h-5 flex items-center px-2 border-b border-gray-50 ${isHeader ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600'}`}
                 >
                    {/* Color Indicator */}
                    <div className={`w-1 h-3 rounded-full mr-2 ${isHeader ? 'bg-gray-400' : colorTheme.bar}`}></div>
                    
                    {/* Name */}
                    <div className={`flex-1 truncate ${isChild ? 'pl-3' : ''}`}>
                       {safeStr(task.name)}
                    </div>
                    
                    {/* Duration */}
                    <div className="w-8 text-right text-gray-400 text-[8px]">
                       {days}d
                    </div>
                 </div>
               )
            })}
          </div>
        </div>

        {/* RIGHT: TIMELINE CHART */}
        <div className="flex-1 relative overflow-hidden bg-white">
          
          {/* Timeline Header (Months & Weeks) */}
          <div className="h-6 bg-gray-50 border-b border-gray-200 relative whitespace-nowrap overflow-hidden">
            {weeks.map((w, i) => {
              const left = getPos(w.toISOString())
              const isNewMonth = i === 0 || w.getDate() < 8
              
              return (
                <div key={i} className="absolute top-0 bottom-0 border-l border-gray-200 pl-1" style={{ left: `${left}%` }}>
                   {/* Month Name */}
                   {isNewMonth && (
                     <div className="text-[8px] font-bold text-gray-800 uppercase absolute top-0 left-1">
                       {w.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                     </div>
                   )}
                   {/* Week Number */}
                   <div className="absolute bottom-0 text-[7px] text-gray-400">
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
             {/* Current Date Line */}
             <div className="absolute top-0 bottom-0 border-l-2 border-blue-400 opacity-20 z-0" style={{ left: `${getPos(new Date().toISOString())}%` }}></div>
          </div>

          {/* Bars Layer */}
          <div className="relative z-10 pt-[0px]">
             {(() => {
                // Reset index for the render loop
                let renderGroupIndex = -1
                
                return processedTasks?.map((task) => {
                   const isHeader = task.type === 'project'
                   const isMilestone = task.type === 'milestone'
                   
                   if (isHeader) renderGroupIndex++
                   const colorTheme = getGroupColor(renderGroupIndex)

                   const left = getPos(task.start_date)
                   const width = getWidth(task.start_date, task.end_date)
                   
                   return (
                     <div key={task.id} className={`h-5 relative w-full ${isHeader ? 'border-b border-gray-100/50' : ''}`}>
                        
                        {/* Header Bar: Grey Strip */}
                        {isHeader && (
                          <div 
                            className="absolute top-1.5 h-2.5 bg-gray-400 rounded opacity-60"
                            style={{ left: `${left}%`, width: `${width}%` }}
                          >
                             {/* Label to the right of bar */}
                             <span className="absolute left-full ml-1 top-0 text-[8px] font-bold text-gray-600 whitespace-nowrap leading-3">
                               {safeStr(task.name)}
                             </span>
                          </div>
                        )}

                        {/* Milestone: Diamond */}
                        {isMilestone && (
                          <>
                             <div 
                               className="absolute top-1.5 w-2.5 h-2.5 bg-amber-400 border border-white shadow-sm transform rotate-45 z-20"
                               style={{ left: `${left}%`, marginLeft: '-5px' }}
                             ></div>
                             <div 
                               className="absolute top-0.5 text-[8px] font-bold text-gray-600 whitespace-nowrap z-20"
                               style={{ left: `${left}%`, marginLeft: '6px' }}
                             >
                               {safeStr(task.name)}
                             </div>
                          </>
                        )}

                        {/* Standard Task Bar: Colored Pill */}
                        {!isHeader && !isMilestone && (
                          <>
                            <div 
                              className={`absolute top-1 h-3 rounded-full shadow-sm flex items-center overflow-hidden ${colorTheme.bar} bg-opacity-80 border ${colorTheme.border}`}
                              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                            >
                               {/* Darker progress fill */}
                               <div className="h-full bg-black bg-opacity-20" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>
                            
                            {/* Percentage Label */}
                            <div 
                              className="absolute top-1 text-[7px] text-gray-400 whitespace-nowrap flex items-center gap-1"
                              style={{ left: `calc(${left}% + ${Math.max(width, 0.5)}% + 3px)` }}
                            >
                               {task.progress > 0 ? `${task.progress}%` : ''}
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
         Generated by SIB APQP System
      </div>

    </div>
  )
}