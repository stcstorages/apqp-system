import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createProject, signOut } from './actions'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  // Fetch Projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

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
        
        {/* CREATE PROJECT FORM */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Create New Project</h2>
          
          <form action={createProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Project Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
              <input name="name" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. New Model Launch" />
            </div>

            {/* 2. Model */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model</label>
              <input name="model" className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. X70 / Myvi" />
            </div>

            {/* 3. Part Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Name</label>
              <input name="part_name" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Front Coil Spring" />
            </div>

            {/* 4. Part Number */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Number</label>
              <input name="part_number" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. P2-31A" />
            </div>

            {/* 5. Category (Product List) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category (Product)</label>
              <select name="category" className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="Coil Spring">Coil Spring</option>
                <option value="Stabilizer Bar">Stabilizer Bar</option>
                <option value="Shock Absorber">Shock Absorber</option>
                <option value="Assembly">Assembly</option>
                <option value="Machining Product">Machining Product</option>
              </select>
            </div>

            {/* 6. Customer */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer</label>
              <select name="customer" className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="Proton">Proton</option>
                <option value="Perodua">Perodua</option>
                <option value="Honda">Honda</option>
                <option value="Toyota">Toyota</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Kayaba">Kayaba</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
               <button className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded shadow hover:bg-blue-700 transition">
                 Create Project +
               </button>
            </div>
          </form>
        </div>

        {/* PROJECT LIST */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Active Projects</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-100">
            {projects?.length === 0 && <li className="p-8 text-center text-gray-500">No projects found.</li>}
            
            {projects?.map((project) => (
              <li key={project.id} className="hover:bg-gray-50 transition">
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
                    <div className="text-right">
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded border border-blue-100 mb-1">
                        {project.product_type}
                      </span>
                      <p className="text-[10px] text-gray-400">{new Date(project.created_at).toLocaleDateString()}</p>
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
