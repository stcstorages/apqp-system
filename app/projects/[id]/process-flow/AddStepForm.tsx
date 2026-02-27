'use client'

import { useState } from 'react'
import { addProcessStep } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function AddStepForm({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Stop default browser reload
    setIsLoading(true) // 1. Start Spinner immediately

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      // 2. Call Server Action
      await addProcessStep(formData)
      
      // 3. Reset form and refresh data
      form.reset()
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to add step")
    } finally {
      // 4. Stop Spinner
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow h-fit border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Process Step</h3>
      <p className="text-xs text-gray-500 mb-4">
        Define the process flow here. Select symbols and special characteristics if applicable.
      </p>
      
      <form id="add-step-form" onSubmit={handleFormSubmit} className="space-y-4">
        <input type="hidden" name="project_id" value={projectId} />
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase">Step No.</label>
            <input name="step_number" required placeholder="10" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase">Symbol</label>
            <select name="symbol_type" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm bg-white">
              <option value="start">Start/End</option>
              <option value="process">Process (○)</option>
              <option value="inspection">Inspection (◇)</option>
              <option value="storage">Storage (▽)</option>
              <option value="transport">Transport (→)</option>
              <option value="delay">Delay (D)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase">Operation Description</label>
          <input name="description" required placeholder="e.g. Injection Molding" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase">Remarks / Freq</label>
          <input name="remarks" placeholder="e.g. 100%" className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm" />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full rounded px-3 py-2 text-sm font-bold text-white shadow-sm flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {isLoading ? (
             <>
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Saving...
             </>
          ) : "Add Step +"}
        </button>
      </form>
    </div>
  )
}