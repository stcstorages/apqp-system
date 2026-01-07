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
  
  // Fetch steps AND the linked special characteristic info
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

  // Fetch library for the Legend
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans print-container">
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
                
                {/* Description + Connector to Symbol */}
                <td className="border border-black p-2 uppercase relative pr-6">
                  {step.description}
                  {/* Horizontal Line connecting text to center symbol */}
                  <div className="absolute right-0 top-1/2 w-full h-[1px] border-b border-black z-0 pointer-events-none opacity-20 hidden"></div>
                </td>

                {/* SYMBOL COLUMN - Fixed Connector Lines */}
                <td className="border border-black p-0 text-center relative h-[50px] align-middle">
                   
                   {/* Vertical Line: Goes from top to bottom of cell */}
                   {/* We use 'before' and 'after' logic or simple absolute divs */}
                   
                   {/* Top Line (Connects from previous) - Skip for first item */}
                   {index > 0 && (
                     <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-black -translate-x-1/2 z-0"></div>
                   )}
                   
                   {/* Bottom Line (Connects to next) - Skip for last item */}
                   {!isLast && (
                     <div className="absolute bottom-0 left-1/2 w-[1px] h-1/2 bg-black -translate-x-1/2 z-0"></div>
                   )}

                   {/* The Symbol (White BG to hide line passing through it) */}
                   <div className="relative z-10 bg-white inline-block p-1">
                     <FlowSymbol type={step.symbol_type || 'process'} />
                   </div>
                </td>

                <td className="border border-black p-1 text-center">
                  {step.special_characteristics && (
                    <SpecialSymbol code={step.special_characteristics.symbol_code} />
                  )}
                </td>
                <td className="border border-black p-2 text-center">{step.remarks}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* FOOTER LEGEND (Dynamic) */}
      <div className="border border-black text-[10px]">
        <div className="grid grid-cols-3 divide-x divide-black border-b border-black">
          {/* Symbols */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">PROCESS SYMBOLS</div>
             <div className="grid grid-cols-2 gap-1 p-2">
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="start"/></div> Start</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="process"/></div> Process</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="inspection"/></div> Insp.</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="storage"/></div> Storage</div>
             </div>
          </div>
          
          {/* Special Characteristics (Dynamic from DB) */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">KEY CHARACTERISTICS</div>
             <div className="p-2 space-y-1">
               {scLibrary?.map(sc => (
                 <div key={sc.id} className="flex justify-between items-center border-b border-gray-100 last:border-0">
                    <span>{sc.name}</span>
                    <SpecialSymbol code={sc.symbol_code} />
                 </div>
               ))}
               {(!scLibrary || scLibrary.length === 0) && <div className="text-gray-400">No SC defined</div>}
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
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
