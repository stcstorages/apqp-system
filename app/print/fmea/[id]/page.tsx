import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
}

export default async function FmeaPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*, special_characteristics(symbol_code))')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Arial, sans-serif; }
          .print-border-black { border-color: #000 !important; }
          table { font-size: 8px; }
        }
      `}</style>

      {/* LOGO HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={project.customer} />
      </div>

      <div className="mb-2 text-xs">
        <div className="font-bold text-lg text-center mb-4 uppercase">Potential Failure Mode and Effects Analysis (Process FMEA)</div>
        <div className="border border-black flex">
           {/* ... [KEEP THE SAME GRID HEADER CODE FROM PREVIOUS STEP] ... */}
           {/* For brevity, I am assuming you use the Header Grid code provided in the PREVIOUS response (Step 2 of Header update) */}
           {/* If you lost it, copy the Header Grid block from the previous response here. */}
           {/* Just make sure it is inside this div. */}
           
           {/* Left Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">FMEA Number</div><div>{project.pfmea_number || '-'}</div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Part Number</div><div>{project.part_number}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Part Name/Description</div><div>{project.name}</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Model / Vehicle Ref</div><div>{project.model || '-'}</div></div>
           </div>
           {/* Middle Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Process Responsibility / Key Contact</div><div>{project.key_contact || '-'}</div></div>
              <div className="border-b border-black p-1 h-14 overflow-hidden"><div className="text-[8px] text-gray-500">Core Team</div><div className="text-[9px] leading-tight break-words whitespace-normal">{project.core_team || '-'}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Prepared By</div><div>Internal</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval/Date</div><div>{formatDate(project.other_approval)}</div></div>
           </div>
           {/* Right Block */}
           <div className="w-1/3">
              <div className="border-b border-black flex h-8"><div className="w-1/2 border-r border-black p-1"><div className="text-[8px] text-gray-500">FMEA Date (Orig.)</div><div>{formatDate(project.pfmea_date_orig)}</div></div><div className="w-1/2 p-1"><div className="text-[8px] text-gray-500">FMEA Date (Rev.)</div><div>{formatDate(project.pfmea_date_rev)}</div></div></div>
              <div className="border-b border-black p-1 h-14"><div className="text-[8px] text-gray-500">Customer Engineering Approval/Date</div><div>{formatDate(project.customer_eng_approval)}</div></div>
              <div className="border-b border-black p-1 h-8"><div className="text-[8px] text-gray-500">Customer Quality Approval/Date</div><div>{formatDate(project.customer_quality_approval)}</div></div>
              <div className="p-1 h-8"><div className="text-[8px] text-gray-500">Other Approval/Date</div><div>{formatDate(project.other_approval)}</div></div>
           </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        {/* ... [KEEP THE SAME TABLE CODE FROM PREVIOUS RESPONSE] ... */}
        {/* Copy the entire <table>...</table> block from the previous FMEA code I provided */}
        <thead>
          <tr className="bg-gray-100 text-center font-bold">
            <th className="border border-black p-1" rowSpan={2}>Process Function<br/>Requirements</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Failure Mode</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Effects of Failure</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Sev</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Cls</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Cause(s)</th>
            <th className="border border-black p-1" rowSpan={2}>Current Process Control<br/>Prevention</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Occ</th>
            <th className="border border-black p-1" rowSpan={2}>Current Process Control<br/>Detection</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Det</th>
            <th className="border border-black p-1 w-8" rowSpan={2}>RPN</th>
            <th className="border border-black p-1" rowSpan={2}>Recommended Action(s)</th>
            <th className="border border-black p-1" rowSpan={2}>Responsibility &<br/>Target Date</th>
            <th className="border border-black p-1" colSpan={5}>Action Results</th>
          </tr>
          <tr className="bg-gray-100 text-center font-bold">
            <th className="border border-black p-1">Actions Taken</th>
            <th className="border border-black p-1 w-6">S</th>
            <th className="border border-black p-1 w-6">O</th>
            <th className="border border-black p-1 w-6">D</th>
            <th className="border border-black p-1 w-8">RPN</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step) => {
             const rows = step.pfmea_records.length > 0 ? step.pfmea_records : [{}];
             return rows.map((risk: any, index: number) => (
               <tr key={risk.id || index}>
                 {index === 0 && <td className="border border-black p-1 align-top font-bold bg-gray-50" rowSpan={rows.length}><div className="font-mono text-[9px] mb-1">OP{step.step_number}</div>{step.description}</td>}
                 <td className="border border-black p-1 align-top">{risk.failure_mode || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.failure_effect || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.severity || ''}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.special_characteristics && <SpecialSymbol code={risk.special_characteristics.symbol_code} />}</td>
                 <td className="border border-black p-1 align-top">{risk.cause || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.control_prevention || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.occurrence || ''}</td>
                 <td className="border border-black p-1 align-top">{risk.current_controls || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.detection || ''}</td>
                 <td className="border border-black p-1 text-center font-bold bg-gray-50 align-top">{(risk.severity * risk.occurrence * risk.detection) || ''}</td>
                 <td className="border border-black p-1 align-top">{risk.recommended_actions || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.responsibility || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.action_taken || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_severity || ''}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_occurrence || ''}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_detection || ''}</td>
                 <td className="border border-black p-1 text-center font-bold align-top">{(risk.act_severity * risk.act_occurrence * risk.act_detection) || ''}</td>
               </tr>
             ));
          })}
        </tbody>
      </table>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
