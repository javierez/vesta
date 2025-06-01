"use client"
import { useState } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { rentalProcess, salesProcess } from "~/lib/process-data"

export default function OperacionesEnCursoCard({ className = "" }) {
  const [active, setActive] = useState<'venta' | 'alquiler'>('venta')
  const [openStep, setOpenStep] = useState<string | null>(null)
  const funnel = active === 'venta' ? salesProcess : rentalProcess

  // Calculate total operations
  const totalOperations = funnel.reduce((acc, process) => {
    const processTotal = process.subprocesses.reduce((subAcc, sub) => subAcc + sub.value, 0)
    return acc + processTotal
  }, 0)

  // Calculate total for active type (venta/alquiler)
  const activeTotal = active === 'venta' ? 10 : 7 // These numbers should come from your data source

  return (
    <Card className={className + " relative group"}>
      <CardContent>
        <div className="flex flex-col items-center my-4 mt-8 mb-6">
          <span className="text-5xl font-extrabold text-primary">{activeTotal}</span>
          <span className="text-xs text-muted-foreground tracking-widest mt-1 uppercase">Operaciones en curso</span>
        </div>
        {/* Two clickable cards for Venta and Alquiler */}
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-2 w-full justify-center">
            {/* Venta Card */}
            <button
              className={`flex-1 rounded-2xl p-2 flex flex-col items-center transition-shadow duration-150
                ${active === 'venta' ? 'bg-gray-100 shadow-xl' : 'bg-white shadow'}
                ${active !== 'venta' ? 'hover:shadow-lg' : ''}`}
              onClick={() => { setActive('venta'); setOpenStep(null); }}
              aria-label="Ver operaciones de venta"
              type="button"
            >
              <span className="text-base font-bold text-primary mb-0.5">10</span>
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Venta</span>
            </button>
            {/* Alquiler Card */}
            <button
              className={`flex-1 rounded-2xl p-2 flex flex-col items-center transition-shadow duration-150
                ${active === 'alquiler' ? 'bg-gray-100 shadow-xl' : 'bg-white shadow'}
                ${active !== 'alquiler' ? 'hover:shadow-lg' : ''}`}
              onClick={() => { setActive('alquiler'); setOpenStep(null); }}
              aria-label="Ver operaciones de alquiler"
              type="button"
            >
              <span className="text-base font-bold text-primary mb-0.5">7</span>
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Alquiler</span>
            </button>
          </div>
          {/* Process breakdown as vertical stepper */}
          <div className="w-full flex flex-col gap-1 mt-4">
            {funnel.map((item) => {
              const Icon = item.icon
              const isOpen = openStep === item.label
              const processTotal = item.subprocesses.reduce((acc, sub) => acc + sub.value, 0)
              
              return (
                <div key={item.label}>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition bg-white shadow-sm hover:bg-gray-50 focus:outline-none border border-transparent ${isOpen ? 'border-primary bg-gray-100' : ''}`}
                    onClick={() => setOpenStep(isOpen ? null : item.label)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-primary">{processTotal}</span>
                      {item.subprocesses && (
                        isOpen ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {/* Subprocesses */}
                  {isOpen && item.subprocesses && (
                    <div className="ml-6 mt-1 flex flex-col gap-0.5">
                      {item.subprocesses.map((sub) => (
                        <div key={sub.label} className="flex justify-between items-center px-2 py-1 rounded-md bg-gray-50">
                          <span className="text-xs text-gray-500">{sub.label}</span>
                          <span className="font-semibold text-xs text-primary">{sub.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 