'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateFmeaRow, deleteFmeaRow } from '@/app/actions'

type Props = {
  risk: any
  scLibrary: any[]
  projectId: string
}

export default function FmeaRow({ risk, scLibrary, projectId }: Props) {
  const router = useRouter()
  const [isChanged, setIsChanged] = useState(false)

  // Local State for all inputss
  const [mode, setMode] = useState(risk.failure_mode)
  const [effect, setEffect] = useState(risk.failure_effect)
  const [sev, setSev] = useState(risk.severity)
  const [classId, setClassId] = useState(risk.special_char_id || "")
  const [cause, setCause] = useState(risk.cause)
  const [occ, setOcc] = useState(risk.occurrence)
  const [control, setControl] = useState(risk.current_controls)
  const [det, setDet] = useState(risk.detection)

  // Auto-calculate RPN for display (Server calculates simpler, but good to show user immediately)
  const rpn = (parseInt(sev) || 0) * (parseInt(occ) || 0) * (parseInt(det) || 0)

  const handleInput = (setter: any, value: string) => {
    setter(value)
    setIsChanged(true)
  }

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <td className="p-0">
        <form 
          id={`form-${risk.id}`}
          action={async (formData) => {
            await updateFmeaRow(formData)
            setIsChanged(false)
            router.refresh()
          }}
        >
          <input type="hidden" name="row_id" value={risk.id} />
          <input type="hidden" name="project_id" value={projectId} />
        </form>
        
        {/* Failure Mode */}
        <textarea 
          form={`form-${risk.id}`} name="failure_mode" 
          value={mode} onChange={(e) => handleInput(setMode, e.target.value)}
          className="w-full h-full border-0 bg-transparent p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[60px]" 
        />
      </td>

      <td className="p-0 border-l">
        <textarea 
          form={`form-${risk.id}`} name="failure_effect" 
          value={effect} onChange={(e) => handleInput(setEffect, e.target.value)}
          className="w-full h-full border-0 bg-transparent p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[60px]" 
        />
      </td>

      <td className="p-0 border-l w-10">
        <input 
          form={`form-${risk.id}`} name="severity" type="number" min="1" max="10"
          value={sev} onChange={(e) => handleInput(setSev, e.target.value)}
          className="w-full h-full border-0 bg-transparent text-center text-sm font-bold focus:ring-2 focus:ring-blue-500" 
        />
      </td>

      <td className="p-0 border-l w-16">
        {/* Class / SC Selection */}
        <select 
          form={`form-${risk.id}`} name="special_char_id"
          value={classId} onChange={(e) => handleInput(setClassId, e.target.value)}
          className="w-full h-full border-0 bg-transparent text-xs text-center focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-</option>
          {scLibrary.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.symbol_code === 'circle_double_plus' ? 'S (⊕⊕)' : 'F (⊕)'}</option>
          ))}
        </select>
      </td>

      <td className="p-0 border-l">
        <textarea 
          form={`form-${risk.id}`} name="cause" 
          value={cause} onChange={(e) => handleInput(setCause, e.target.value)}
          className="w-full h-full border-0 bg-transparent p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[60px]" 
        />
      </td>

      <td className="p-0 border-l w-10">
        <input 
          form={`form-${risk.id}`} name="occurrence" type="number" min="1" max="10"
          value={occ} onChange={(e) => handleInput(setOcc, e.target.value)}
          className="w-full h-full border-0 bg-transparent text-center text-sm font-bold focus:ring-2 focus:ring-blue-500" 
        />
      </td>

      <td className="p-0 border-l">
        <textarea 
          form={`form-${risk.id}`} name="current_controls" 
          value={control} onChange={(e) => handleInput(setControl, e.target.value)}
          className="w-full h-full border-0 bg-transparent p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[60px]" 
        />
      </td>

      <td className="p-0 border-l w-10">
        <input 
          form={`form-${risk.id}`} name="detection" type="number" min="1" max="10"
          value={det} onChange={(e) => handleInput(setDet, e.target.value)}
          className="w-full h-full border-0 bg-transparent text-center text-sm font-bold focus:ring-2 focus:ring-blue-500" 
        />
      </td>

      <td className="p-2 border-l text-center font-black bg-gray-50 text-sm">
        {rpn}
      </td>

      <td className="p-2 border-l text-center w-16">
        <div className="flex flex-col gap-2 items-center">
          <button 
            type="submit" form={`form-${risk.id}`}
            disabled={!isChanged}
            className={`p-1 rounded ${isChanged ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
          
          <button 
            formAction={async (formData) => {
               await deleteFmeaRow(formData)
               router.refresh()
            }}
            className="text-red-400 hover:text-red-600"
          >
             <input type="hidden" name="row_id" value={risk.id} />
             <input type="hidden" name="project_id" value={projectId} />
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
