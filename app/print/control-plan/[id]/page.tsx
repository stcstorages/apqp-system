import { createClient } from '@/utils/supabase/server'

export default async function ControlPlanPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()

  // Fetch Deep Data
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, pfmea_records (*, control_plan_records (*))`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      {/* 1. Header */}
      <div className="border-2 border-black mb-4">
        <div className="grid grid-cols-4 divide-x-2 divide-black border-b-2 border-black">
          <div className="col-span-1 p-2 font-bold text-xl flex items-center justify-center bg-gray-100">
            CONTROL PLAN
          </div>
          <div className="col-span-3 p-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="font-bold">Project:</span> {project.name}</div>
              <div><span className="font-bold">Part Number:</span> {project.part_number}</div>
              <div><span className="font-bold">Customer:</span> {project.customer}</div>
              <div><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Table */}
      <table className="w-full border-collapse border border-black text-[10px]">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border border-black p-1">Op No.</th>
            <th className="border border-black p-1">Process Name</th>
            <th className="border border-black p-1">Char. Product</th>
            <th className="border border-black p-1">Char. Process</th>
            <th className="border border-black p-1">Spec / Tol</th>
            <th className="border border-black p-1">Eval Method</th>
            <th className="border border-black p-1">Size</th>
            <th className="border border-black p-1">Freq</th>
            <th className="border border-black p-1">Control Method</th>
            <th className="border border-black p-1">Reaction Plan</th>
          </tr>
        </thead>
        <tbody>
          {steps?.map((step) => {
             // Flatten the structure: Step -> Risks -> Control Plans
             // We need to render a row for every Control Plan Record found under this step.
             
             // Collect all CP records for this step
             const cpRows: any[] = [];
             step.pfmea_records.forEach((risk: any) => {
                if (risk.control_plan_records.length > 0) {
                    risk.control_plan_records.forEach((cp: any) => cpRows.push(cp));
                }
             });

             // If no CP records, show one empty row for the Step
             if (cpRows.length === 0) cpRows.push({});

             return cpRows.map((cp: any, index: number) => (
               <tr key={cp.id || index}>
                 {/* Show Step Info only on first row */}
                 {index === 0 && (
                   <>
                     <td className="border border-black p-1 text-center font-bold" rowSpan={cpRows.length}>
                       {step.step_number}
                     </td>
                     <td className="border border-black p-1" rowSpan={cpRows.length}>
                       {step.description}
                     </td>
                   </>
                 )}
                 
                 <td className="border border-black p-1">{cp.characteristic_product || '-'}</td>
                 <td className="border border-black p-1">{cp.characteristic_process || '-'}</td>
                 <td className="border border-black p-1">{cp.specification_tolerance || '-'}</td>
                 <td className="border border-black p-1">{cp.eval_measurement_technique || '-'}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_size || '-'}</td>
                 <td className="border border-black p-1 text-center">{cp.sample_freq || '-'}</td>
                 <td className="border border-black p-1 font-bold bg-gray-50">{cp.control_method || '-'}</td>
                 <td className="border border-black p-1">{cp.reaction_plan || '-'}</td>
               </tr>
             ));
          })}
        </tbody>
      </table>

      {/* 3. Auto-Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  )
}
