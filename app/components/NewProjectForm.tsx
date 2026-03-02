'use client'

import { useState } from 'react'
import { createProject, addCustomer } from '@/app/actions'
import { useRouter } from 'next/navigation'

type Props = {
  existingCustomers: { id: string, name: string }[]
}

export default function NewProjectForm({ existingCustomers }: Props) {
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await createProject(formData)
      
      if (result && result.error) {
        alert("Database Error: " + result.error)
        setIsLoading(false)
      } 
      else if (result && result.success) {
         if (result.newProjectId) {
             router.push(`/projects/${result.newProjectId}`)
         } else {
             setIsLoading(false)
             router.refresh()
         }
      }
    } catch (error) {
      console.error(error)
      setIsLoading(false)
      alert("System Error: Check console for details")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Create New Project</h2>
      
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label><input name="name" required className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. New Model Launch" /></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model</label><input name="model" className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. X70 / Myvi" /></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Name</label><input name="part_name" required className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. Front Coil Spring" /></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Number</label><input name="part_number" required className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. P2-31A" /></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
          <select name="category" className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
            <option value="Coil Spring">Coil Spring</option>
            <option value="Stabilizer Bar">Stabilizer Bar</option>
            <option value="Shock Absorber">Shock Absorber</option>
            <option value="Assembly">Assembly</option>
            <option value="Machining Product">Machining Product</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer</label>
          {!isAddingCustomer ? (
            <div className="flex gap-2">
              <select name="customer" className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                {existingCustomers.map((cust) => (
                  <option key={cust.id} value={cust.name}>{cust.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setIsAddingCustomer(true)} className="bg-gray-100 border border-gray-300 text-gray-600 px-3 rounded hover:bg-gray-200 text-sm font-bold">+</button>
            </div>
          ) : (
            <div className="flex gap-2">
               <input id="new-customer-input" name="new_customer_name" autoFocus placeholder="Name (e.g. Chery)" className="w-full border border-blue-500 rounded p-2 text-sm bg-blue-50" />
               <button type="button" onClick={async () => {
                     const input = document.getElementById('new-customer-input') as HTMLInputElement;
                     if(input.value) {
                         const fd = new FormData();
                         fd.append('new_customer_name', input.value);
                         const res = await addCustomer(fd);
                         if(res?.error) alert(res.error);
                         else setIsAddingCustomer(false);
                     }
                  }} className="bg-green-600 text-white px-3 rounded hover:bg-green-500 text-xs font-bold">SAVE</button>
               <button type="button" onClick={() => setIsAddingCustomer(false)} className="bg-red-100 text-red-600 border border-red-200 px-2 rounded hover:bg-red-200">✕</button>
            </div>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
           <button type="submit" disabled={isLoading} className={`flex items-center justify-center gap-2 font-bold px-8 py-2.5 rounded shadow transition w-full md:w-auto ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
             {isLoading ? "Creating..." : "Create Project +"}
           </button>
        </div>
      </form>
    </div>
  )
}