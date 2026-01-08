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
      <table className="w-full border-collapse border border-black text-xs mb-4">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-12">Step</th>
            <th className="border border-black p-2">Process / Operation Name</th>
            <th className="border border-black p-2 w-24">Symbol</th>
            <th className="border border-black p-2 w-10">SC</th>
            <th className="border border-black p-2 w-48">Remarks / Freq</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step, index) => {
            const isLast = index === (steps.length - 1);
            const isInspection = step.symbol_type === 'inspection';
            
            return (
              <tr key={step.id}>
                {/* 1. Step Number */}
                <td className="border border-black p-2 text-center font-bold align-middle">{step.step_number}</td>
                
                {/* 2. Description */}
                <td className="border border-black p-2 uppercase align-middle">
                  <RichText content={step.description} />
                </td>

                {/* 3. SYMBOL COLUMN (With Logic) */}
                <td className="border border-black p-0 h-[80px] align-middle relative overflow-visible">
                   
                   {/* Top Line */}
                   {index > 0 && (
                     <div 
                       className="absolute left-1/2 top-0 w-[1px] bg-black -translate-x-1/2 z-0" 
                       style={{ height: '50%' }}
                     ></div>
                   )}
                   
                   {/* Bottom Line */}
                   {!isLast && (
                     <div 
                       className="absolute left-1/2 top-1/2 w-[1px] bg-black -translate-x-1/2 z-0" 
                       style={{ height: '50%' }}
                     ></div>
                   )}

                   {/* OK Label (Vertical Flow) */}
                   {isInspection && !isLast && (
                      <div className="absolute left-[60%] bottom-[5%] text-[9px] font-bold bg-white px-0.5 z-20">OK</div>
                   )}

                   {/* --- NG / REJECT BRANCH LOGIC --- */}
                   {isInspection && (
                     <>
                        {/* 1. Horizontal Line going Left */}
                        <div className="absolute top-1/2 right-[50%] w-8 h-[1px] bg-black z-0"></div>
                        
                        {/* 2. NG Label */}
                        <div className="absolute top-[32%] right-[65%] text-[9px] font-bold bg-white px-0.5 z-20">NG</div>

                        {/* 3. Small Decision Diamond */}
                        <div className="absolute top-1/2 right-[calc(50%+32px)] w-3 h-3 border border-black bg-white transform -translate-y-1/2 translate-x-1/2 rotate-45 z-10"></div>

                        {/* 4. Line from Small Diamond to Reject Box */}
                        <div className="absolute top-1/2 right-[calc(50%+32px)] w-4 h-[1px] bg-black z-0"></div>

                        {/* 5. REJECT BOX */}
                        <div className="absolute top-1/2 right-[calc(50%+48px)] transform -translate-y-1/2 bg-black text-white text-[9px] font-bold px-1 py-0.5 z-20">
                          REJECT
                        </div>
                     </>
                   )}

                   {/* The Main Symbol */}
                   <div className="relative z-10 flex justify-center items-center h-full w-full pointer-events-none">
                     <div className="bg-white p-1">
                        <FlowSymbol type={step.symbol_type || 'process'} />
                     </div>
                   </div>
                </td>

                {/* 4. SC Column */}
                <td className="border border-black p-1 text-center align-middle">
                  {step.special_characteristics && (
                    <div className="flex justify-center items-center">
                       <SpecialSymbol code={step.special_characteristics.symbol_code} />
                    </div>
                  )}
                </td>
                
                {/* 5. Remarks */}
                <td className="border border-black p-2 align-middle">
                  <RichText content={step.remarks} />
                </td>
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
          
          {/* Legend */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">KEY CHARACTERISTICS</div>
             <div className="p-2 space-y-1">
               {scLibrary?.map(sc => (
                 <div key={sc.id} className="flex justify-between items-center border-b border-gray-100 last:border-0">
                    <span>{sc.name}</span>
                    <SpecialSymbol code={sc.symbol_code} />
                 </div>
               ))}
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
