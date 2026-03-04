import { createClient } from '@/utils/supabase/server'
import { addFmeaRow } from '@/app/actions'
import FmeaRow from './FmeaRow'
import PrintSelector from '@/app/components/PrintSelector' // NEW

export default async function FmeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // ... (Fetch logic same as before) ...
  const { data: steps } = await supabase
    .from('process_steps')
    .select('*, pfmea_records(*)')
    .eq('project_id', id)
    .order('step_number', { ascending: true })

  const { data: scLibrary } = await supabase.from('special_characteristics').select('*')

  return (
    <div className="space-y-8">
      
      {/* NEW: Dropdown Button */}
      <div className="flex justify-end">
         <PrintSelector baseUrl={`/print/fmea/${id}`} />
      </div>

      {/* ... (Rest of the FMEA Table Code remains unchanged) ... */}
      {/* I am not repeating the 200 lines of table code here, just keep the existing table logic */}
      {/* Just ensure the <PrintSelector> replaces the <a href...> button */}
      
      {/* ... */}