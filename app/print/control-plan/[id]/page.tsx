import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'

export default async function ControlPlanPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()

  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, pfmea_records (*, control_plan_records (*), special_characteristics(symbol_code))`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Arial, sans-serif; }
          table { font-size: 9px; }
          .print-border-black { border-color: #000 !important; }
        }
      `}</style>

      {/* HEADER - Matches AIAG Format */}
      <div className="mb-2 text-xs">
        <div className="font-bold text-lg text-center mb-2">CONTROL PLAN</div>
        
        {/* Checkboxes Row */}
        <div className="flex gap-8 mb-2 text-[10px]">
           <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> Prototype</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> Pre-Launch</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black bg-black"></div> Production</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> Safe Launch</div>
        </div>

        <div className="border border-black flex">
           {/* Left Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Control Plan Number</div>
                 <div>STCS/CP/{project.part_number}</div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Part Number/Latest Change Level</div>
                 <div>{project.part_number}</div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Part Name/Description</div>
                 <div>{project.name}</div>
              </div>
              <div className="flex h-8">
                 <div className="w-1/2 border-r border-black p-1">
                    <div className="text-[8px] text-gray-500">Supplier/Plant</div>
                    <div>Internal</div>
                 </div>
                 <div className="w-1/2 p-1">
                    <div className="text-[8px] text-gray-500">Supplier Code</div>
                    <div>-</div>
                 </div>
              </div>
           </div>

           {/* Middle Block */}
           <div className="w-1/3 border-r border-black">
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Key Contact/Phone</div>
                 <div>-</div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Core Team</div>
                 <div>-</div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Supplier/Plant Approval/Date</div>
                 <div>-</div>
              </div>
              <div className="p-1 h-8">
                 <div className="text-[8px] text-gray-500">Other Approval/Date</div>
                 <div>-</div>
              </div>
           </div>

           {/* Right Block */}
           <div className="w-1/3">
              <div className="border-b border-black flex h-8">
                 <div className="w-1/2 border-r border-black p-1">
                    <div className="text-[8px] text-gray-500">Date (Orig.)</div>
                    <div>{new Date().toLocaleDateString()}</div>
                 </div>
                 <div className="w-1/2 p-1">
                    <div className="text-[8px] text-gray-500">Date (Rev.)</div>
                    <div>-</div>
                 </div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Customer Engineering Approval/Date</div>
                 <div>-</div>
              </div>
              <div className="border-b border-black p-1 h-8">
                 <div className="text-[8px] text-gray-500">Customer Quality Approval/Date</div>
                 <div>-</div>
              </div>
              <div className="p-1 h-8">
                 <div className="text-[8px] text-gray-500">Other Approval/Date</div>
                 <div>-</div>
              </div>
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
          {steps?.map((step) => {
             const cpRows: any[] = [];
             
             // Gather all CP records from all risks in this step
             step.pfmea_records.forEach((risk: any) => {
                // Pass the symbol code down to the CP row for display
                const symbolCode = risk.special_characteristics?.symbol_code;
                
                if (risk.control_plan_records.length > 0) {
                    risk.control_plan_records.forEach((cp: any) => {
                        cpRows.push({ ...cp, symbolCode }); // Attach symbol
                    });
                }
             });

             if (cpRows.length === 0) cpRows.push({});

             return cpRows.map((cp: any, index: number) => (
               <tr key={cp.id || `${step.id}-${index}`}>
                 {/* Step Info (Merged) */}
                 {index === 0 && (
                   <>
                     <td className="border border-black p-1 text-center align-top font-bold bg-gray-50" rowSpan={cpRows.length}>
                       {step.step_number}
                     </td>
                     <td className="border border-black p-1 align-top uppercase" rowSpan={cpRows.length}>
                       {step.description}
                     </td>
                     <td className="border border-black p-1 align-top" rowSpan={cpRows.length}>
                       {step.machine_tools}
                     </td>
                   </>
                 )}
                 
                 <td className="border border-black p-1 text-center">{index + 1}</td>
                 <td className="border border-black p-1">{cp.characteristic_product || ''}</td>
                 <td className="border border-black p-1">{cp.characteristic_process || ''}</td>
                 
                 {/* Special Characteristic Symbol */}
                 <td className="border border-black p-1 text-center">
                    {cp.symbolCode && <SpecialSymbol code={cp.symbolCode} />}
                 </td>
                 
                 <td className="border border-black p-1">{cp.specification_tolerance || ''}</td>
                 <td className="border border-black p-1">{cp.eval_measurement_technique || ''}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_size || ''}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_freq || ''}</td>
                 <td className="border border-black p-1">{cp.control_method || ''}</td>
                 <td className="border border-black p-1">{cp.reaction_plan || ''}</td>
                 <td className="border border-black p-1">{cp.reaction_owner || ''}</td>
               </tr>
             ));
          })}
        </tbody>
      </table>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
