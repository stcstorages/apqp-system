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
        <div key={step.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
          
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
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1800px' }}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Failure Mode</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Effect</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-8 border-r">S</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-12 border-r">Cls</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Cause</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] bg-yellow-50 border-r">Prevention</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-8 border-r">O</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Detection</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase w-8 border-r">D</th>
                  <th className="px-2 py-3 text-center text-xs font-black text-black uppercase bg-gray-200 min-w-[40px] border-r">RPN</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Rec. Action</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px] border-r">Resp</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px] border-r">Action Taken</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-8 border-r">S</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-8 border-r">O</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-8 border-r">D</th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase min-w-[40px] border-r">RPN</th>
                  <th className="px-2 py-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                {/* EXISTING ROWS */}
                {step.pfmea_records.map((risk: any) => (
                  <FmeaRow 
                    key={risk.id} 
                    risk={risk} 
                    scLibrary={scLibrary || []} 
                    projectId={id}
                  />
                ))}

                {/* 
                   ADD NEW ROW FORM 
                   We use 'form={id}' attribute to allow inputs to be in separate TDs 
                */}
                <tr className="bg-blue-50 border-t-2 border-blue-100">
                  {/* Hidden Form Definition */}
                  <td className="hidden">
                    <form id={`add-form-${step.id}`} action={addFmeaRow}>
                      <input type="hidden" name="step_id" value={step.id} />
                      <input type="hidden" name="project_id" value={id} />
                    </form>
                  </td>

                  {/* 1. Failure Mode */}
                  <td className="p-0 border-r min-w-[150px]">
                    <textarea form={`add-form-${step.id}`} name="failure_mode" placeholder="New Failure Mode..." required className="w-full h-full border-0 bg-transparent p-2 text-xs min-h-[50px] resize-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>
                  
                  {/* 2. Effect */}
                  <td className="p-0 border-r min-w-[150px]">
                    <textarea form={`add-form-${step.id}`} name="failure_effect" placeholder="Effect..." required className="w-full h-full border-0 bg-transparent p-2 text-xs min-h-[50px] resize-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>
                  
                  {/* 3. S */}
                  <td className="p-0 border-r w-8">
                    <input form={`add-form-${step.id}`} name="severity" type="number" min="1" max="10" placeholder="S" className="w-full h-full border-0 bg-transparent text-center text-xs font-bold focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>
                  
                  {/* 4. Class */}
                  <td className="p-0 border-r w-12">
                    <select form={`add-form-${step.id}`} name="special_char_id" className="w-full h-full border-0 bg-transparent text-center text-[10px] focus:ring-1 focus:ring-blue-500 text-blue-800">
                      <option value="">-</option>
                      {scLibrary?.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.symbol_code === 'circle_double_plus' ? 'S' : 'F'}</option>
                      ))}
                    </select>
                  </td>

                  {/* 5. Cause */}
                  <td className="p-0 border-r min-w-[150px]">
                    <textarea form={`add-form-${step.id}`} name="cause" placeholder="Cause..." className="w-full h-full border-0 bg-transparent p-2 text-xs min-h-[50px] resize-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>

                  {/* 6. Prevention */}
                  <td className="p-0 border-r min-w-[150px] bg-yellow-50/50">
                    <textarea form={`add-form-${step.id}`} name="control_prevention" placeholder="Prevention..." className="w-full h-full border-0 bg-transparent p-2 text-xs min-h-[50px] resize-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>

                  {/* 7. O */}
                  <td className="p-0 border-r w-8">
                    <input form={`add-form-${step.id}`} name="occurrence" type="number" min="1" max="10" placeholder="O" className="w-full h-full border-0 bg-transparent text-center text-xs font-bold focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>

                  {/* 8. Detection */}
                  <td className="p-0 border-r min-w-[150px]">
                    <textarea form={`add-form-${step.id}`} name="current_controls" placeholder="Detection..." className="w-full h-full border-0 bg-transparent p-2 text-xs min-h-[50px] resize-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>

                  {/* 9. D */}
                  <td className="p-0 border-r w-8">
                    <input form={`add-form-${step.id}`} name="detection" type="number" min="1" max="10" placeholder="D" className="w-full h-full border-0 bg-transparent text-center text-xs font-bold focus:ring-1 focus:ring-blue-500 placeholder-blue-300" />
                  </td>

                  {/* 10. RPN (Empty for new) */}
                  <td className="p-1 border-r bg-gray-50 min-w-[40px]"></td>

                  {/* 11-13. Actions (Optional for new row) */}
                  <td className="p-0 border-r min-w-[150px]"><textarea form={`add-form-${step.id}`} name="recommended_actions" placeholder="Rec. Action" className="w-full h-full border-0 bg-transparent p-2 text-xs resize-none placeholder-gray-300" /></td>
                  <td className="p-0 border-r min-w-[100px]"><textarea form={`add-form-${step.id}`} name="responsibility" placeholder="Resp." className="w-full h-full border-0 bg-transparent p-2 text-xs resize-none placeholder-gray-300" /></td>
                  <td className="p-0 border-r min-w-[150px]"><textarea form={`add-form-${step.id}`} name="action_taken" placeholder="Action Taken" className="w-full h-full border-0 bg-transparent p-2 text-xs resize-none placeholder-gray-300" /></td>

                  {/* 14-17. Results */}
                  <td className="p-0 border-r w-8 bg-gray-50"></td>
                  <td className="p-0 border-r w-8 bg-gray-50"></td>
                  <td className="p-0 border-r w-8 bg-gray-50"></td>
                  <td className="p-0 border-r min-w-[40px] bg-gray-50"></td>

                  {/* Button */}
                  <td className="p-1 text-center align-middle">
                    <button 
                      type="submit" 
                      form={`add-form-${step.id}`}
                      className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow hover:bg-blue-500 w-full"
                    >
                      ADD
                    </button>
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
