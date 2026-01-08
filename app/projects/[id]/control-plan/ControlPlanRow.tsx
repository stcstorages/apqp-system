'use client'

import { deleteControlPlanRow } from '@/app/actions'
import { useRouter } from 'next/navigation'

type Props = {
  cp: any
  projectId: string
}

export default function ControlPlanRow({ cp, projectId }: Props) {
  const router = useRouter()

  // For now, we will make this a read-only display with a delete button to keep it simple.
  // Full inline editing for CP can be added later if needed, but the "Add" flow is usually sufficient.
  
  return (
    <tr className="hover:bg-blue-50 text-xs">
      <td className="p-1 border-r border-gray-200">{cp.characteristic_product}</td>
      <td className="p-1 border-r border-gray-200">{cp.characteristic_process}</td>
      {/* SC Symbol placeholder - inherited from FMEA/Step usually, but can be manual */}
      <td className="p-1 border-r border-gray-200 text-center"></td> 
      <td className="p-1 border-r border-gray-200">{cp.specification_tolerance}</td>
      <td className="p-1 border-r border-gray-200">{cp.eval_measurement_technique}</td>
      <td className="p-1 border-r border-gray-200">{cp.sample_size}</td>
      <td className="p-1 border-r border-gray-200">{cp.sample_freq}</td>
      <td className="p-1 border-r border-gray-200">{cp.control_method}</td>
      <td className="p-1 border-r border-gray-200">{cp.reaction_plan}</td>
      <td className="p-1 border-r border-gray-200">{cp.reaction_owner}</td>
      <td className="p-1 text-center">
        <form action={async (formData) => {
            await deleteControlPlanRow(formData)
            router.refresh()
        }}>
          <input type="hidden" name="row_id" value={cp.id} />
          <input type="hidden" name="project_id" value={projectId} />
          <button className="text-red-400 hover:text-red-600 font-bold">×</button>
        </form>
      </td>
    </tr>
  )
}
