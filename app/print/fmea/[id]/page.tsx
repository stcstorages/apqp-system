import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Safe Symbol Helper
const getSymbolCode = (scData: any) => {
  if (!scData) return null
  if (Array.isArray(scData)) {
    return scData.length > 0 ? scData[0].symbol_code : null
  }
  return scData.symbol_code
}

export default async function FmeaPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) {
     return <div className="p-10 text-red-600 font-bold">Error loading project.</div>
  }

  // 2. Fetch Data (No Joins on SC to prevent crashes)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 3. Fetch Library Manually
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } .print-border-black { border-color: #000 !important; } table { font-size: 8px; } }`}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         {/* Safe: Just pass the name, removed the DB logo lookup */}
         <CustomerLogo customer={project.customer || ''} />
      </div>

      <div className="mb-2 text-xs">
        <div className="font-bold text-lg text-center mb-4 uppercase">POTENTIAL FAILURE MODE AND EFFECTS ANALYSIS (PROCESS FMEA)</div>
        <div className="border border-black flex">
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">FMEA Number</div><div>{project.pfmea_number || '-'}</div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Part Number</div><div>{project.part_number}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Part Name/Description</div><div>{project.name}</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Model / Vehicle Ref</div><div>{project.model || '-'}</div></div>
           </div>
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Resp</div><div>{project.key_contact || '-'}</div></div>
              <div className="border-b border-black p-1 h-14 overflow-hidden"><div className="text-[8px] text-gray-500">Core Team</div><div className="text-[9px] leading-tight">{project.core_team || '-'}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Prepared By</div><div>Internal</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval</div><div>{formatDate(project.other_approval)}</div></div>
           </div>
           <div className="w-1/3">
              <div className="border-b border-black flex h-8"><div className="w-1/2 border-r border-black p-1"><div className="text-[8px] text-gray-500">Date (Orig.)</div><div>{formatDate(project.pfmea_date_orig)}</div></div><div className="w-1/2 p-1"><div className="text-[8px] text-gray-500">Date (Rev.)</div><div>{formatDate(project.pfmea_date_rev)}</div></div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Cust. Eng Approval</div><div>{formatDate(project.customer_eng_approval)}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Cust. QA Approval</div><div>{formatDate(project.customer_quality_approval)}</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval</div><div>{formatDate(project.other_approval)}</div></div>
           </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-gray-200 font-bold">
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
               // Safe JS Lookup
               const sc = scLibrary?.find((x: any) => x.id === risk?.special_char_id)
               const symbolCode = sc?.symbol_code

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