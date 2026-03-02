import { createClient } from '@/utils/supabase/server'
import SpecialSymbol from '@/app/components/SpecialSymbol'
import CustomerLogo from '@/app/components/CustomerLogo'

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getSymbolCode = (scData: any) => {
  if (!scData) return null
  if (Array.isArray(scData)) return scData[0]?.symbol_code || null
  return scData?.symbol_code || null
}

export default async function ControlPlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Safe Project Fetch
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (!project) return <div>Project not found.</div>

  // 2. Fetch Data
  const { data: steps } = await supabase
    .from('process_steps')
    .select(`*, pfmea_records (*, control_plan_records (*), special_characteristics(symbol_code))`)
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  return (
    <div className="min-h-screen bg-white text-black p-4 print-container">
      <style>{`@media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; } table { font-size: 9px; } .print-border-black { border-color: #000 !important; } }`}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
         <div className="font-bold text-xl italic text-blue-900">SIB APQP</div> 
         <CustomerLogo customer={project.customer || ''} />
      </div>

      <div className="border border-black mb-2 text-xs">
        <div className="font-bold text-center p-2 border-b border-black bg-gray-100">CONTROL PLAN ({project.cp_phase || 'General'})</div>
        <div className="flex p-2 text-[9px] gap-8">
           <div className="w-1/2">
             <div><strong>No:</strong> {project.cp_number || '-'}</div>
             <div><strong>Part:</strong> {project.part_number} - {project.name}</div>
             <div><strong>Supplier:</strong> Internal</div>
           </div>
           <div className="w-1/2">
             <div><strong>Contact:</strong> {project.key_contact || '-'}</div>
             <div><strong>Date:</strong> {formatDate(project.cp_date_orig)} (Rev: {formatDate(project.cp_date_rev)})</div>
             <div><strong>Core Team:</strong> {project.core_team || '-'}</div>
           </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <thead className="bg-gray-200 font-bold">
          <tr>
            <th className="border border-black p-1 w-8">No</th>
            <th className="border border-black p-1">Process</th>
            <th className="border border-black p-1 w-24">Machine</th>
            <th className="border border-black p-1 w-6">#</th>
            <th className="border border-black p-1">Product</th>
            <th className="border border-black p-1">Process</th>
            <th className="border border-black p-1 w-8">SC</th>
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
                const symbolCode = getSymbolCode(risk?.special_characteristics);
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