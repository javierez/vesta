"use client"

import React, { useState } from "react"
import { cn } from "~/lib/utils"

interface RecordatoriosProps {
  isActive: boolean
  reminders?: Array<{
    id: string
    title: string
    completed?: boolean
    dueDate?: Date
  }>
}

export function Recordatorios({
  isActive,
  reminders = []
}: RecordatoriosProps) {
  // Default reminders if none provided
  const defaultReminders = [
    { id: "1", title: "Llamar seguimiento", completed: false },
    { id: "2", title: "Enviar propuesta", completed: false },
    { id: "3", title: "Revisar documentos", completed: false },
    { id: "4", title: "Agendar visita", completed: false },
    { id: "5", title: "Confirmar cita", completed: false },
    { id: "6", title: "Enviar contrato", completed: false }
  ]

  const initialReminders = reminders.length > 0 ? reminders : defaultReminders
  const [remindersList, setRemindersList] = useState(initialReminders)

  const handleToggleReminder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRemindersList(prev => {
      const updated = prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
      
      // Sort: incomplete first, then completed
      return updated.sort((a, b) => {
        if (a.completed === b.completed) return 0
        return a.completed ? 1 : -1
      })
    })
  }

  const displayReminders = remindersList

  if (displayReminders.length === 0) {
    return (
      <div className={cn(
        "text-sm",
        isActive ? "text-muted-foreground" : "text-gray-400"
      )}>
        Sin recordatorios
      </div>
    )
  }

  return (
    <div className="h-[60px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="flex flex-col gap-0.5">
      {displayReminders.map((reminder) => (
        <button
          key={reminder.id}
          onClick={(e) => handleToggleReminder(reminder.id, e)}
          className="flex items-center gap-1 h-[18px] w-full text-left hover:bg-gray-50 rounded px-1 transition-colors"
        >
          <span className={cn(
            "w-2 h-2 rounded-full border inline-block flex-shrink-0",
            reminder.completed
              ? "border-green-500 bg-green-500"
              : isActive 
                ? "border-gray-300 bg-gray-50" 
                : "border-gray-200 bg-gray-200"
          )} />
          <span className={cn(
            "text-[12px] truncate transition-all",
            reminder.completed && "line-through text-gray-400",
            !reminder.completed && isActive ? "text-gray-800" : "text-gray-500"
          )}>
            {reminder.title}
          </span>
        </button>
      ))}
      </div>
    </div>
  )
}
