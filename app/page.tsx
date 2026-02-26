import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import NewProjectForm from '@/app/components/NewProjectForm'
import DeleteProjectButton from '@/app/components/DeleteProjectButton' // Import Button

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  // 1. Fetch Projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_template', false) // Only real projects
    .order('created_at', { ascending: false })

  // 2. Fetch Customers for the dropdown
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">SIB APQP System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <form action={signOut}><button className="text-sm font-medium text-red-600 hover:text-red-500">Sign out</button></form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* NEW SMART FORM COMPONENT */}
        <NewProjectForm existingCustomers={customers || []} />

        {/* PROJECT LIST */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Active Projects</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-100">
            {projects?.length === 0 && <li className="p-8 text-center text-gray-500">No projects found.</li>}
            
            {projects?.map((project) => (
              <li key={project.id} className="hover:bg-gray-50 transition relative group">
                <a href={`/projects/${project.id}`} className="block px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-blue-600 text-sm">{project.name}</h4>
                      <div className="text-xs text-gray-500 mt-1 space-x-2">
                        <span className="font-semibold text-gray-700">{project.customer}</span>
                        <span>•</span>
                        <span>{project.model || 'No Model'}</span>
                        <span>•</span>
                        <span>{project.part_name || 'No Part Name'}</span>
                        <span>•</span>
                        <span>{project.part_number}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded border border-blue-100 mb-1">
                        {project.product_type}
                      </span>
                      {/* Delete Button Component */}
                      <DeleteProjectButton projectId={project.id} />
                    </div>
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