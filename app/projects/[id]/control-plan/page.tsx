import { createClient } from '@/utils/supabase/server'
import { addControlPlanRow, updateProcessStep } from '@/app/actions'
import ControlPlanRow from './ControlPlanRow'

export default async function ControlPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Data
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`
      *,
      pfmea_records (
        *,
        control_plan_records (*)
      )
    `)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="space-y-8">
      
      {/* PDF Export Button */}
      <div className="flex justify-end">
        <a 
          href={`/print/control-plan/${id}`} 
          target="_blank" 
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Export to PDF
        </a>
      </div>

      {/* Loop through Process Steps */}
      {steps?.map((step) => (
        <div key={step.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
          
          {/* STEP HEADER + MACHINE INPUT */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-4">
             <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                OP {step.step_number}
             </span>
             <h2 className="text-lg font-bold text-gray-900 flex-1">{step.description}</h2>
             
             {/* Machine / Tools Input (Saved to Process Step) */}
             <form action={updateProcessStep} className="flex items-center gap-2">
                <input type="hidden" name="step_id" value={step.id} />
                <input type="hidden" name="project_id" value={id} />
                <input type="hidden" name="step_number" value={step.step_number} />
                <input type="hidden" name="description" value={step.description} />
                <input type="hidden" name="symbol_type" value={step.symbol_type || 'process'} />
                
                <label className="text-xs font-bold text-gray-500 uppercase">Machine/Tools:</label>
                <input 
                  name="machine_tools" 
                  defaultValue={step.machine_tools || ''} 
                  placeholder="e.g. Injection M/C A" 
                  className="text-xs border border-gray-300 rounded p-1 w-48"
                />
                <button type="submit" className="text-blue-600 hover:bg-blue-100 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button>
             </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-1 text-center" colSpan={2}>Characteristics</th>
                  <th className="border border-gray-300 p-1 text-center w-10" rowSpan={2}>SC</th>
                  <th className="border border-gray-300 p-1 text-center" colSpan={5}>Methods</th>
                  <th className="border border-gray-300 p-1 text-center" colSpan={2}>Reaction Plan</th>
                  <th className="border-b border-gray-300 p-1 w-8" rowSpan={2}></th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-1 text-left w-32">Product</th>
                  <th className="border border-gray-300 p-1 text-left w-32">Process</th>
                  
                  <th className="border border-gray-300 p-1 text-left w-32">Spec/Tol</th>
                  <th className="border border-gray-300 p-1 text-left w-32">Eval/Meas.</th>
                  <th className="border border-gray-300 p-1 text-left w-16">Size</th>
                  <th className="border border-gray-300 p-1 text-left w-16">Freq</th>
                  <th className="border border-gray-300 p-1 text-left w-32">Control Method</th>
                  
                  <th className="border border-gray-300 p-1 text-left w-32">Action</th>
                  <th className="border border-gray-300 p-1 text-left w-24">Owner</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                {/* Loop through Risks to show existing Control Plans */}
                {step.pfmea_records.map((risk: any) => (
                  <>
                    {/* Optional: Show Context Header for the Risk? Usually CP is flat list. 
                        We will just list the CP records. */}
                    {risk.control_plan_records.map((cp: any) => (
                      <ControlPlanRow key={cp.id} cp={cp} projectId={id} />
                    ))}

                    {/* Add Row Form (Per Risk) */}
                    <tr className="bg-blue-50 border-t border-blue-100">
                      {/* Hidden Form */}
                      <td className="hidden">
                        <form id={`add-cp-${risk.id}`} action={addControlPlanRow}>
                          <input type="hidden" name="pfmea_id" value={risk.id} />
                          <input type="hidden" name="project_id" value={id} />
                        </form>
                      </td>

                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="characteristic_product" placeholder="Product Char" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="characteristic_process" placeholder="Process Char" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r bg-gray-50"></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="specification_tolerance" placeholder="Spec" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="eval_measurement_technique" placeholder="Eval Tech" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="sample_size" placeholder="Size" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="sample_freq" placeholder="Freq" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r bg-yellow-50"><input form={`add-cp-${risk.id}`} name="control_method" defaultValue={risk.current_controls} placeholder="Control" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500 font-bold text-blue-900" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="reaction_plan" placeholder="Action" className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-0 border-r"><input form={`add-cp-${risk.id}`} name="reaction_owner" placeholder="Resp." className="w-full h-full border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500" /></td>
                      <td className="p-1 text-center">
                        <button type="submit" form={`add-cp-${risk.id}`} className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded hover:bg-blue-500">ADD</button>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
