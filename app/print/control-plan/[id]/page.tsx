import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'

// Safe Date Helper
const formatDate = (dateStr: any) => {
  if (!dateStr || typeof dateStr !== 'string') return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    return '-'
  }
}

// Safe String Helper
const safeStr = (val: any) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return '' 
  return String(val)
}

export default async function ControlPlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project (Safe Single Fetch)
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) {
     return <div className="p-10 text-red-600 font-bold">Error loading project.</div>
  }

  // 2. Fetch Data (Deep fetch but NO JOIN on Special Characteristics to prevent crash)
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, pfmea_records (*, control_plan_records (*))`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 3. Fetch Library Manually (Safe JS Lookup)
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } .print-border-black { border-color: #000 !important; } table { font-size: 9px; } }`}</style>

      {/* HEADER: SIMPLE TEXT ONLY (No Logo) */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <div className="font-bold text-lg">{safeStr(project.customer)}</div>
      </div>

      <div className="mb-2 text-xs">
        <div className="font-bold text-lg text-center mb-2">CONTROL PLAN</div>
        
        {/* Phase Checkboxes */}
        <div className="flex gap-8 mb-2 text-[10px]">
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border border-black ${project.cp_phase === 'prototype' ? 'bg-black' : ''}`}></div> Prototype
           </div>
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border border-black ${project.cp_phase === 'pre-launch' ? 'bg-black' : ''}`}></div> Pre-Launch
           </div>
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border border-black ${project.cp_phase === 'production' ? 'bg-black' : ''}`}></div> Production
           </div>
           <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border border-black ${project.cp_phase === 'safe-launch' ? 'bg-black' : ''}`}></div> Safe Launch
           </div>
        </div>

        {/* Info Grid */}
        <div className="border border-black flex">
           {/* Left Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Control Plan Number</div><div>{safeStr(project.cp_number || '-')}</div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Part Number/Latest Change Level</div><div>{safeStr(project.part_number)}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Part Name/Description</div><div>{safeStr(project.name)}</div></div>
              <div className="flex h-8"><div className="w-1/2 border-r border-black p-1"><div className="text-[8px] text-gray-500">Supplier/Plant</div><div>Internal</div></div><div className="w-1/2 p-1"><div className="text-[8px] text-gray-500">Supplier Code</div><div>-</div></div></div>
           </div>

           {/* Middle Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Key Contact/Phone</div><div>{safeStr(project.key_contact || '-')}</div></div>
              <div className="border-b border-black p-1 h-14 overflow-hidden"><div className="text-[8px] text-gray-500">Core Team</div><div className="text-[9px] leading-tight">{safeStr(project.core_team || '-')}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Supplier/Plant Approval/Date</div><div>-</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval/Date</div><div>{formatDate(project.other_approval)}</div></div>
           </div>

           {/* Right Block */}
           <div className="w-1/3">
              <div className="border-b border-black flex h-8"><div className="w-1/2 border-r border-black p-1"><div className="text-[8px] text-gray-500">Date (Orig.)</div><div>{formatDate(project.cp_date_orig)}</div></div><div className="w-1/2 p-1"><div className="text-[8px] text-gray-500">Date (Rev.)</div><div>{formatDate(project.cp_date_rev)}</div></div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Customer Engineering Approval/Date</div><div>{formatDate(project.customer_eng_approval)}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Customer Quality Approval/Date</div><div>{formatDate(project.customer_quality_approval)}</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval/Date</div><div>{formatDate(project.other_approval)}</div></div>
           </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100 text-center font-bold">
            <th className="border border-black p-1 w-8">Part/ Process<br/>No.</th>
            <th className="border border-black p-1">Process Name/<br/>Operation Desc.</th>
            <th className="border border-black p-1 w-24">Machine,<br/>Device, Jig,<br/>Tools</th>
            <th className="border border-black p-1 w-6">No.</th>
            <th className="border border-black p-1">Product</th>
            <th className="border border-black p-1">Process</th>
            <th className="border border-black p-1 w-8">Class</th>
            <th className="border border-black p-1 w-20">Product/Process<br/>Spec/Tol</th>
            <th className="border border-black p-1 w-20">Eval/Meas<br/>Technique</th>
            <th className="border border-black p-1 w-8">Size</th>
            <th className="border border-black p-1 w-8">Freq</th>
            <th className="border border-black p-1 w-24">Control Method</th>
            <th className="border border-black p-1 w-24">Reaction Plan</th>
            <th className="border border-black p-1 w-16">Owner</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
             // FLATTEN DATA for Rendering
             const cpRows: any[] = [];
             
             // Check if pfmea_records exists and is array
             if (Array.isArray(step.pfmea_records)) {
               step.pfmea_records.forEach((risk: any) => {
                  // Find symbol code manually from Library
                  const sc = scLibrary?.find((x: any) => x.id === risk?.special_char_id)
                  const symbolCode = sc?.symbol_code

                  if (Array.isArray(risk.control_plan_records) && risk.control_plan_records.length > 0) {
                      risk.control_plan_records.forEach((cp: any) => {
                          cpRows.push({ ...cp, symbolCode });
                      });
                  }
               });
             }
             
             // Ensure at least one row prints per step
             if (cpRows.length === 0) cpRows.push({});

             return cpRows.map((cp: any, index: number) => (
               <tr key={cp.id || `${step.id}-${index}`}>
                 {index === 0 && (
                   <>
                     <td className="border border-black p-1 text-center align-top font-bold bg-gray-50" rowSpan={cpRows.length}>
                       {safeStr(step.step_number)}
                     </td>
                     <td className="border border-black p-1 align-top uppercase" rowSpan={cpRows.length}>
                       {safeStr(step.description)}
                     </td>
                     <td className="border border-black p-1 align-top" rowSpan={cpRows.length}>
                       {safeStr(step.machine_tools)}
                     </td>
                   </>
                 )}
                 <td className="border border-black p-1 text-center">{index + 1}</td>
                 <td className="border border-black p-1">{safeStr(cp.characteristic_product)}</td>
                 <td className="border border-black p-1">{safeStr(cp.characteristic_process)}</td>
                 <td className="border border-black p-1 text-center">
                    {cp.symbolCode && <SpecialSymbol code={cp.symbolCode} />}
                 </td>
                 <td className="border border-black p-1">{safeStr(cp.specification_tolerance)}</td>
                 <td className="border border-black p-1">{safeStr(cp.eval_measurement_technique)}</td>
                 <td className="border border-black p-1 text-center">{safeStr(cp.sample_size)}</td>
                 <td className="border border-black p-1 text-center">{safeStr(cp.sample_freq)}</td>
                 <td className="border border-black p-1">{safeStr(cp.control_method)}</td>
                 <td className="border border-black p-1">{safeStr(cp.reaction_plan)}</td>
                 <td className="border border-black p-1">{safeStr(cp.reaction_owner)}</td>
               </tr>
             ));
          })}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}