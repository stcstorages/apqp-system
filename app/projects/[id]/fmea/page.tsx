import { createClient } from '@/utils/supabase/server'
import { addFmeaRow, deleteFmeaRow } from '@/app/actions'

export default async function FmeaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Process Stepsss (The Parents)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)') // This connects the data!
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="space-y-8">
      {/* PDF Export Button */}
      <div className="flex justify-end">
        <a 
          href={`/projects/${id}/fmea/print`} 
          target="_blank" 
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Export to PDF
        </a>
      </div>
      
      {/* ... the rest of your existing map loop ... */}
    <div className="space-y-8">
      
      {/* Loop through each Process Step */}
      {steps?.map((step) => (
        <div key={step.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          
          {/* Header: The Process Step info comes from the previous tab automatically */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                OP {step.step_number}
              </span>
              <span className="ml-3 text-lg font-medium text-gray-900">
                {step.description}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Risks Identified: {step.pfmea_records.length}
            </div>
          </div>

          {/* Table of Existing Risks */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effect</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-red-600 uppercase">S</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cause</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-red-600 uppercase">O</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-red-600 uppercase">D</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-black uppercase bg-gray-100">RPN</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {step.pfmea_records.map((risk: any) => (
                  <tr key={risk.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{risk.failure_mode}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{risk.failure_effect}</td>
                    <td className="px-2 py-4 text-sm text-center font-bold text-red-600 bg-red-50">{risk.severity}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{risk.cause}</td>
                    <td className="px-2 py-4 text-sm text-center font-bold text-red-600 bg-red-50">{risk.occurrence}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{risk.current_controls}</td>
                    <td className="px-2 py-4 text-sm text-center font-bold text-red-600 bg-red-50">{risk.detection}</td>
                    <td className="px-4 py-4 text-sm text-center font-black bg-gray-100">
                      {risk.rpn}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <form action={deleteFmeaRow}>
                        <input type="hidden" name="row_id" value={risk.id} />
                        <input type="hidden" name="project_id" value={id} />
                        <button className="text-red-400 hover:text-red-600 font-bold">×</button>
                      </form>
                    </td>
                  </tr>
                ))}

                {/* The "Add New Risk" Row */}
                <tr className="bg-blue-50">
                  <td colSpan={9} className="p-2">
                    <form action={addFmeaRow} className="flex flex-wrap gap-2 items-center">
                      <input type="hidden" name="step_id" value={step.id} />
                      <input type="hidden" name="project_id" value={id} />
                      
                      <input name="failure_mode" placeholder="Failure Mode..." required className="flex-1 min-w-[150px] text-sm border-gray-300 rounded p-1" />
                      <input name="failure_effect" placeholder="Effect..." required className="flex-1 min-w-[150px] text-sm border-gray-300 rounded p-1" />
                      <input name="severity" type="number" min="1" max="10" placeholder="S" required className="w-12 text-center text-sm border-gray-300 rounded p-1" />
                      
                      <input name="cause" placeholder="Cause..." required className="flex-1 min-w-[150px] text-sm border-gray-300 rounded p-1" />
                      <input name="occurrence" type="number" min="1" max="10" placeholder="O" required className="w-12 text-center text-sm border-gray-300 rounded p-1" />
                      
                      <input name="current_controls" placeholder="Controls..." required className="flex-1 min-w-[150px] text-sm border-gray-300 rounded p-1" />
                      <input name="detection" type="number" min="1" max="10" placeholder="D" required className="w-12 text-center text-sm border-gray-300 rounded p-1" />
                      
                      <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-blue-500">
                        SAVE
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {steps?.length === 0 && (
        <div className="text-center py-12 bg-white rounded shadow">
          <p className="text-gray-500">No Process Steps found.</p>
          <a href={`/projects/${id}`} className="text-blue-600 underline">Go to Process Flow</a> to add steps first.
        </div>
      )}
    </div>
  )
}
