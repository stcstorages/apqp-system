import { createClient } from '@/utils/supabase/server'
import { addProcessStep } from '@/app/actions'
import ProcessStepRow from './ProcessStepRow' // Import the new component

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

  // 2. Fetch Special Characteristics Library for the dropdowns
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="space-y-6">
      
      {/* Top Bar: PDF Export Button */}
      <div className="flex justify-end">
        <a 
          href={`/print/process-flow/${id}`} 
          target="_blank" 
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Export to PDF
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add New Step Form */}
        <div className="bg-white p-6 rounded-lg shadow h-fit border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add Process Step</h3>
          <p className="text-xs text-gray-500 mb-4">
            Define the process flow here. Select symbols and special characteristics if applicable.
          </p>
          <form action={addProcessStep} className="space-y-4">
            <input type="hidden" name="project_id" value={id} />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Step No.</label>
                <input name="step_number" required placeholder="10" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Symbol</label>
                <select name="symbol_type" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm bg-white">
                  <option value="start">Start/End</option>
                  <option value="process">Process (○)</option>
                  <option value="inspection">Inspection (◇)</option>
                  <option value="storage">Storage (▽)</option>
                  <option value="transport">Transport (→)</option>
                  <option value="delay">Delay (D)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Operation Description</label>
              <input name="description" required placeholder="e.g. Injection Molding" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
            </div>

            {/* Special Characteristic Dropdown */}
            <div>
               <label className="block text-xs font-bold text-gray-700 uppercase">Special Char.</label>
               <select name="special_char_id" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm bg-white">
                 <option value="">-- None --</option>
                 {scLibrary?.map(sc => (
                   <option key={sc.id} value={sc.id}>{sc.name} - {sc.description}</option>
                 ))}
               </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Remarks / Freq</label>
              <input name="remarks" placeholder="e.g. 100%" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
            </div>

            <button className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-500 shadow-sm">
              Add Step +
            </button>
          </form>
        </div>

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
