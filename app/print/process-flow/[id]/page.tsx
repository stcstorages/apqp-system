import { createClient } from '@/utils/supabase/server'

// Simple date formatter
const formatDate = (dateStr: any) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB')
  } catch (e) {
    return '-'
  }
}

export default async function ProcessFlowPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. Fetch Project (Basic)
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  if (projError || !project) {
    return <div>Error loading project.</div>
  }

  // 2. Fetch Steps (Basic)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*') // Simple select, no joins
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 3. Fetch Library (To get text names)
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 text-xs font-sans">
      {/* CSS for Print */}
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 4px; }
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-4 border border-black p-2">
        <h1 className="text-xl font-bold text-center mb-2">PROCESS FLOW (BASIC)</h1>
        <div className="grid grid-cols-2 gap-4">
           <div><strong>Project:</strong> {project.name}</div>
           <div><strong>Customer:</strong> {project.customer}</div>
           <div><strong>Part No:</strong> {project.part_number}</div>
           <div><strong>Date:</strong> {formatDate(project.created_at)}</div>
        </div>
      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr className="bg-gray-100">
            <th className="w-16">Step</th>
            <th>Description</th>
            <th className="w-20">Symbol</th>
            <th className="w-20">SC</th>
            <th className="w-32">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
            // Find SC Name (Text only)
            const sc = scLibrary?.find((x: any) => x.id === step.special_char_id)
            
            return (
              <tr key={step.id}>
                <td className="text-center font-bold">{step.step_number}</td>
                <td>{step.description}</td>
                <td className="text-center capitalize">{step.symbol_type || 'process'}</td>
                <td className="text-center">{sc?.symbol_code ? '(SC)' : ''}</td>
                <td>{step.remarks}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4 text-center text-gray-500">
         Basic Print View - Generated {new Date().toLocaleDateString()}
      </div>

      {/* Auto Print */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}