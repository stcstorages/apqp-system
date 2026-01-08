'use client'

import { useState } from 'react'
import { updateProjectDetails } from '@/app/actions'

export default function ProjectDetailsForm({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false)

  // Helper component for Phase Radio Buttons
  const PhaseSelector = ({ name, current }: { name: string, current: string }) => (
    <div className="flex gap-4 mt-2">
      {['prototype', 'pre-launch', 'production', 'safe-launch'].map((phase) => (
        <label key={phase} className="flex items-center gap-1 cursor-pointer">
          <input 
            type="radio" 
            name={name} 
            value={phase} 
            defaultChecked={current === phase}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[10px] uppercase font-bold text-gray-600">{phase.replace('-', ' ')}</span>
        </label>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 mb-8 overflow-hidden">
      {/* Accordion Header */}
      <div 
        className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">Project Details & Master Data</h2>
          <p className="text-xs text-gray-500">
            Model: {project.model || '-'} | Part: {project.part_number} | Customer: {project.customer}
          </p>
        </div>
        <span className="text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
          {isOpen ? 'Close Settings ▲' : 'Edit Settings ▼'}
        </span>
      </div>

      {/* Form Content */}
      {isOpen && (
        <form action={async (formData) => {
            await updateProjectDetails(formData)
            setIsOpen(false)
        }} className="p-6 bg-white space-y-8">
          <input type="hidden" name="project_id" value={project.id} />

          {/* SECTION 1: GENERAL INFORMATION */}
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b pb-1">1. General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Part Name / Description</label>
                <input name="name" defaultValue={project.name} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Model</label>
                <input name="model" defaultValue={project.model} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Drawing Number</label>
                <input name="drawing_number" defaultValue={project.drawing_number} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Part Number</label>
                <input name="part_number" defaultValue={project.part_number} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Customer</label>
                <input name="customer" defaultValue={project.customer} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
            </div>
          </div>

          {/* SECTION 2: DOCUMENT CONTROL (Split into 3) */}
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b pb-1">2. Document Control</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Process Flow Block */}
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3">Process Flow Chart</h4>
                <PhaseSelector name="flow_phase" current={project.flow_phase} />
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500">Document No.</label>
                    <input name="flow_number" defaultValue={project.flow_number} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Orig)</label>
                      <input type="date" name="flow_date_orig" defaultValue={project.flow_date_orig} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Rev)</label>
                      <input type="date" name="flow_date_rev" defaultValue={project.flow_date_rev} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PFMEA Block */}
              <div className="bg-red-50 p-4 rounded border border-red-100">
                <h4 className="font-bold text-red-800 mb-3">PFMEA</h4>
                <PhaseSelector name="pfmea_phase" current={project.pfmea_phase} />
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500">Document No.</label>
                    <input name="pfmea_number" defaultValue={project.pfmea_number} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Orig)</label>
                      <input type="date" name="pfmea_date_orig" defaultValue={project.pfmea_date_orig} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Rev)</label>
                      <input type="date" name="pfmea_date_rev" defaultValue={project.pfmea_date_rev} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Plan Block */}
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h4 className="font-bold text-green-800 mb-3">Control Plan</h4>
                <PhaseSelector name="cp_phase" current={project.cp_phase} />
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500">Document No.</label>
                    <input name="cp_number" defaultValue={project.cp_number} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Orig)</label>
                      <input type="date" name="cp_date_orig" defaultValue={project.cp_date_orig} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500">Date (Rev)</label>
                      <input type="date" name="cp_date_rev" defaultValue={project.cp_date_rev} className="w-full border-gray-300 rounded p-1.5 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: SHARED APPROVALS */}
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b pb-1">3. Team & Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Key Contact / Phone</label>
                    <input name="key_contact" defaultValue={project.key_contact} className="w-full border-gray-300 rounded p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Core Team</label>
                    <textarea name="core_team" defaultValue={project.core_team} className="w-full border-gray-300 rounded p-2 text-sm h-20 resize-none" placeholder="Name (Dept), Name (Dept)..." />
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Cust. Eng Appr.</label>
                        <input type="date" name="customer_eng_approval" defaultValue={project.customer_eng_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Cust. QA Appr.</label>
                        <input type="date" name="customer_quality_approval" defaultValue={project.customer_quality_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Other Appr.</label>
                        <input type="date" name="other_approval" defaultValue={project.other_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded shadow hover:bg-blue-700 transition">
              Save All Details
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
