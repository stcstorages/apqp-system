import { createClient } from '@/utils/supabase/server'
import FlowSymbol from '@/app/components/FlowSymbol'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import RichText from '@/app/components/RichText'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
}

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
  
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()
  
  if (projError || !project) {
    return <div className="p-10 text-red-600">Error loading project: {projError?.message}</div>
  }

  // NOTE: Removed the Customer Table fetch. 
  // The Logo component now handles it automatically based on project.customer string.

  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, special_characteristics (name, symbol_code, description)`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans print-container">
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-border-black { border-color: #000 !important; }
        }
      `}</style>

      {/* LOGO HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         {/* Pass only the name */}
         <CustomerLogo customer={project.customer} />
      </div>

      {/* DOCUMENT HEADER */}
      <div className="border border-black mb-1">
        <div className="border-b border-black font-bold text-lg text-center p-2 uppercase">
          Process and Inspection Flow Chart
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center bg-gray-100 font-bold border-b border-black">
          <div className="p-1">MODEL</div><div className="p-1">CUSTOMER</div><div className="p-1">PART NAME</div><div className="p-1">PART NO</div><div className="p-1">DOC. NO.</div>
        </div>
        <div className="grid grid-cols-5 divide-x divide-black text-center">
          <div className="p-1">{project.model || '-'}</div>
          <div className="p-1">{project.customer}</div>
          <div className="p-1">{project.name}</div>
          <div className="p-1">{project.part_number}</div>
          <div className="p-1">{project.flow_number || '-'}</div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black text-xs mb-4 table-fixed">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-14">Step</th>
            <th className="border border-black p-2 w-48">Process / Operation Name</th>
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
              <tr key={step.id}>
                <td className="border border-black p-2 text-center font-bold align-middle">{step.step_number}</td>
                <td className="border border-black p-2 uppercase align-middle break-words whitespace-normal"><RichText content={step.description} /></td>
                <td className="border border-black p-0 h-[80px] align-middle relative overflow-visible">
                   {index > 0 && <div className="absolute left-3/4 top-0 w-[1px] bg-black -translate-x-1/2 z-0" style={{ height: '50%' }}></div>}
                   {!isLast && <div className="absolute left-3/4 top-1/2 w-[1px] bg-black -translate-x-1/2 z-0" style={{ height: '50%' }}></div>}
                   {isInspection && !isLast && <div className="absolute left-[78%] bottom-[5%] text-[8px] font-bold bg-white px-0.5 z-20">OK</div>}
                   {isInspection && (
                     <>
                        <div className="absolute top-1/2 left-[40px] right-[25%] h-[1px] bg-black z-0"></div>
                        <div className="absolute top-[35%] left-[65px] text-[8px] font-bold bg-white px-0.5 z-20">NG</div>
                        <div className="absolute top-1/2 left-1 transform -translate-y-1/2 bg-black text-white text-[8px] font-bold px-2 py-1 z-20 border border-black shadow-sm">REJECT</div>
                     </>
                   )}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pl-[50%]">
                     <div className="bg-white p-1"><FlowSymbol type={step.symbol_type || 'process'} /></div>
                   </div>
                </td>
                <td className="border border-black p-1 text-center align-middle">
                  {symbolCode && <div className="flex justify-center items-center"><SpecialSymbol code={symbolCode} /></div>}
                </td>
                <td className="border border-black p-2 align-top break-words whitespace-normal"><RichText content={step.remarks} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}