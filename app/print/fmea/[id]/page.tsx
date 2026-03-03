import { createClient } from '@/utils/supabase/server'

// Safe Date Helper
const formatDate = (dateStr: any) => {
  if (!dateStr || typeof dateStr !== 'string') return '-'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB')
  } catch (e) {
    return '-'
  }
}

// Safe String Helper (Prevents Object Crash)
const safeStr = (val: any) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return 'ERR:OBJ' // Catch objects before they crash React
  return String(val)
}

export default async function FmeaPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) {
     return <div>Error loading project.</div>
  }

  // 2. Fetch Data (Simple)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 text-[10px] font-sans">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 2px; vertical-align: top; } }`}</style>

      {/* HEADER (Simple Text Only) */}
      <div className="mb-4">
        <div className="flex justify-between font-bold text-lg mb-2">
            <span>SIB APQP</span>
            <span>{safeStr(project.customer)}</span>
        </div>
        <div className="border border-black p-2 bg-gray-100 font-bold text-center">
            PROCESS FMEA
        </div>
        <div className="border border-black border-t-0 p-2 grid grid-cols-3 gap-4">
            <div>
                <div>Part: {safeStr(project.part_number)}</div>
                <div>Name: {safeStr(project.name)}</div>
            </div>
            <div>
                <div>Model: {safeStr(project.model)}</div>
                <div>Core Team: {safeStr(project.core_team)}</div>
            </div>
            <div>
                <div>Date Orig: {formatDate(project.pfmea_date_orig)}</div>
                <div>Date Rev: {formatDate(project.pfmea_date_rev)}</div>
            </div>
        </div>
      </div>

      {/* TABLE */}
      <table>
        <thead className="bg-gray-200">
          <tr>
            <th>Step</th>
            <th>Failure Mode</th>
            <th>Effect</th>
            <th className="w-6">S</th>
            <th className="w-6">Cls</th>
            <th>Cause</th>
            <th>Prevention</th>
            <th className="w-6">O</th>
            <th>Detection</th>
            <th className="w-6">D</th>
            <th className="w-8">RPN</th>
            <th>Actions</th>
            <th>Resp</th>
            <th>Taken</th>
            <th className="w-8">RPN</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
             const rows = (step.pfmea_records && step.pfmea_records.length > 0) ? step.pfmea_records : [{}];
             
             return rows.map((risk: any, index: number) => {
               // Safe calculations
               const s = Number(risk?.severity) || 0
               const o = Number(risk?.occurrence) || 0
               const d = Number(risk?.detection) || 0
               const rpn = s * o * d

               const s2 = Number(risk?.act_severity) || 0
               const o2 = Number(risk?.act_occurrence) || 0
               const d2 = Number(risk?.act_detection) || 0
               const rpn2 = s2 * o2 * d2

               return (
                 <tr key={risk?.id || `${step.id}-${index}`}>
                   {index === 0 && (
                       <td rowSpan={rows.length} className="font-bold bg-gray-50">
                           {safeStr(step.step_number)}<br/>{safeStr(step.description)}
                       </td>
                   )}
                   <td>{safeStr(risk?.failure_mode)}</td>
                   <td>{safeStr(risk?.failure_effect)}</td>
                   <td className="text-center">{s || ''}</td>
                   {/* Just show text ID for class to prevent crash */}
                   <td className="text-center">{risk?.special_char_id ? 'SC' : ''}</td>
                   <td>{safeStr(risk?.cause)}</td>
                   <td>{safeStr(risk?.control_prevention)}</td>
                   <td className="text-center">{o || ''}</td>
                   <td>{safeStr(risk?.current_controls)}</td>
                   <td className="text-center">{d || ''}</td>
                   <td className="text-center font-bold">{rpn || ''}</td>
                   <td>{safeStr(risk?.recommended_actions)}</td>
                   <td>{safeStr(risk?.responsibility)}</td>
                   <td>{safeStr(risk?.action_taken)}</td>
                   <td className="text-center font-bold">{rpn2 || ''}</td>
                 </tr>
               )
             })
          })}
        </tbody>
      </table>

      {/* Auto Print */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}