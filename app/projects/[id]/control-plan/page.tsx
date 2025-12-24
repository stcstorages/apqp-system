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

                      {/* Add New CP Record Form */}
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="p-2">
                          <form action={addControlPlanRow} className="flex flex-wrap gap-1">
                            <input type="hidden" name="pfmea_id" value={risk.id} />
                            <input type="hidden" name="project_id" value={id} />

                            <input name="characteristic_product" placeholder="Prod Char" className="w-24 text-xs border rounded p-1" />
                            <input name="characteristic_process" placeholder="Proc Char" className="w-24 text-xs border rounded p-1" />
                            <input name="specification_tolerance" placeholder="Spec" required className="w-20 text-xs border rounded p-1" />
                            <input name="eval_measurement_technique" placeholder="Eval Tech" required className="w-24 text-xs border rounded p-1" />
                            <input name="sample_size" placeholder="Size" required className="w-16 text-xs border rounded p-1" />
                            <input name="sample_freq" placeholder="Freq" required className="w-16 text-xs border rounded p-1" />
                            {/* Auto-fill suggestion based on FMEA control */}
                            <input name="control_method" placeholder="Control Method" defaultValue={risk.current_controls} required className="w-32 text-xs border border-blue-300 rounded p-1" />
                            <input name="reaction_plan" placeholder="Reaction" required className="flex-1 text-xs border rounded p-1" />
                            
                            <button className="bg-green-600 text-white text-xs font-bold px-3 rounded hover:bg-green-500">
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
