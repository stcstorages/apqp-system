import { createClient } from '@/utils/supabase/server'
import FlowSymbol from '@/app/components/FlowSymbol'
import SpecialSymbol from '@/app/components/SpecialSymbol'

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
      <table className="w-full border-collapse border border-black text-xs mb-4">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-12">Step</th>
            <th className="border border-black p-2">Process / Operation Name</th>
            <th className="border border-black p-2 w-16">Symbol</th>
            <th className="border border-black p-2 w-24">Characteristics</th>
            <th className="border border-black p-2 w-32">Remarks / Freq</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step, index) => {
            const isLast = index === (steps.length - 1);
            
            return (
              <tr key={step.id}>
                <td className="border border-black p-2 text-center font-bold">{step.step_number}</td>
                
                {/* Description Column - CLEANED (No Horizontal Line) */}
                <td className="border border-black p-2 uppercase align-middle">
                  {step.description}
                </td>

                {/* SYMBOL COLUMN - Vertical Lines Only */}
                <td className="border border-black p-0 h-[50px]">
                   <div className="relative h-full w-full flex items-center justify-center">
                     
                     {/* Top Vertical Line */}
                     {index > 0 && (
                       <div className="absolute top-0 left-1/2 h-1/2 border-l border-black -translate-x-1/2" style={{ borderColor: '#000', borderWidth: '0 0 0 1px' }}></div>
                     )}
                     
                     {/* Bottom Vertical Line */}
                     {!isLast && (
                       <div className="absolute bottom-0 left-1/2 h-1/2 border-l border-black -translate-x-1/2" style={{ borderColor: '#000', borderWidth: '0 0 0 1px' }}></div>
                     )}

                     {/* The Symbol (White BG to hide the crossing vertical line) */}
                     <div className="relative z-10 bg-white p-1">
                       <FlowSymbol type={step.symbol_type || 'process'} />
                     </div>
                   </div>
                </td>

                {/* Special Characteristics */}
                <td className="border border-black p-1 text-center">
                  {step.special_characteristics && (
                    <div className="flex justify-center items-center gap-2">
                       <SpecialSymbol code={step.special_characteristics.symbol_code} />
                    </div>
                  )}
                </td>
                
                {/* Remarks */}
                <td className="border border-black p-2 text-center">{step.remarks}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* FOOTER LEGEND */}
      <div className="border border-black text-[10px] break-inside-avoid">
        <div className="grid grid-cols-3 divide-x divide-black border-b border-black">
          {/* Symbols */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">PROCESS SYMBOLS</div>
             <div className="grid grid-cols-2 gap-1 p-2">
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="start"/></div> Start/End</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="process"/></div> Process</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="inspection"/></div> Insp.</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="storage"/></div> Storage</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="transport"/></div> Delivery</div>
             </div>
          </div>
          
          {/* Special Characteristics Legend */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">KEY CHARACTERISTICS</div>
             <div className="p-2 space-y-1">
               {scLibrary?.map(sc => (
                 <div key={sc.id} className="flex justify-between items-center border-b border-gray-100 last:border-0">
                    <span>{sc.name}</span>
                    <SpecialSymbol code={sc.symbol_code} />
                 </div>
               ))}
               {(!scLibrary || scLibrary.length === 0) && <div className="text-gray-400 italic">No SC defined</div>}
             </div>
          </div>

          {/* Signatures */}
          <div className="flex flex-col">
             <div className="grid grid-cols-3 divide-x divide-black bg-gray-100 font-bold text-center border-b border-black">
                <div className="p-1">PREP</div>
                <div className="p-1">CHECK</div>
                <div className="p-1">APPR</div>
             </div>
             <div className="grid grid-cols-3 divide-x divide-black flex-1 min-h-[60px]">
                <div></div><div></div><div></div>
             </div>
          </div>
        </div>
        
        {/* Bottom Strip */}
        <div className="flex justify-between p-1 px-2 bg-gray-100 text-[9px]">
           <div>ISSUE NO: 1</div>
           <div>REVISION NO: 0</div>
           <div>DATE: {new Date().toLocaleDateString()}</div>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
