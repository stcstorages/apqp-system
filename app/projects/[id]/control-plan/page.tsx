import { createClient } from '@/utils/supabase/server'
import { addControlPlanRow, deleteControlPlanRow } from '@/app/actions'

export default async function ControlPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Deeply Nested Data
  // Steps -> FMEA Records -> Control Plan Records
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
    <div className="space-y-12">
      
      {/* Loop through Process Steps */}
      {steps?.map((step) => (
        <div key={step.id}>
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-4 border-b pb-2 border-gray-300">
             <span className="bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded">
                OP {step.step_number}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{step.description}</h2>
          </div>

          <div className="pl-4 border-l-4 border-gray-200 space-y-6">
            
            {/* Loop through FMEA Risks for this Step */}
            {step.pfmea_records.map((risk: any) => (
              <div key={risk.id} className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                
                {/* Risk Context (Read-Only from FMEA) */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-bold text-gray-500">Failure Mode:</span>
                    <span className="ml-1 text-gray-900">{risk.failure_mode}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500">Cause:</span>
                    <span className="ml-1 text-gray-900">{risk.cause}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500">Current Control (FMEA):</span>
                    <span className="ml-1 text-gray-900">{risk.current_controls}</span>
                  </div>
                </div>

                {/* Control Plan Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Char. Product</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Char. Process</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Spec / Tol</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Eval Method</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Size</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Freq</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Control Method</th>
                        <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase">Reaction Plan</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      
                      {/* Existing CP Records */}
                      {risk.control_plan_records.map((cp: any) => (
                        <tr key={cp.id}>
                          <td className="px-2 py-3 text-xs">{cp.characteristic_product}</td>
                          <td className="px-2 py-3 text-xs">{cp.characteristic_process}</td>
                          <td className="px-2 py-3 text-xs">{cp.specification_tolerance}</td>
                          <td className="px-2 py-3 text-xs">{cp.eval_measurement_technique}</td>
                          <td className="px-2 py-3 text-xs">{cp.sample_size}</td>
                          <td className="px-2 py-3 text-xs">{cp.sample_freq}</td>
                          <td className="px-2 py-3 text-xs font-bold text-blue-800 bg-blue-50">{cp.control_method}</td>
                          <td className="px-2 py-3 text-xs text-red-600">{cp.reaction_plan}</td>
                          <td className="px-2 py-3 text-center">
                            <form action={deleteControlPlanRow}>
                              <input type="hidden" name="row_id" value={cp.id} />
                              <input type="hidden" name="project_id" value={id} />
                              <button className="text-gray-400 hover:text-red-600 font-bold">×</button>
                            </form>
                          </td>
                        </tr>
                      ))}

                      {/* Add New CP Record Forms */}
                      {/* Add New CP Record Form - Fixed Alignment */}
                      <tr className="bg-gray-50">
                        {/* We use a form that wraps the whole ROW (using a trick or just inputs) 
                            Standard HTML forms can't wrap a TR directly, so we use the form attribute or wrap inputs. 
                            Next.js Server Actions allow us to wrap the button mainly, but here we wrap individual inputs? 
                            Actually, the cleanest way in React without hydration issues is to make the TR a form, 
                            but browsers don't like <form><tr>...</tr></form>.
                            
                            SOLUTION: We keep the form inside the TR, but use 'display: contents' or just put inputs in TDs 
                            and use the form on the button or wrap the content in a single cell? 
                            
                            No, the previous code had one big TD. 
                            Let's use individual TDs containing inputs, all belonging to one form via the 'form' attribute?
                            No, that's too complex.
                            
                            SIMPLEST FIX: 
                            We put the <form> inside the <tr> but wrapping the TDs is invalid HTML.
                            We will put the <form> around the *button* and use hidden inputs? No.
                            
                            We will use one <form> that wraps the TABLE? No.
                            
                            Let's use the 'form' attribute approach (Modern HTML).
                            We create a unique ID for the form, put the form hidden somewhere, and link inputs to it.
                        */}
                        
                        {/* actually, simpler approach for now: 
                           We put the form inside the specific cells? No.
                           
                           Let's just use the Flex layout effectively or make the form wrap the whole table? 
                           No, we have multiple forms.
                           
                           Let's use the layout: <td class="p-0"><input class="w-full border-none h-full px-2" ... /></td>
                        */}
                         
                         {/* CORRECT APPROACH FOR ALIGNMENT: 
                             Since we can't easily wrap a TR in a form in standard HTML without hydration errors,
                             we will keep the layout simple: 
                             We put the form explicitly inside the LAST cell (the button), 
                             and the other inputs are just 'client' inputs? No, Server Actions need them in the form.
                             
                             Okay, we will use the 'one big cell' approach but use GRID to match columns.
                             OR: We just make the inputs 'w-full' inside standard TDs and use a specific form trick.
                             
                             Wait, the easiest way that works in Next.js Server Actions:
                             Just put the <form> inside the TR? (Browsers might auto-correct this and break it).
                             
                             Let's stick to the visual fix:
                             We will render the inputs inside standard TDs, but we have to wrap them in a <form>.
                             Since we can't wrap a TR, we will make the FORM wrap the *contents* of the cells? No.
                             
                             Let's use the "Grid" layout for the whole table instead of HTML <table>.
                             But rewriting to Grid is big.
                             
                             Let's try the 'form attribute' trick. It is standard HTML5.
                         */}
                         
                         <td className="p-1"><input form={`form-${risk.id}`} name="characteristic_product" placeholder="Prod Char" className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="characteristic_process" placeholder="Proc Char" className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="specification_tolerance" placeholder="Spec" required className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="eval_measurement_technique" placeholder="Eval" required className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="sample_size" placeholder="Size" required className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="sample_freq" placeholder="Freq" required className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="control_method" defaultValue={risk.current_controls} required className="w-full text-xs border border-blue-300 rounded p-1 bg-blue-50" /></td>
                         <td className="p-1"><input form={`form-${risk.id}`} name="reaction_plan" placeholder="Reaction" required className="w-full text-xs border border-gray-300 rounded p-1" /></td>
                         <td className="p-1 text-center">
                           <form id={`form-${risk.id}`} action={addControlPlanRow}>
                             <input type="hidden" name="pfmea_id" value={risk.id} />
                             <input type="hidden" name="project_id" value={id} />
                             <button className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-green-500 w-full">
                               ADD
                             </button>
                           </form>
                         </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {step.pfmea_records.length === 0 && (
               <p className="text-gray-400 italic text-sm">No risks defined in FMEA for this step.</p>
            )}

          </div>
        </div>
      ))}
    </div>
  )
}
