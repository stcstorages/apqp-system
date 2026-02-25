'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { updateGanttTaskDetails, deleteGanttTask, moveGanttTask, reorderGanttTasks } from '@/app/actions'
import { useRouter } from 'next/navigation'

type Props = {
  tasks: any[]
  headers: any[]
  projectId: string
}

export default function GanttTaskList({ tasks: initialTasks, headers, projectId }: Props) {
  const router = useRouter()
  // "tasks" here is the master state for the list order
  const [tasks, setTasks] = useState(initialTasks)

  // Sync state when server data changes (e.g. after a refresh)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTasks(items)

    const updates = items.map((task: any, index: number) => ({
      id: task.id,
      order_index: index
    }))

    await reorderGanttTasks(updates)
    router.refresh()
  }

  // Helper component for a Single Row to manage its own input state
  // This prevents the "jumping cursor" or "value not updating" issues
  const TaskRow = ({ task, index, dragProvided }: { task: any, index: number, dragProvided: any }) => {
    const isHeader = task.type === 'project'
    
    // Local state for inputs
    const [name, setName] = useState(task.name)
    const [type, setType] = useState(task.type)
    const [parentId, setParentId] = useState(task.parent_id || 'none')
    const [start, setStart] = useState(new Date(task.start_date).toISOString().split('T')[0])
    const [end, setEnd] = useState(new Date(task.end_date).toISOString().split('T')[0])
    const [progress, setProgress] = useState(task.progress)

    return (
      <tr 
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        className={isHeader ? 'bg-gray-100 font-bold' : 'bg-white'}
      >
        <td className="p-2 text-center" {...dragProvided.dragHandleProps}>
          <div className="cursor-grab text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
          </div>
        </td>

        <td colSpan={6} className="p-0">
          <form action={async (formData) => { await updateGanttTaskDetails(formData); router.refresh(); }} className="flex w-full items-center">
            <input type="hidden" name="task_id" value={task.id} />
            <input type="hidden" name="project_id" value={projectId} />

            {/* Name */}
            <div className="p-2 w-1/3 min-w-[200px] flex items-center">
              {parentId !== 'none' && <span className="text-gray-300 mr-2">↳</span>}
              <input 
                 name="name" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 className={`w-full text-sm border-gray-300 rounded p-1 focus:ring-blue-500 ${isHeader ? 'font-bold bg-transparent' : ''}`} 
              />
            </div>

            {/* Type & Parent */}
            <div className="p-2 w-48 flex gap-1">
              <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-1/2 text-xs border-gray-300 rounded p-1 bg-white">
                 <option value="task">Task</option>
                 <option value="project">HEADER</option>
                 <option value="milestone">Mile</option>
              </select>
              <select name="parent_id" value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-1/2 text-xs border-gray-300 rounded p-1 bg-white text-gray-500">
                 <option value="none">Root</option>
                 {headers.map((h:any) => (
                   h.id !== task.id && <option key={h.id} value={h.id}>{h.name.substring(0, 10)}...</option>
                 ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="p-2 w-32">
              <input 
                name="start_date" 
                type="date" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
                readOnly={isHeader}
                className={`w-full text-sm border-gray-300 rounded p-1 ${isHeader ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* End Date */}
            <div className="p-2 w-32">
              <input 
                name="end_date" 
                type="date" 
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                readOnly={isHeader}
                className={`w-full text-sm border-gray-300 rounded p-1 ${isHeader ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Progress */}
            <div className="p-2 w-20 flex items-center">
              <input 
                name="progress" 
                type="number" 
                min="0" max="100" 
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                readOnly={isHeader}
                className={`w-full text-sm border-gray-300 rounded p-1 text-center ${isHeader ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`} 
              />
              <span className="ml-1 text-xs text-gray-500">%</span>
            </div>

            {/* ACTIONS */}
            <div className="p-2 flex-1 flex items-center justify-center gap-2">
              <button type="submit" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Save">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </button>
              
              <div className="flex flex-col">
                 <button formAction={async (fd) => { fd.append('direction', 'up'); fd.append('current_order', task.order_index); await moveGanttTask(fd); router.refresh(); }} className="text-gray-400 hover:text-black text-[8px] leading-none">▲</button>
                 <button formAction={async (fd) => { fd.append('direction', 'down'); fd.append('current_order', task.order_index); await moveGanttTask(fd); router.refresh(); }} className="text-gray-400 hover:text-black text-[8px] leading-none">▼</button>
              </div>

              <button formAction={async (fd) => { await deleteGanttTask(fd); router.refresh(); }} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100" title="Delete">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2.001-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase">Task Details (Drag to Reorder)</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 w-10"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <tbody className="bg-white divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
                  {tasks.map((task: any, index: number) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <TaskRow task={task} index={index} dragProvided={provided} />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>
    </div>
  )
}