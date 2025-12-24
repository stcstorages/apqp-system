import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ProjectHub({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch basic stats to make the cards look "live"
  const { count: stepCount } = await supabase.from('process_steps').select('*', { count: 'exact', head: true }).eq('project_id', id)
  const { count: taskCount } = await supabase.from('gantt_tasks').select('*', { count: 'exact', head: true }).eq('project_id', id)

  return (
    <div className="space-y-8">
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Project Overview</h2>
        <p className="text-gray-500">Select a module below to begin working on the documentation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Process Flow */}
        <Link href={`/projects/${id}/process-flow`} className="group block">
          <div className="h-full bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                {/* Flowchart Icon */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">1. Process Flow</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Define the manufacturing steps, operations, and flow sequence.</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {stepCount || 0} Steps Defined
            </span>
          </div>
        </Link>

        {/* Card 2: FMEAs */}
        <Link href={`/projects/${id}/fmea`} className="group block">
          <div className="h-full bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-red-500 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                {/* Shield/Warning Icon */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">2. FMEA (Risk)</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Identify failure modes, effects, and calculate Risk Priority Numbers (RPN).</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              Risk Analysis
            </span>
          </div>
        </Link>

        {/* Card 3: Control Plan */}
        <Link href={`/projects/${id}/control-plan`} className="group block">
          <div className="h-full bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                {/* Checklist Icon */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">3. Control Plan</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Define characteristics, evaluation methods, and reaction plans.</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              Quality Assurance
            </span>
          </div>
        </Link>

        {/* Card 4: Gantt Chart */}
        <Link href={`/projects/${id}/gantt`} className="group block">
          <div className="h-full bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-purple-500 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
                {/* Calendar Icon */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">4. Gantt Chart</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Track project milestones, timeline dependencies, and critical paths.</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {taskCount || 0} Tasks Active
            </span>
          </div>
        </Link>

      </div>
    </div>
  )
}
