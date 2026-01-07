import { createClient } from '@/utils/supabase/server'
import FlowSymbol from '@/app/components/FlowSymbol'

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
    .select('*')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans print-container">
      {/* HEADER SECTION */}
      <div className="border border-black mb-1">
        <div className="border-b border-black font-bold text-lg text-center p-2 uppercase tracking-wide">
          Process and Inspection Flow Chart
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center">
          <div className="bg-gray-100 font-bold p-1">MODEL</div>
          <div className="bg-gray-100 font-bold p-1">CUSTOMER</div>
          <div className="bg-gray-100 font-bold p-1">PART NAME</div>
          <div className="bg-gray-100 font-bold p-1">PART NO</div>
          <div className="bg-gray-100 font-bold p-1">DOC. NO.</div>
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center border-t border-black">
          <div className="p-1 min-h-[30px] flex items-center justify-center">N/A</div>
          <div className="p-1 flex items-center justify-center">{project.customer}</div>
          <div className="p-1 flex items-center justify-center">{project.name}</div>
          <div className="p-1 flex items-center justify-center">{project.part_number}</div>
          <div className="p-1 flex items-center justify-center">STCS/PF/{project.part_number}</div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <table className="w-full border-collapse border border-black text-xs mb-4">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border border-black p-2 w-16">Step</th>
            <th className="border border-black p-2">Process / Operation Name</th>
            <th className="border border-black p-2 w-16">Symbol</th>
            <th className="border border-black p-2 w-32">Characteristics</th>
            <th className="border border-black p-2 w-32">Remarks / Freq</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step) => (
            <tr key={step.id}>
              <td className="border border-black p-2 text-center font-bold">{step.step_number}</td>
              <td className="border border-black p-2 uppercase relative">
                {step.description}
                {/* Visual Line Connector */}
                <div className="absolute left-[-10px] top-1/2 w-2 h-[1px] bg-black hidden print:block"></div>
              </td>
              <td className="border border-black p-1 text-center">
                 {/* This uses the Component we made in Step 2 */}
                 <FlowSymbol type={step.symbol_type || 'process'} />
              </td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER LEGEND */}
      <div className="border border-black text-[10px]">
        
        {/* Legend Grid */}
        <div className="grid grid-cols-3 divide-x divide-black border-b border-black">
          {/* Col 1: Symbols */}
          <div>
            <div className="grid grid-cols-2 divide-x divide-y divide-black border-b border-black">
              <div className="bg-gray-100 font-bold p-1 text-center">ITEM</div>
              <div className="bg-gray-100 font-bold p-1 text-center">SYMBOL</div>
            </div>
            {[
              { label: 'START/END', type: 'start' },
              { label: 'PROCESS', type: 'process' },
              { label: 'INSPECTION', type: 'inspection' },
              { label: 'STORAGE', type: 'storage' },
              { label: 'DELIVERY', type: 'transport' },
            ].map((item, i) => (
               <div key={i} className="grid grid-cols-2 divide-x divide-black border-b border-black last:border-b-0">
                 <div className="p-1 pl-2">{item.label}</div>
                 <div className="p-0.5"><FlowSymbol type={item.type} /></div>
               </div>
            ))}
          </div>

          {/* Col 2: Frequency / Keys */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">FREQUENCY</div>
             <div className="p-1 text-center">AS PER CP</div>
             <div className="bg-gray-100 font-bold p-1 text-center border-y border-black">KEY CHARACTERISTICS</div>
             <div className="p-2 space-y-1">
               <div className="flex justify-between"><span>Safety</span> <span>(S)</span></div>
               <div className="flex justify-between"><span>Fitment</span> <span>(F)</span></div>
               <div className="flex justify-between"><span>Function</span> <span>(C)</span></div>
             </div>
          </div>

          {/* Col 3: Sign Offs */}
          <div className="flex flex-col">
             <div className="grid grid-cols-3 divide-x divide-black bg-gray-100 font-bold text-center border-b border-black">
                <div className="p-1">PREPARED</div>
                <div className="p-1">CHECKED</div>
                <div className="p-1">APPROVED</div>
             </div>
             <div className="grid grid-cols-3 divide-x divide-black flex-1 min-h-[60px]">
                <div></div>
                <div></div>
                <div></div>
             </div>
             <div className="grid grid-cols-3 divide-x divide-black text-center border-t border-black text-[9px]">
                <div className="p-1">ENG</div>
                <div className="p-1">QA MGR</div>
                <div className="p-1">GM</div>
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

      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
