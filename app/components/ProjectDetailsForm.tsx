'use client'

import { useState } from 'react'
import { updateProjectDetails } from '@/app/actions'

export default function ProjectDetailsForm({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 mb-8 overflow-hidden">
      {/* Accordion Header */}
      <div 
        className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">Project Details & Settings</h2>
          <p className="text-xs text-gray-500">
            Manage Part Name, Customer, Core Team, and Approval Dates.
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
            setIsOpen(false) // Close on save
        }} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <input type="hidden" name="project_id" value={project.id} />

          {/* Section 1: Basic Info */}
          <div className="md:col-span-2 border-b pb-4 mb-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">General Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Part Name / Description</label>
                <input name="name" defaultValue={project.name} className="w-full border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Part Number</label>
                <input name="part_number" defaultValue={project.part_number} className="w-full border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer</label>
                <input name="customer" defaultValue={project.customer} className="w-full border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 2: Document Control */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Document Control</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Project Phase</label>
              <div className="flex gap-4">
                {['prototype', 'pre-launch', 'production', 'safe-launch'].map((phase) => (
                  <label key={phase} className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="cp_phase" 
                      value={phase} 
                      defaultChecked={project.cp_phase === phase}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs capitalize">{phase.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Doc / CP Number</label>
                    <input name="cp_number" defaultValue={project.cp_number} className="w-full border-gray-300 rounded p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Key Contact / Phone</label>
                    <input name="key_contact" defaultValue={project.key_contact} className="w-full border-gray-300 rounded p-2 text-sm" />
                </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Core Team</label>
              <textarea name="core_team" defaultValue={project.core_team} className="w-full border-gray-300 rounded p-2 text-sm h-20 resize-none" placeholder="Name (Dept), Name (Dept)..." />
            </div>
          </div>

          {/* Section 3: Approvals & Dates */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Dates & Approvals</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date (Orig)</label>
                <input type="date" name="date_orig" defaultValue={project.date_orig} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date (Rev)</label>
                <input type="date" name="date_rev" defaultValue={project.date_rev} className="w-full border-gray-300 rounded p-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <div>
                 <label className="block text-[10px] font-bold text-gray-700 mb-1">Cust. Eng Appr.</label>
                 <input type="date" name="customer_eng_approval" defaultValue={project.customer_eng_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-gray-700 mb-1">Cust. QA Appr.</label>
                 <input type="date" name="customer_quality_approval" defaultValue={project.customer_quality_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-gray-700 mb-1">Other Appr.</label>
                 <input type="date" name="other_approval" defaultValue={project.other_approval} className="w-full border-gray-300 rounded p-2 text-xs" />
               </div>
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-4 flex justify-end">
            <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-500 shadow">
              Save Project Details
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
