import { createClient } from '@/utils/supabase/server'
import CustomerLogo from '@/app/components/CustomerLogo'
import PrintControls from '@/app/components/PrintControls'

const getWeekNumber = (d: Date) => {
  if (isNaN(d.getTime())) return 0;
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const getGroupColor = (index: number) => {
  const colors = [ 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500' ]
  return { bar: colors[index % colors.length] }
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default async function GanttPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Safe Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()
  if (projError || !project) return <div>Error: Project not found.</div>

  // 2. Fetch Tasks
  const { data: rawTasks } = await supabase.from('gantt_tasks').select('*').eq('project_id', id).order('order_index', { ascending: true })
  const tasks = rawTasks || []

  const processedTasks = tasks.map(t => ({ ...t }))

  // Header Recalc (Simplified)
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
            if (!isNaN(s) && s < minStart) minStart = s
            if (!isNaN(e) && e > maxEnd) maxEnd = e
         })
         processedTasks[headerIndex].start_date = new Date(minStart).toISOString()
         processedTasks[headerIndex].end_date = new Date(maxEnd).toISOString()
      }
    })
  }

  let minDate = new Date()
  let maxDate = new Date()
  if (processedTasks.length > 0) {
    minDate = new Date(processedTasks[0].start_date)
    maxDate = new Date(processedTasks[0].end_date)
    processedTasks.forEach(t => {
      const s = new Date(t.start_date); const e = new Date(t.end_date);
      if(!isNaN(s.getTime()) && s < minDate) minDate = s;
      if(!isNaN(e.getTime()) && e > maxDate) maxDate = e;
    })
  } else {
    minDate = new Date()
    maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
  }

  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 21)
  
  const totalDuration = Math.max(1, maxDate.getTime() - minDate.getTime())

  const weeks = []
  const temp = new Date(minDate)
  while(temp < maxDate) { weeks.push(new Date(temp)); temp.setDate(temp.getDate() + 7); }

  const getPos = (dStr: string) => {
     const d = new Date(dStr); if(isNaN(d.getTime())) return 0;
     return ((d.getTime() - minDate.getTime()) / totalDuration) * 100
  }
  const getWidth = (sStr: string, eStr: string) => {
     const s = new Date(sStr); const e = new Date(eStr);
     if(isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
     const dur = Math.max(0, e.getTime() - s.getTime() + 86400000);
     return (dur / totalDuration) * 100
  }
  
  let groupIdx = 0;

  return (
    <div className="min-h-screen bg-white text-gray-800 text-[10px] font-sans">
      <PrintControls />
      <style>{`@media print { .no-break { break-inside: avoid; } table, td, th { border: none !important; } }`}</style>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-2 border-b-2 border-gray-200 pb-1">
         <div>
            <div className="font-bold text-lg text-blue-900">SIB APQP</div>
            <div className="text-[10px] text-gray-500">{project.customer} • {project.model} • {project.part_name}</div>
         </div>
         <CustomerLogo customer={project.customer || ''} />
      </div>

      {/* CHART */}
      <div className="flex border border-gray-200 rounded text-[9px]">
        <div className="w-[250px] border-r border-gray-200">
           <div className="h-6 bg-gray-50 border-b flex items-end px-2 font-bold"><div className="flex-1">Task</div><div className="w-8">Dur</div></div>
           {processedTasks.map(t => {
              if(t.type === 'project') groupIdx++;
              const isHeader = t.type === 'project';
              const s = new Date(t.start_date); const e = new Date(t.end_date);
              const dur = (!isNaN(s.getTime()) && !isNaN(e.getTime())) ? Math.ceil((e.getTime() - s.getTime()) / 86400000) : 0;
              return (
                <div key={t.id} className={`h-5 flex items-center px-2 border-b ${isHeader ? 'bg-gray-100 font-bold' : ''}`}>
                   <div className="flex-1 truncate pl-2">{t.name}</div>
                   <div className="w-8 text-right">{dur}d</div>
                </div>
              )
           })}
        </div>
        
        <div className="flex-1 relative overflow-hidden">
           <div className="h-6 bg-gray-50 border-b relative whitespace-nowrap">
              {weeks.map((w, i) => (
                <div key={i} className="absolute border-l border-gray-200 pl-1 h-full" style={{ left: `${getPos(w.toISOString())}%` }}>
                   W{getWeekNumber(w)}
                </div>
              ))}
           </div>
           <div className="relative pt-[0px]">
              {(() => {
                 groupIdx = 0;
                 return processedTasks.map(t => {
                    if(t.type === 'project') groupIdx++;
                    const color = getGroupColor(groupIdx).bar;
                    const left = getPos(t.start_date);
                    const width = getWidth(t.start_date, t.end_date);
                    const isHeader = t.type === 'project';
                    
                    return (
                      <div key={t.id} className={`h-5 relative w-full ${isHeader ? 'border-b border-gray-100' : ''}`}>
                         {isHeader ? (
                            <div className="absolute top-1.5 h-2.5 bg-gray-400 rounded" style={{ left: `${left}%`, width: `${width}%` }}></div>
                         ) : (
                            <div className={`absolute top-1.5 h-2.5 rounded ${color} opacity-80`} style={{ left: `${left}%`, width: `${width}%` }}></div>
                         )}
                      </div>
                    )
                 })
              })()}
           </div>
        </div>
      </div>
    </div>
  )
}