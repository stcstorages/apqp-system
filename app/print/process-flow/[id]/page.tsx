import { createClient } from '@/utils/supabase/server'

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
    <div className="min-h-screen bg-white text-black p-4 print-container">
      {/* 1. Header */}
      <div className="border-2 border-black mb-4">
        <div className="grid grid-cols-4 divide-x-2 divide-black border-b-2 border-black">
          <div className="col-span-1 p-2 font-bold text-xl flex items-center justify-center bg-gray-100 text-center">
            PROCESS FLOW DIAGRAM
          </div>
          <div className="col-span-3 p-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="font-bold">Project:</span> {project.name}</div>
              <div><span className="font-bold">Part Number:</span> {project.part_number}</div>
              <div><span className="font-bold">Customer:</span> {project.customer}</div>
              <div><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Table */}
      <table className="w-full border-collapse border border-black text-sm">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border border-black p-2 w-24">Step No.</th>
            <th className="border border-black p-2">Operation Description</th>
            <th className="border border-black p-2 w-32">Symbol</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step) => (
            <tr key={step.id}>
              <td className="border border-black p-2 text-center font-bold">{step.step_number}</td>
              <td className="border border-black p-2">{step.description}</td>
              <td className="border border-black p-2 text-center text-gray-400">
                 {/* Placeholder for flowchart symbols (Circle/Square) */}
                 ○
              </td>
            </tr>
          ))}
          {steps?.length === 0 && (
             <tr>
                 <td colSpan={3} className="border border-black p-4 text-center italic">No process steps defined.</td>
             </tr>
          )}
        </tbody>
      </table>

      {/* 3. Auto-Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
