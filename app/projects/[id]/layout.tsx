import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project basic info for the header
  const { data: project } = await supabase
    .from('projects')
    .select('name, part_number')
    .eq('id', id)
    .single()

  if (!project) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Shared Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">PN: {project.part_number}</p>
          </div>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">← Back to Dashboard</a>
        </div>
      </header>

      {/* Shared Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <Link href={`/projects/${id}`} className="hover:border-blue-500 hover:text-blue-600 border-transparent text-gray-500 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              1. Process Flow
            </Link>
            <Link href={`/projects/${id}/fmea`} className="hover:border-blue-500 hover:text-blue-600 border-transparent text-gray-500 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              2. FMEA (Risk)
            </Link>
            <Link href={`/projects/${id}/control-plan`} className="hover:border-blue-500 hover:text-blue-600 border-transparent text-gray-500 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              3. Control Plan
            </Link>
            <Link href={`/projects/${id}/gantt`} className="hover:border-blue-500 hover:text-blue-600 border-transparent text-gray-500 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
              4. Gantt Chart
            </Link>
          </nav>
        </div>
      </div>

      {/* Dynamic Content Changes Here */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
