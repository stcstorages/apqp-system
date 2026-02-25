'use client'

import { useState } from 'react'
import { addGanttTask } from '@/app/actions'

type Props = {
  projectId: string
  headers: any[]
}

export default function AddTaskForm({ projectId, headers }: Props) {
  const [type, setType] = useState('task')

  // Is this a Header?
  const isHeader = type === 'project'

  return (
    <div className="bg-white p-4 rounded shadow border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Add New Task</h3>
      <form action={addGanttTask} className="flex flex-wrap gap-4 items-end">
        <input type="hidden" name="project_id" value={projectId} />
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Name</label>
          <input name="name" required placeholder="e.g. Kick-off Meeting" className="w-full border rounded p-2 text-sm" />
        </div>
        
        {/* TYPE SELECTOR */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
          <select 
            name="type" 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            className="w-32 border rounded p-2 text-sm bg-white"
          >
            <option value="task">Standard Task</option>
            <option value="project">HEADER / GROUP</option>
            <option value="milestone">Milestone (◆)</option>
          </select>
        </div>

        {/* PARENT (Group Under) - Hide if creating a Header */}
        {!isHeader && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Under</label>
            <select name="parent_id" className="w-40 border rounded p-2 text-sm bg-white">
              <option value="none">-- None (Root) --</option>
              {headers.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* DATES - Disable if Header */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
          <input 
            name="start_date" 
            type="date" 
            required={!isHeader} // Only required if NOT a header
            disabled={isHeader}  // Prevent typing if Header
            className={`w-full border rounded p-2 text-sm ${isHeader ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
          <input 
            name="end_date" 
            type="date" 
            required={!isHeader}
            disabled={isHeader}
            className={`w-full border rounded p-2 text-sm ${isHeader ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
          />
        </div>

        <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm hover:bg-blue-500 h-[38px]">
          Add +
        </button>
      </form>
    </div>
  )
}