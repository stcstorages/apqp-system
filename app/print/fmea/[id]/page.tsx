import { createClient } from '@/utils/supabase/server'
import StandardFMEA from '@/app/components/templates/fmea/StandardFMEA'

// 1. Fetch Data Once in the Parent
export default async function FmeaPrintRouter({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { format } = await searchParams // Get ?format=... from URL
  const supabase = await createClient()

  // 2. Fetch Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (projError || !project) return <div className="p-10 text-red-600 font-bold">Error loading project.</div>

  // 3. Fetch Logo
  let logoUrl = null
  if (project.customer) {
    const { data: customerData } = await supabase.from('customers').select('logo_url').eq('name', project.customer).maybeSingle()
    if (customerData) logoUrl = customerData.logo_url
  }

  // 4. Fetch Data
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 5. Fetch Library
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  // 6. ROUTING LOGIC
  // If you add a new "ToyotaTemplate.tsx", you import it and add a case here.
  switch (format) {
    case 'landscape_detailed':
      // return <CustomerDetailedTemplate ... />
      return <StandardFMEA project={project} steps={steps} scLibrary={scLibrary} logoUrl={logoUrl} />
      
    case 'portrait_simple':
       // return <PortraitTemplate ... />
       return <StandardFMEA project={project} steps={steps} scLibrary={scLibrary} logoUrl={logoUrl} />

    case 'standard':
    default:
      return <StandardFMEA project={project} steps={steps} scLibrary={scLibrary} logoUrl={logoUrl} />
  }
}