'use client'

import { useState } from 'react'
import { createProject, addCustomer } from '@/app/actions'

type Props = {
  existingCustomers: { id: string, name: string }[]
}

export default function NewProjectForm({ existingCustomers }: Props) {
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true) // Start Animation
    try {
      await createProject(formData)
      // Note: If successful, the server action redirects the page, 
      // so this spinner will spin until the new page loads.
    } catch (error) {
      console.error(error)
      setIsLoading(false) // Stop if error
      alert("Error creating project. Please check the database columns.")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Create New Project</h2>
      
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Project Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
          <input name="name" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. New Model Launch" />
        </div>

        {/* 2. Model */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model</label>
          <input name="model" className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. X70 / Myvi" />
        </div>

        {/* 3. Part Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Name</label>
          <input name="part_name" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Front Coil Spring" />
        </div>

        {/* 4. Part Number */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Number</label>
          <input name="part_number" required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. P2-31A" />
        </div>

        {/* 5. Category (Product List) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category (Product)</label>
          <select name="category" className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
            <option value="Coil Spring">Coil Spring</option>
            <option value="Stabilizer Bar">Stabilizer Bar</option>
            <option value="Shock Absorber">Shock Absorber</option>
            <option value="Assembly">Assembly</option>
            <option value="Machining Product">Machining Product</option>
          </select>
        </div>

        {/* 6. Customer (Dynamic with Add Feature) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer</label>
          
          {!isAddingCustomer ? (
            <div className="flex gap-2">
              <select name="customer" className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                {existingCustomers.map((cust) => (
                  <option key={cust.id} value={cust.name}>{cust.name}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => setIsAddingCustomer(true)}
                className="bg-gray-100 border border-gray-300 text-gray-600 px-3 rounded hover:bg-gray-200 text-sm font-bold"
                title="Add New Customer"
              >
                +
              </button>
            </div>
          ) : (
            // Mini Form to Add Customer
            <div className="flex gap-2">
               {/* Hidden trigger for server action */}
               <button 
                  type="submit" 
                  formAction={async (formData) => {
                      await addCustomer(formData)
                      setIsAddingCustomer(false)
                  }}
                  className="hidden" 
                  id="submit-customer"
               />
               <input 
                 name="new_customer_name" 
                 autoFocus
                 placeholder="New Customer Name" 
                 className="w-full border border-blue-500 rounded p-2 text-sm bg-blue-50" 
               />
               <button 
                  type="button"
                  onClick={() => {
                     const input = document.getElementsByName('new_customer_name')[0] as HTMLInputElement;
                     if(input.value) {
                         const fd = new FormData();
                         fd.append('new_customer_name', input.value);
                         addCustomer(fd).then(() => setIsAddingCustomer(false));
                     }
                  }}
                  className="bg-green-600 text-white px-3 rounded hover:bg-green-500 text-xs font-bold"
               >
                 SAVE
               </button>
               <button 
                 type="button" 
                 onClick={() => setIsAddingCustomer(false)}
                 className="bg-red-100 text-red-600 border border-red-200 px-2 rounded hover:bg-red-200"
               >
                 ✕
               </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
           <button 
             type="submit" 
             disabled={isLoading}
             className={`
               flex items-center gap-2 font-bold px-8 py-2.5 rounded shadow transition
               ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
               text-white
             `}
           >
             {isLoading ? (
               <>
                 <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Creating...
               </>
             ) : (
               "Create Project +"
             )}
           </button>
        </div>
      </form>
    </div>
  )
}