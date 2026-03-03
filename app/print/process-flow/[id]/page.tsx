import { createClient } from '@/utils/supabase/server'
// Removed custom components to isolate the error source
// We will render simple HTML/SVG directly in this file for now

export default async function ProcessFlowPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. Fetch Project (Safe)
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()
  
  if (projError || !project) {
    return <div className="p-10 text-red-600">Error: Project not found.</div>
  }

  // 2. Fetch Steps (RAW FETCH ONLY - No Joins)
  // We strictly avoid joining tables to prevent "Object" render errors
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*')
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

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <div className="text-lg font-bold">{project.customer}</div>
      </div>

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
          <div className="p-1">{project.model || '-'}</div>
          <div className="p-1">{project.customer || '-'}</div>
          <div className="p-1">{project.name || '-'}</div>
          <div className="p-1">{project.part_number || '-'}</div>
          <div className="p-1">{project.flow_number || '-'}</div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black text-xs mb-4">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 w-14">Step</th>
            <th className="border border-black p-2">Process / Operation Name</th>
            <th className="border border-black p-2 w-24">Symbol Type</th>
            <th className="border border-black p-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
            // Render PURE TEXT to ensure no object crashes
            return (
              <tr key={step.id}>
                <td className="border border-black p-2 text-center font-bold">
                    {step.step_number || ''}
                </td>
                <td className="border border-black p-2 uppercase">
                  {step.description || ''}
                </td>
                <td className="border border-black p-2 text-center uppercase text-[10px]">
                  {step.symbol_type || 'process'}
                </td>
                <td className="border border-black p-2">
                  {step.remarks || ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-8 text-center text-[10px] text-gray-500">
         Debug Version - Safe Mode
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}