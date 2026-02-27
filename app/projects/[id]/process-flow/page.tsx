import { createClient } from '@/utils/supabase/server'
import ProcessStepRow from './ProcessStepRow'
import AddStepForm from './AddStepForm'
import ExportPdfButton from '@/app/components/ExportPdfButton'

export default async function ProcessFlowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Steps
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 2. Fetch Library
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="space-y-6">
      
      {/* Top Bar: PDF Export Button (Client Component) */}
      <div className="flex justify-end">
        <ExportPdfButton url={`/print/process-flow/${id}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add New Step Form (Client Component) */}
        <AddStepForm projectId={id} />

        {/* RIGHT COLUMN: Editable List */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden border border-gray-200">
           <div className="bg-gray-50 p-3 border-b border-gray-200 flex text-xs font-bold text-gray-500 uppercase gap-2 items-center">
             <div className="w-12 text-center">Step</div>
             <div className="w-20 text-center">Symbol</div>
             <div className="flex-1">Description / SC / Remarks</div>
             <div className="w-16 text-center">Action</div>
           </div>
           
           <ul className="divide-y divide-gray-200 max-h-[700px] overflow-y-auto">
             {steps?.length === 0 && (
                <li className="p-8 text-center text-gray-400 italic">No steps added yet. Use the form on the left.</li>
             )}

             {/* Render the Client Component for each row */}
             {steps?.map((step) => (
               <ProcessStepRow 
                 key={step.id} 
                 step={step} 
                 scLibrary={scLibrary || []} 
                 projectId={id}
               />
             ))}
           </ul>
        </div>
      </div>
    </div>
  )
}