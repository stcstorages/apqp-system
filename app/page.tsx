import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createProject, signOut } from './actions'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">APQP Dashboard</h1>
      <form action={signOut}><button className="text-red-500 underline">Sign Out</button></form>
      
      <div className="mt-8 border p-4 rounded bg-white shadow">
        <h2 className="font-bold mb-4">New Project</h2>
        <form action={createProject} className="flex gap-2">
          <input name="name" placeholder="Project Name" className="border p-2 rounded" required />
          <input name="part_number" placeholder="Part Number" className="border p-2 rounded" />
          <input name="customer" placeholder="Customer" className="border p-2 rounded" />
          <button className="bg-blue-600 text-white p-2 rounded">Create</button>
        </form>
      </div>

      <ul className="mt-8 space-y-2">
        {projects?.map((p) => (
          <li key={p.id} className="p-4 bg-white shadow rounded border">
            <strong>{p.name}</strong> ({p.customer}) - {p.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
