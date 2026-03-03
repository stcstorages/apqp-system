import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: any) => {
  if (!dateStr || typeof dateStr !== 'string') return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function FmeaPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) {
     return <div>Error loading project.</div>
  }

  // 2. Fetch Data (Simple Fetch, No Joins)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 3. Fetch Library (Separate Safe Fetch)
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } .print-border-black { border-color: #000 !important; } table { font-size: 8px; } }`}</style>

      {/* HEADER: No DB Logo Fetch passed here, just the name */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={String(project.customer || '')} />
      </div>

      <div className="mb-2 text-xs border border-black">
        <div className="font-bold text-center p-1 border-b border-black bg-gray-100">POTENTIAL FAILURE MODE AND EFFECTS ANALYSIS (PROCESS FMEA)</div>
        <div className="grid grid-cols-3 divide-x divide-black text-[9px]">
             <div className="p-1">
                 <div><strong>FMEA No:</strong> {project.pfmea_number || '-'}</div>
                 <div><strong>Part:</strong> {project.part_number} - {project.name}</div>
                 <div><strong>Model:</strong> {project.model || '-'}</div>
             </div>
             <div className="p-1">
                 <div><strong>Core Team:</strong> {project.core_team || '-'}</div>
                 <div><strong>Resp:</strong> {project.key_contact || '-'}</div>
             </div>
             <div className="p-1">
                 <div><strong>Date Orig:</strong> {formatDate(project.pfmea_date_orig)}</div>
                 <div><strong>Date Rev:</strong> {formatDate(project.pfmea_date_rev)}</div>
             </div>
         </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead className="bg-gray-200 font-bold">
          <tr>
            <th className="border border-black p-1">Step</th>
            <th className="border border-black p-1">Failure Mode</th>
            <th className="border border-black p-1">Effect</th>
            <th className="border border-black p-1 w-6">S</th>
            <th className="border border-black p-1 w-6">Cls</th>
            <th className="border border-black p-1">Cause</th>
            <th className="border border-black p-1">Prevention</th>
            <th className="border border-black p-1 w-6">O</th>
            <th className="border border-black p-1">Detection</th>
            <th className="border border-black p-1 w-6">D</th>
            <th className="border border-black p-1 w-8">RPN</th>
            <th className="border border-black p-1">Actions</th>
            <th className="border border-black p-1">Resp</th>
            <th className="border border-black p-1">Taken</th>
            <th className="border border-black p-1 w-8">RPN</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
             const rows = (step.pfmea_records && step.pfmea_records.length > 0) ? step.pfmea_records : [{}];
             return rows.map((risk: any, index: number) => {
               // Safe Logic: Find Symbol
               const sc = scLibrary?.find((x: any) => x.id === risk?.special_char_id)
               const symbolCode = sc ? String(sc.symbol_code) : null

               return (
                 <tr key={risk?.id || `${step.id}-${index}`}>
                   {index === 0 && <td className="border border-black p-1 align-top font-bold" rowSpan={rows.length}>{step.step_number}<br/>{step.description}</td>}
                   <td className="border border-black p-1 align-top">{risk?.failure_mode || '-'}</td>
                   <td className="border border-black p-1 align-top">{risk?.failure_effect || '-'}</td>
                   <td className="border border-black p-1 text-center align-top">{risk?.severity || ''}</td>
                   <td className="border border-black p-1 text-center align-top">{symbolCode && <SpecialSymbol code={symbolCode} />}</td>
                   <td className="border border-black p-1 align-top">{risk?.cause || '-'}</td>
                   <td className="border border-black p-1 align-top">{risk?.control_prevention || '-'}</td>
                   <td className="border border-black p-1 text-center align-top">{risk?.occurrence || ''}</td>
                   <td className="border border-black p-1 align-top">{risk?.current_controls || '-'}</td>
                   <td className="border border-black p-1 text-center align-top">{risk?.detection || ''}</td>
                   <td className="border border-black p-1 text-center font-bold bg-gray-50 align-top">
                      {risk ? (risk.severity * risk.occurrence * risk.detection) || '' : ''}
                   </td>
                   <td className="border border-black p-1 align-top">{risk?.recommended_actions || '-'}</td>
                   <td className="border border-black p-1 align-top">{risk?.responsibility || '-'}</td>
                   <td className="border border-black p-1 align-top">{risk?.action_taken || '-'}</td>
                   <td className="border border-black p-1 text-center font-bold align-top">
                      {risk ? (risk.act_severity * risk.act_occurrence * risk.act_detection) || '' : ''}
                   </td>
                 </tr>
               )
             })
          })}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}