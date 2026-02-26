'use client'

import { deleteProject } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this project? This cannot be undone.")
    if (confirmed) {
      const formData = new FormData()
      formData.append('project_id', projectId)
      await deleteProject(formData)
      router.refresh()
    }
  }

  return (
    <button 
      onClick={(e) => {
        e.preventDefault() // Stop link navigation
        handleDelete()
      }}
      className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
      title="Delete Project"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    </button>
  )
}