import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createProject, signOut } from './actions'

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Check if user is logged ins
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">APQP System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <form action={signOut}>
                <button className="text-sm font-medium text-red-600 hover:text-red-500">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        
        {/* Create New Project Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Start New Project</h2>
          <form action={createProject} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. Model X Bumper" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Part Number</label>
              <input name="part_number" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. 123-456-ABC" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <input name="customer" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. Tesla" />
            </div>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Create +
            </button>
          </form>
        </div>

        {/* Project List Sectionss */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Active Projects</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-100">
            {projects?.length === 0 && (
              <li className="p-4 text-center text-gray-500">No projects yet. Create one above!</li>
            )}
            
            {projects?.map((project) => (
              <li key={project.id} className="hover:bg-gray-50 transition">
                <a href={`/projects/${project.id}`} className="flex justify-between gap-x-6 py-5 px-4 block">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-blue-600 underline">{project.name}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        PN: {project.part_number} • Customer: {project.customer}
                      </p>
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm leading-6 text-gray-900 capitalize">Status: {project.status}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  )
}
