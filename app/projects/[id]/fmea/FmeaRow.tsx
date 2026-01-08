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

  // -- STATE MANAGEMENT --
  const [mode, setMode] = useState(risk.failure_mode)
  const [effect, setEffect] = useState(risk.failure_effect)
  const [sev, setSev] = useState(risk.severity)
  const [classId, setClassId] = useState(risk.special_char_id || "")
  const [cause, setCause] = useState(risk.cause)
  
  // Prevention & Detection Split
  const [prevention, setPrevention] = useState(risk.control_prevention || "")
  const [occ, setOcc] = useState(risk.occurrence)
  const [detectionControl, setDetectionControl] = useState(risk.current_controls)
  const [det, setDet] = useState(risk.detection)

  // Actions
  const [recAction, setRecAction] = useState(risk.recommended_actions || "")
  const [resp, setResp] = useState(risk.responsibility || "")
  const [actTaken, setActTaken] = useState(risk.action_taken || "")
  
  // New RPN
  const [actSev, setActSev] = useState(risk.act_severity || "")
  const [actOcc, setActOcc] = useState(risk.act_occurrence || "")
  const [actDet, setActDet] = useState(risk.act_detection || "")

  const rpn = (parseInt(sev) || 0) * (parseInt(occ) || 0) * (parseInt(det) || 0)
  const newRpn = (parseInt(actSev) || 0) * (parseInt(actOcc) || 0) * (parseInt(actDet) || 0)

  const handleInput = (setter: any, value: string) => {
    setter(value)
    setIsChanged(true)
  }

  return (
    <tr className="hover:bg-blue-50 transition-colors group text-xs align-top">
      <td className="p-0 hidden"><form id={`form-${risk.id}`} action={async (formData) => { await updateFmeaRow(formData); setIsChanged(false); router.refresh(); }}><input type="hidden" name="row_id" value={risk.id} /><input type="hidden" name="project_id" value={projectId} /></form></td>
      
      {/* 1. Failure Mode */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="failure_mode" value={mode} onChange={(e) => handleInput(setMode, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 2. Effect */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="failure_effect" value={effect} onChange={(e) => handleInput(setEffect, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 3. S */}
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="severity" type="number" value={sev} onChange={(e) => handleInput(setSev, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 4. Class */}
      <td className="p-0 border-r w-12"><select form={`form-${risk.id}`} name="special_char_id" value={classId} onChange={(e) => handleInput(setClassId, e.target.value)} className="w-full h-full border-0 bg-transparent text-center text-[10px] focus:ring-1 focus:ring-blue-500"><option value="">-</option>{scLibrary.map(sc => <option key={sc.id} value={sc.id}>{sc.symbol_code === 'circle_double_plus' ? 'S' : 'F'}</option>)}</select></td>
      
      {/* 5. Cause */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="cause" value={cause} onChange={(e) => handleInput(setCause, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 6. Prevention (New) */}
      <td className="p-0 border-r bg-yellow-50"><textarea form={`form-${risk.id}`} name="control_prevention" value={prevention} onChange={(e) => handleInput(setPrevention, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" placeholder="Prev." /></td>
      
      {/* 7. O */}
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="occurrence" type="number" value={occ} onChange={(e) => handleInput(setOcc, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 8. Detection (Old 'Controls') */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="current_controls" value={detectionControl} onChange={(e) => handleInput(setDetectionControl, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" placeholder="Det." /></td>
      
      {/* 9. D */}
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="detection" type="number" value={det} onChange={(e) => handleInput(setDet, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 10. RPN */}
      <td className="p-1 border-r text-center font-black bg-gray-100">{rpn}</td>

      {/* 11. Recommended Action */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="recommended_actions" value={recAction} onChange={(e) => handleInput(setRecAction, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 12. Resp */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="responsibility" value={resp} onChange={(e) => handleInput(setResp, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>
      
      {/* 13. Actions Taken */}
      <td className="p-0 border-r"><textarea form={`form-${risk.id}`} name="action_taken" value={actTaken} onChange={(e) => handleInput(setActTaken, e.target.value)} className="w-full h-full border-0 bg-transparent p-1 min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500" /></td>

      {/* 14. New RPN (S, O, D, RPN) */}
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="act_severity" type="number" value={actSev} onChange={(e) => handleInput(setActSev, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold text-gray-500 focus:text-black" placeholder="S" /></td>
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="act_occurrence" type="number" value={actOcc} onChange={(e) => handleInput(setActOcc, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold text-gray-500 focus:text-black" placeholder="O" /></td>
      <td className="p-0 border-r w-8"><input form={`form-${risk.id}`} name="act_detection" type="number" value={actDet} onChange={(e) => handleInput(setActDet, e.target.value)} className="w-full h-full border-0 bg-transparent text-center font-bold text-gray-500 focus:text-black" placeholder="D" /></td>
      <td className="p-1 border-r text-center font-bold bg-gray-50 text-[10px]">{newRpn || '-'}</td>

      {/* Buttons */}
      <td className="p-1 text-center w-8 align-middle">
        <div className="flex flex-col gap-1 items-center">
          <button type="submit" form={`form-${risk.id}`} disabled={!isChanged} className={`p-0.5 rounded ${isChanged ? 'text-blue-600' : 'text-gray-200'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button>
          <button formAction={async (formData) => { await deleteFmeaRow(formData); router.refresh(); }} className="text-red-300 hover:text-red-600"><input type="hidden" name="row_id" value={risk.id} /><input type="hidden" name="project_id" value={projectId} /><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
        </div>
      </td>
    </tr>
  )
}
