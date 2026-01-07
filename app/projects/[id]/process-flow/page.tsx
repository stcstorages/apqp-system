import { createClient } from '@/utils/supabase/server'
import { addProcessStep, updateProcessStep, deleteProcessStep } from '@/app/actions'

export default async function ProcessFlowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Steps
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="space-y-6">
      
      {/* PDF Export Button */}
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
        {/* Left: ADD Input Form */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Process Step</h3>
          <p className="text-xs text-gray-500 mb-4">
            Select the correct symbol (Process, Inspection, etc).
          </p>
          <form action={addProcessStep} className="space-y-4">
            <input type="hidden" name="project_id" value={id} />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Step No.</label>
                <input name="step_number" placeholder="10" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Symbol</label>
                <select name="symbol_type" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm sm:text-sm bg-white" defaultValue="process">
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
              <label className="block text-sm font-medium text-gray-700">Operation Description</label>
              <input name="description" placeholder="e.g. Injection Molding" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm sm:text-sm" />
            </div>

            <button className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              Add Step +
            </button>
          </form>
        </div>

        {/* Right: EDIT List */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between text-xs font-bold text-gray-500 uppercase">
            <div className="w-12 text-center">Step</div>
            <div className="w-24 text-center">Symbol</div>
            <div className="flex-1 px-2">Description</div>
            <div className="w-16 text-center">Actions</div>
          </div>
          
          <ul role="list" className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {steps?.length === 0 && (
              <li className="p-8 text-center text-gray-500">No steps defined yet.</li>
            )}

            {steps?.map((step) => (
              <li key={step.id} className="p-2 hover:bg-gray-50 transition duration-150">
                <form action={updateProcessStep} className="flex items-center gap-2">
                  <input type="hidden" name="step_id" value={step.id} />
                  <input type="hidden" name="project_id" value={id} />

                  {/* Editable Step Number */}
                  <input 
                    name="step_number" 
                    defaultValue={step.step_number} 
                    className="w-12 text-center border-gray-300 rounded text-sm p-1 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Editable Symbol Selector - THIS WAS MISSING BEFORE */}
                  <select 
                    name="symbol_type" 
                    defaultValue={step.symbol_type || 'process'} 
                    className="w-24 text-xs border-gray-300 rounded p-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="start">Start/End</option>
                    <option value="process">Process</option>
                    <option value="inspection">Inspection</option>
                    <option value="storage">Storage</option>
                    <option value="transport">Transport</option>
                    <option value="delay">Delay</option>
                  </select>

                  {/* Editable Description */}
                  <input 
                    name="description" 
                    defaultValue={step.description} 
                    className="flex-1 border-gray-300 rounded text-sm p-1 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button type="submit" className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Save Changes">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>

                    <button 
                      formAction={deleteProcessStep} 
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" 
                      title="Delete Step"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
