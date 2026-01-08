'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProcessStep, deleteProcessStep } from '@/app/actions'

type Props = {
  step: any
  scLibrary: any[]
  projectId: string
}

export default function ProcessStepRow({ step, scLibrary, projectId }: Props) {
  const router = useRouter()
  const [isChanged, setIsChanged] = useState(false)

  // Local State: Keeps the inputs "Alive" so they don't revert
  const [stepNumber, setStepNumber] = useState(step.step_number)
  const [symbolType, setSymbolType] = useState(step.symbol_type || 'process')
  const [description, setDescription] = useState(step.description)
  const [specialCharId, setSpecialCharId] = useState(step.special_char_id || "")
  const [remarks, setRemarks] = useState(step.remarks || "")

  // Helper to update state and enable the save button
  const handleInput = (setter: any, value: string) => {
    setter(value)
    setIsChanged(true)
  }

  return (
    <li className="p-2 hover:bg-gray-50 transition duration-150">
      <form 
        action={async (formData) => {
          // 1. Send data to server
          await updateProcessStep(formData)
          // 2. Disable button (Visual feedback that save is done)
          setIsChanged(false)
          // 3. Refresh background data (Optional, keeps other tabs in sync)
          router.refresh()
        }} 
        className="flex items-start gap-2"
      >
        <input type="hidden" name="step_id" value={step.id} />
        <input type="hidden" name="project_id" value={projectId} />

        {/* Step No */}
        <input 
          name="step_number" 
          value={stepNumber}
          onChange={(e) => handleInput(setStepNumber, e.target.value)}
          className="w-12 text-center border-gray-300 rounded text-sm p-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
        />
        
        {/* Symbol Select */}
        <select 
          name="symbol_type" 
          value={symbolType}
          onChange={(e) => handleInput(setSymbolType, e.target.value)}
          className="w-20 text-xs border-gray-300 rounded p-1 bg-white focus:border-blue-500"
        >
           <option value="start">Start</option>
           <option value="process">Proc</option>
           <option value="inspection">Insp</option>
           <option value="storage">Stor</option>
           <option value="transport">Trans</option>
           <option value="delay">Delay</option>
        </select>

        {/* Details Column */}
        <div className="flex-1 space-y-1">
           <input 
             name="description" 
             value={description}
             onChange={(e) => handleInput(setDescription, e.target.value)}
             className="w-full border-gray-300 rounded text-sm p-1 font-semibold focus:border-blue-500" 
             placeholder="Description" 
           />
           <div className="flex gap-2">
             <select 
               name="special_char_id" 
               value={specialCharId}
               onChange={(e) => handleInput(setSpecialCharId, e.target.value)}
               className="w-1/2 text-xs border-gray-300 rounded p-1 bg-white text-gray-600 focus:border-blue-500"
             >
               <option value="">- No SC -</option>
               {scLibrary?.map((sc: any) => (
                 <option key={sc.id} value={sc.id}>{sc.name}</option>
               ))}
             </select>
             <input 
               name="remarks" 
               value={remarks}
               onChange={(e) => handleInput(setRemarks, e.target.value)}
               className="w-1/2 text-xs border-gray-300 rounded p-1 text-gray-600 focus:border-blue-500" 
               placeholder="Remarks/Freq" 
             />
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button 
            type="submit" 
            disabled={!isChanged}
            className={`p-1 rounded transition-colors ${
              isChanged 
                ? 'text-blue-600 hover:bg-blue-100 cursor-pointer' 
                : 'text-gray-300 cursor-not-allowed'
            }`} 
            title={isChanged ? "Save Changes" : "No changes to save"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>

          <button 
            formAction={async (formData) => {
                await deleteProcessStep(formData)
                router.refresh()
            }}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded" 
            title="Delete Step"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </form>
    </li>
  )
}
