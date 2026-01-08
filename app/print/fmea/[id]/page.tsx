import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'

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
          table { font-size: 8px; } /* Small font for dense data */
        }
      `}</style>

      {/* HEADER - Simplified Version of your Image */}
      <div className="border border-black mb-2 text-xs">
        <div className="flex border-b border-black">
          <div className="bg-gray-200 font-bold p-1 w-24 border-r border-black">Part Name</div>
          <div className="p-1 flex-1">{project.name}</div>
          <div className="bg-gray-200 font-bold p-1 w-24 border-l border-r border-black">FMEA No.</div>
          <div className="p-1 w-32">STCS/PFMEA/{project.part_number}</div>
        </div>
        <div className="flex border-b border-black">
          <div className="bg-gray-200 font-bold p-1 w-24 border-r border-black">Part No.</div>
          <div className="p-1 flex-1">{project.part_number}</div>
          <div className="bg-gray-200 font-bold p-1 w-24 border-l border-r border-black">Page</div>
          <div className="p-1 w-32">1 of 1</div>
        </div>
        <div className="flex">
          <div className="bg-gray-200 font-bold p-1 w-24 border-r border-black">Customer</div>
          <div className="p-1 flex-1">{project.customer}</div>
          <div className="bg-gray-200 font-bold p-1 w-24 border-l border-r border-black">Date</div>
          <div className="p-1 w-32">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead>
          {/* Top Header Row */}
          <tr className="bg-gray-100 text-center font-bold">
            <th className="border border-black p-1" rowSpan={2}>Process Function<br/>Requirements</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Failure Mode</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Effects of Failure</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Sev</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Cls</th>
            <th className="border border-black p-1" rowSpan={2}>Potential Cause(s)</th>
            
            {/* Split Controls */}
            <th className="border border-black p-1" rowSpan={2}>Current Process Control<br/>Prevention</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Occ</th>
            <th className="border border-black p-1" rowSpan={2}>Current Process Control<br/>Detection</th>
            <th className="border border-black p-1 w-6" rowSpan={2}>Det</th>
            <th className="border border-black p-1 w-8" rowSpan={2}>RPN</th>
            
            {/* Actions Section */}
            <th className="border border-black p-1" rowSpan={2}>Recommended Action(s)</th>
            <th className="border border-black p-1" rowSpan={2}>Responsibility &<br/>Target Date</th>
            
            {/* Action Results - Spanning Column */}
            <th className="border border-black p-1" colSpan={5}>Action Results</th>
          </tr>
          
          {/* Sub Header Row for Results */}
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
                 {/* Step Info (Merged) */}
                 {index === 0 && (
                   <td className="border border-black p-1 align-top font-bold bg-gray-50" rowSpan={rows.length}>
                     <div className="font-mono text-[9px] mb-1">OP{step.step_number}</div>
                     {step.description}
                   </td>
                 )}
                 
                 <td className="border border-black p-1 align-top">{risk.failure_mode || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.failure_effect || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.severity || ''}</td>
                 <td className="border border-black p-1 text-center align-top">
                    {risk.special_characteristics && <SpecialSymbol code={risk.special_characteristics.symbol_code} />}
                 </td>
                 <td className="border border-black p-1 align-top">{risk.cause || '-'}</td>
                 
                 {/* Prevention & Occ */}
                 <td className="border border-black p-1 align-top">{risk.control_prevention || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.occurrence || ''}</td>
                 
                 {/* Detection & Det */}
                 <td className="border border-black p-1 align-top">{risk.current_controls || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.detection || ''}</td>
                 
                 {/* RPN */}
                 <td className="border border-black p-1 text-center font-bold bg-gray-50 align-top">
                    {(risk.severity * risk.occurrence * risk.detection) || ''}
                 </td>

                 {/* Actions */}
                 <td className="border border-black p-1 align-top">{risk.recommended_actions || '-'}</td>
                 <td className="border border-black p-1 align-top">{risk.responsibility || '-'}</td>
                 
                 {/* Results */}
                 <td className="border border-black p-1 align-top">{risk.action_taken || '-'}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_severity || ''}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_occurrence || ''}</td>
                 <td className="border border-black p-1 text-center align-top">{risk.act_detection || ''}</td>
                 <td className="border border-black p-1 text-center font-bold align-top">
                    {(risk.act_severity * risk.act_occurrence * risk.act_detection) || ''}
                 </td>
               </tr>
             ));
          })}
        </tbody>
      </table>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
