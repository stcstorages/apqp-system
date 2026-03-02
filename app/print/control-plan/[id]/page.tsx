import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ControlPlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Safe Project
  const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single()
  if (projError || !project) return <div>Error: Project not found.</div>

  // 2. Safe Logo
  let logoUrl = null
  if (project.customer) {
    const { data: customerData } = await supabase.from('customers').select('logo_url').eq('name', project.customer).maybeSingle()
    logoUrl = customerData?.logo_url
  }

  // 3. Safe Data Fetch (No deep nested join on SC)
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, pfmea_records (*, control_plan_records (*))`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  // 4. Fetch Library
  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } .print-border-black { border-color: #000 !important; } table { font-size: 9px; } }`}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={project.customer || ''} logoUrl={logoUrl} />
      </div>

      <div className="mb-2 text-xs border border-black p-1">
          <div className="font-bold text-center">CONTROL PLAN</div>
          <div className="grid grid-cols-3 gap-4 text-[9px] mt-2">
             <div>CP No: {project.cp_number}</div>
             <div>Part: {project.part_number}</div>
             <div>Date: {formatDate(project.cp_date_orig)}</div>
          </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-gray-200 font-bold">
            <th className="border border-black p-1 w-8">No</th>
            <th className="border border-black p-1">Process</th>
            <th className="border border-black p-1 w-24">Machine</th>
            <th className="border border-black p-1 w-6">#</th>
            <th className="border border-black p-1">Product</th>
            <th className="border border-black p-1">Process</th>
            <th className="border border-black p-1 w-8">Class</th>
            <th className="border border-black p-1 w-16">Spec</th>
            <th className="border border-black p-1 w-16">Eval</th>
            <th className="border border-black p-1 w-8">Size</th>
            <th className="border border-black p-1 w-8">Freq</th>
            <th className="border border-black p-1 w-20">Control</th>
            <th className="border border-black p-1 w-20">Reaction</th>
            <th className="border border-black p-1 w-12">Owner</th>
          </tr>
        </thead>
        <tbody>
          {(steps || []).map((step) => {
             const cpRows: any[] = [];
             step.pfmea_records?.forEach((risk: any) => {
                // Find symbol manually in JS
                const sc = scLibrary?.find((x: any) => x.id === risk.special_char_id)
                const symbolCode = sc?.symbol_code

                risk.control_plan_records?.forEach((cp: any) => {
                    cpRows.push({ ...cp, symbolCode });
                });
             });
             if (cpRows.length === 0) cpRows.push({});

             return cpRows.map((cp: any, index: number) => (
               <tr key={cp.id || `${step.id}-${index}`}>
                 {index === 0 && <td className="border border-black p-1 align-top font-bold" rowSpan={cpRows.length}>{step.step_number}<br/>{step.description}<br/><i>{step.machine_tools}</i></td>}
                 <td className="border border-black p-1 text-center">{index + 1}</td>
                 <td className="border border-black p-1">{cp.characteristic_product || ''}</td>
                 <td className="border border-black p-1">{cp.characteristic_process || ''}</td>
                 <td className="border border-black p-1 text-center">{cp.symbolCode && <SpecialSymbol code={cp.symbolCode} />}</td>
                 <td className="border border-black p-1">{cp.specification_tolerance || ''}</td>
                 <td className="border border-black p-1">{cp.eval_measurement_technique || ''}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_size || ''}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_freq || ''}</td>
                 <td className="border border-black p-1">{cp.control_method || ''}</td>
                 <td className="border border-black p-1">{cp.reaction_plan || ''}</td>
                 <td className="border border-black p-1">{cp.reaction_owner || ''}</td>
               </tr>
             ));
          })}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}