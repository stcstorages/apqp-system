import { createClient } from '@/utils/supabase/server'
import FlowSymbol from '@/app/components/FlowSymbol'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import RichText from '@/app/components/RichText'

export default async function ProcessFlowPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`
      *,
      special_characteristics (
        name,
        symbol_code,
        description
      )
    `)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans print-container">
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-border-black { border-color: #000 !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="border border-black mb-1">
        <div className="border-b border-black font-bold text-lg text-center p-2 uppercase">
          Process and Inspection Flow Chart
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center bg-gray-100 font-bold border-b border-black">
          <div className="p-1">MODEL</div>
          <div className="p-1">CUSTOMER</div>
          <div className="p-1">PART NAME</div>
          <div className="p-1">PART NO</div>
          <div className="p-1">DOC. NO.</div>
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center">
          <div className="p-1">N/A</div>
          <div className="p-1">{project.customer}</div>
          <div className="p-1">{project.name}</div>
          <div className="p-1">{project.part_number}</div>
          <div className="p-1">STCS/PF/{project.part_number}</div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black text-xs mb-4 table-fixed">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-10">Step</th>
            <th className="border border-black p-2 w-48">Process / Operation Name</th>
            <th className="border border-black p-2 w-36">Symbol</th>
            <th className="border border-black p-2 w-10">SC</th>
            <th className="border border-black p-2">Remarks / Freq</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step, index) => {
            const isLast = index === (steps.length - 1);
            // Check for both Inspection AND In-Process Inspection for branching logic?
            // Usually only pure 'inspection' is a decision gate (Reject).
            // 'In-process' usually flows through. Let's assume only 'inspection' is a gate for now.
            const isInspection = step.symbol_type === 'inspection';
            
            return (
              <tr key={step.id}>
                <td className="border border-black p-2 text-center font-bold align-middle">{step.step_number}</td>
                
                <td className="border border-black p-2 uppercase align-middle break-words whitespace-normal">
                  <RichText content={step.description} />
                </td>

                {/* SYMBOL COLUMN */}
                <td className="border border-black p-0 h-[80px] align-middle relative overflow-visible">
                   
                   {/* Top Line */}
                   {index > 0 && (
                     <div 
                       className="absolute left-3/4 top-0 w-[1px] bg-black -translate-x-1/2 z-0" 
                       style={{ height: '50%' }}
                     ></div>
                   )}
                   
                   {/* Bottom Line */}
                   {!isLast && (
                     <div 
                       className="absolute left-3/4 top-1/2 w-[1px] bg-black -translate-x-1/2 z-0" 
                       style={{ height: '50%' }}
                     ></div>
                   )}

                   {/* OK Label */}
                   {isInspection && !isLast && (
                      <div className="absolute left-[78%] bottom-[5%] text-[8px] font-bold bg-white px-0.5 z-20">OK</div>
                   )}

                   {/* REJECT LOGIC */}
                   {isInspection && (
                     <>
                        <div className="absolute top-1/2 left-[45px] right-[25%] h-[1px] bg-black z-0"></div>
                        <div className="absolute top-[35%] left-[55px] text-[8px] font-bold bg-white px-0.5 z-20">NG</div>
                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black text-white text-[8px] font-bold px-2 py-1 z-20 border border-black shadow-sm">
                          REJECT
                        </div>
                     </>
                   )}

                   {/* The Symbol */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pl-[50%]">
                     <div className="bg-white p-1">
                        <FlowSymbol type={step.symbol_type || 'process'} />
                     </div>
                   </div>
                </td>

                <td className="border border-black p-1 text-center align-middle">
                  {step.special_characteristics && (
                    <div className="flex justify-center items-center">
                       <SpecialSymbol code={step.special_characteristics.symbol_code} />
                    </div>
                  )}
                </td>
                
                <td className="border border-black p-2 align-top break-words whitespace-normal">
                  <RichText content={step.remarks} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* FOOTER LEGEND */}
      <div className="border border-black text-[10px] break-inside-avoid">
        {/* HEADER ROW FOR LEGEND */}
        <div className="grid grid-cols-3 divide-x divide-black border-b border-black font-bold bg-gray-100 text-center">
           <div className="p-1">ITEM</div>
           <div className="p-1">SYMBOL</div>
           <div className="p-1">KEY CHARACTERISTICS</div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-black">
          {/* Col 1: Item Names */}
          <div className="flex flex-col text-center divide-y divide-black">
             <div className="p-1">START</div>
             <div className="p-1">PROCESS</div>
             <div className="p-1">INSPECTION</div>
             <div className="p-1">INPROSCESS INSP</div>
             <div className="p-1">STORAGE</div>
             <div className="p-1">DELIVERY/END</div>
          </div>

          {/* Col 2: Symbols */}
          <div className="flex flex-col items-center justify-center divide-y divide-black w-full">
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="start"/></div>
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="process"/></div>
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="inspection"/></div>
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="inprocess"/></div>
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="storage"/></div>
             <div className="p-1 w-full flex justify-center"><FlowSymbol type="delivery"/></div>
          </div>

          {/* Col 3: Key Characteristics & Signatures */}
          <div className="flex flex-col">
             <div className="p-2 space-y-2 flex-1 border-b border-black">
               {scLibrary?.map(sc => (
                 <div key={sc.id} className="flex justify-between items-center px-4">
                    <span>{sc.name}</span>
                    <SpecialSymbol code={sc.symbol_code} />
                 </div>
               ))}
             </div>
             
             {/* Signatures */}
             <div className="grid grid-cols-3 divide-x divide-black bg-gray-100 font-bold text-center border-b border-black">
                <div className="p-1">PREPARED</div>
                <div className="p-1">CHECKED</div>
                <div className="p-1">APPROVED</div>
             </div>
             <div className="grid grid-cols-3 divide-x divide-black min-h-[50px]">
                <div></div><div></div><div></div>
             </div>
          </div>
        </div>
        
        <div className="flex justify-between p-1 px-2 bg-gray-100 text-[9px] border-t border-black">
           <div>ISSUE NO: 1</div>
           <div>REVISION NO: 0</div>
           <div>DATE: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
