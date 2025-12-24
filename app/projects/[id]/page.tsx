import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { addProcessStep, signOut } from '@/app/actions' // Adjust import path if needed

export default async function ProjectWorkspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Project Details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    return <div>Project not found</div>
  }

  // 2. Fetch Process Steps (The "P" in PFMEA)
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">PN: {project.part_number}</p>
          </div>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">← Back to Dashboard</a>
        </div>
      </header>

      {/* Tabs (Navigation for future steps) */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <span className="border-blue-500 text-blue-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              1. Process Flow
            </span>
            <span className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              2. FMEA (Risk)
            </span>
            <span className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              3. Control Plan
            </span>
            <span className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              4. Gantt Chart
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content: Process Flow Editor */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: Input Form */}
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Process Step</h3>
            <p className="text-xs text-gray-500 mb-4">
              Define the manufacturing steps here. These will automatically populate your PFMEA and Control Plan.
            </p>
            <form action={addProcessStep} className="space-y-4">
              <input type="hidden" name="project_id" value={project.id} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Step No.</label>
                <input name="step_number" placeholder="e.g. 10" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Operation Description</label>
                <input name="description" placeholder="e.g. Injection Molding" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>

              <button className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                Add Step +
              </button>
            </form>
          </div>

          {/* Right: Flow List (The "Interconnected Data" Source) */}
          <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Process Flow Chart</h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {steps?.length === 0 && (
                <li className="p-8 text-center text-gray-500">No steps defined yet.</li>
              )}

              {steps?.map((step) => (
                <li key={step.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {step.step_number}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step.description}</p>
                      <p className="text-xs text-gray-500">ID: {step.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">➔ Flows to FMEA</div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  )
}
