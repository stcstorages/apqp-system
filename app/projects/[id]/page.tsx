import { createClient } from '@/utils/supabase/server'
import { addProcessStep } from '@/app/actions'

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Input Form */}
      <div className="bg-white p-6 rounded-lg shadow h-fit">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Process Step</h3>
        <form action={addProcessStep} className="space-y-4">
          <input type="hidden" name="project_id" value={id} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Step No.</label>
            <input name="step_number" placeholder="e.g. 10" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm sm:text-sm" />
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

      {/* Right: Flow List */}
      <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Process Flow Chart</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {steps?.map((step) => (
            <li key={step.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  {step.step_number}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
