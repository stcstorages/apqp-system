import { createClient } from '@/utils/supabase/server'
import FlowSymbol from '@/app/components/FlowSymbol'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import RichText from '@/app/components/RichText'
import CustomerLogo from '@/app/components/CustomerLogo'

// 1. Safe Date Helper
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
}

// 2. Safe Symbol Extractor
const getSymbolCode = (scData: any) => {
  if (!scData) return null
  if (Array.isArray(scData)) {
    return scData.length > 0 ? scData[0].symbol_code : null
  }
  return scData?.symbol_code || null
}

export default async function ProcessFlowPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // 3. Fetch Project Data (Safe)
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()
  
  if (projError || !project) {
    return (
      <div className="p-10 text-center text-red-600 font-bold border border-red-300 bg-red-50 m-10 rounded">
        System Error: Could not load project data. <br/>
        Please ensure the project exists.
      </div>
    )
  }
  
  // 4. Fetch Customer Logo (Safe)
  let logoUrl = null
  if (project.customer) {
    const { data: customerData } = await supabase
      .from('customers')
      .select('logo_url')
      .eq('name', project.customer)
      .maybeSingle()
      
    if (customerData) logoUrl = customerData.logo_url
  }

  // 5. Fetch Process Steps (Raw Fetch)
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

  // 6. Fetch Legend Library
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans print-container">
      {/* CSS For Print Layout */}
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-border-black { border-color: #000 !important; }
          .no-break { break-inside: avoid; }
        }
      `}</style>

      {/* --- TOP: LOGOS --- */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={project.customer} logoUrl={logoUrl} />
      </div>

      {/* --- HEADER TABLE --- */}
      <div className="border border-black mb-1">
        <div className="border-b border-black font-bold text-lg text-center p-2 uppercase bg-gray-50">
          Process and Inspection Flow Chart
        </div>
        
        {/* Header Labels */}
        <div className="grid grid-cols-5 divide-x divide-black text-center bg-gray-100 font-bold border-b border-black">
          <div className="p-1">MODEL</div>
          <div className="p-1">CUSTOMER</div>
          <div className="p-1">PART NAME</div>
          <div className="p-1">PART NO</div>
          <div className="p-1">DOC. NO.</div>
        </div>
        
        {/* Header Values */}
        <div className="grid grid-cols-5 divide-x divide-black text-center">
          <div className="p-1 min-h-[24px]">{project.model || '-'}</div>
          <div className="p-1">{project.customer || '-'}</div>
          <div className="p-1">{project.name || '-'}</div>
          <div className="p-1">{project.part_number || '-'}</div>
          <div className="p-1">{project.flow_number || '-'}</div>
        </div>
      </div>

      {/* --- MAIN CONTENT TABLE --- */}
      <table className="w-full border-collapse border border-black text-xs mb-4 table-fixed">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-14">Step</th>
            <th className="border border-black p-2 w-48">Process / Operation Name</th>
            {/* Wide Symbol Column for Branching */}
            <th className="border border-black p-2 w-40">Symbol</th>
            <th className="border border-black p-2 w-10">SC</th>
            <th className="border border-black p-2">Remarks / Freq</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step, index) => {
            const isLast = index === ((steps?.length || 1) - 1);
            const isInspection = step.symbol_type === 'inspection';
            const symbolCode = getSymbolCode(step.special_characteristics);

            return (
              <tr key={step.id} className="no-break">
                {/* 1. Step No */}
                <td className="border border-black p-2 text-center font-bold align-middle">
                    {step.step_number || ''}
                </td>
                
                {/* 2. Description */}
                <td className="border border-black p-2 uppercase align-middle break-words whitespace-normal">
                  <RichText content={step.description || ''} />
                </td>

                {/* 3. SYMBOL (The Complex Logic) */}
                <td className="border border-black p-0 h-[80px] align-middle relative overflow-visible">
                   
                   {/* Top Vertical Line */}
                   {index > 0 && (
                     <div className="absolute left-3/4 top-0 w-[1px] bg-black -translate-x-1/2 z-0" style={{ height: '50%' }}></div>
                   )}
                   
                   {/* Bottom Vertical Line */}
                   {!isLast && (
                     <div className="absolute left-3/4 top-1/2 w-[1px] bg-black -translate-x-1/2 z-0" style={{ height: '50%' }}></div>
                   )}

                   {/* OK Label */}
                   {isInspection && !isLast && (
                      <div className="absolute left-[78%] bottom-[5%] text-[8px] font-bold bg-white px-0.5 z-20">OK</div>
                   )}

                   {/* REJECT PATH (Horizontal Left) */}
                   {isInspection && (
                     <>
                        {/* Line from Center to Left Box */}
                        <div className="absolute top-1/2 left-[45px] right-[25%] h-[1px] bg-black z-0"></div>
                        
                        {/* NG Label */}
                        <div className="absolute top-[35%] left-[65px] text-[8px] font-bold bg-white px-0.5 z-20">NG</div>

                        {/* REJECT BOX */}
                        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black text-white text-[8px] font-bold px-2 py-1 z-20 border border-black shadow-sm">
                          REJECT
                        </div>
                     </>
                   )}

                   {/* The Symbol (Centered on 75% line) */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pl-[50%]">
                     <div className="bg-white p-1">
                        <FlowSymbol type={step.symbol_type || 'process'} />
                     </div>
                   </div>
                </td>

                {/* 4. Special Char Symbol */}
                <td className="border border-black p-1 text-center align-middle">
                  {symbolCode && (
                    <div className="flex justify-center items-center">
                       <SpecialSymbol code={symbolCode} />
                    </div>
                  )}
                </td>
                
                {/* 5. Remarks */}
                <td className="border border-black p-2 align-top break-words whitespace-normal">
                  <RichText content={step.remarks || ''} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* --- FOOTER LEGEND --- */}
      <div className="border border-black text-[10px] break-inside-avoid">
        <div className="grid grid-cols-3 divide-x divide-black border-b border-black">
          
          {/* Symbols Legend */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">PROCESS SYMBOLS</div>
             <div className="grid grid-cols-2 gap-1 p-2">
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="start"/></div> Start/End</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="process"/></div> Process</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="inspection"/></div> Insp.</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="storage"/></div> Storage</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="transport"/></div> Delivery</div>
                <div className="flex items-center gap-2"><div className="scale-75"><FlowSymbol type="inprocess"/></div> In-Proc</div>
             </div>
          </div>
          
          {/* SC Legend */}
          <div>
             <div className="bg-gray-100 font-bold p-1 text-center border-b border-black">KEY CHARACTERISTICS</div>
             <div className="p-2 space-y-1">
               {(scLibrary || []).map((sc: any) => (
                 <div key={sc.id} className="flex justify-between items-center border-b border-gray-100 last:border-0">
                    <span>{sc.name}</span>
                    <SpecialSymbol code={sc.symbol_code} />
                 </div>
               ))}
               {(scLibrary?.length === 0) && <div className="text-gray-400 italic">No special characteristics defined.</div>}
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
             <div className="grid grid-cols-3 divide-x divide-black text-center border-t border-black text-[8px] bg-gray-50">
                 <div className="p-1">ENG</div><div className="p-1">QA</div><div className="p-1">HOD</div>
             </div>
          </div>
        </div>
        
        {/* Footer Strip */}
        <div className="flex justify-between p-1 px-2 bg-gray-100 text-[9px]">
           <div>ISSUE NO: 1</div>
           <div>REVISION NO: 0</div>
           <div>DATE: {formatDate(project.flow_date_orig)}</div>
        </div>
      </div>

      {/* Auto Print Script */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}