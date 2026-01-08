import { createClient } from '@/utils/supabase/server'
import { addFmeaRow } from '@/app/actions'
import FmeaRow from './FmeaRow'

export default async function FmeaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Process Steps + Nested FMEA Records
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 2. Fetch Library
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="space-y-8">
      
      {/* PDF Export Button */}
      <div className="flex justify-end">
        <a 
          href={`/print/fmea/${id}`} 
          target="_blank" 
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Export to PDF
        </a>
      </div>

      {/* Loop through each Process Step */}
      {steps?.map((step) => (
        <div key={step.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          
          {/* Header: Process Step Info */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                OP {step.step_number}
              </span>
              <span className="ml-3 text-lg font-medium text-gray-900">
                {step.description}
              </span>
            </div>
          </div>

          {/* FMEA TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Mode</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effect</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-10">S</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-16">Class</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cause</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-10">O</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-10">D</th>
                  <th className="px-2 py-3 text-center text-xs font-black text-black uppercase bg-gray-200">RPN</th>
                  <th className="px-2 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                {/* EXISTING ROWS (Client Component) */}
                {step.pfmea_records.map((risk: any) => (
                  <FmeaRow 
                    key={risk.id} 
                    risk={risk} 
                    scLibrary={scLibrary || []} 
                    projectId={id}
                  />
                ))}

                {/* ADD NEW ROW (Server Action Form) */}
                <tr className="bg-blue-50 border-t-2 border-blue-100">
                  <td colSpan={10} className="p-2">
                    <form action={addFmeaRow} className="flex gap-1 items-center">
                      <input type="hidden" name="step_id" value={step.id} />
                      <input type="hidden" name="project_id" value={id} />
                      
                      <input name="failure_mode" placeholder="New Failure Mode..." required className="flex-1 text-xs border-blue-300 rounded p-1.5" />
                      <input name="failure_effect" placeholder="Effect..." required className="flex-1 text-xs border-blue-300 rounded p-1.5" />
                      <input name="severity" type="number" min="1" max="10" placeholder="S" className="w-10 text-center text-xs border-blue-300 rounded p-1.5" />
                      
                      <select name="special_char_id" className="w-16 text-xs border-blue-300 rounded p-1.5 bg-white">
                        <option value="">-</option>
                        {scLibrary?.map(sc => (
                          <option key={sc.id} value={sc.id}>{sc.symbol_code === 'circle_double_plus' ? 'S' : 'F'}</option>
                        ))}
                      </select>

                      <input name="cause" placeholder="Cause..." className="flex-1 text-xs border-blue-300 rounded p-1.5" />
                      <input name="occurrence" type="number" min="1" max="10" placeholder="O" className="w-10 text-center text-xs border-blue-300 rounded p-1.5" />
                      <input name="current_controls" placeholder="Control..." className="flex-1 text-xs border-blue-300 rounded p-1.5" />
                      <input name="detection" type="number" min="1" max="10" placeholder="D" className="w-10 text-center text-xs border-blue-300 rounded p-1.5" />
                      
                      <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-blue-500">
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
    </div>
  )
}
