"use client"
import { useState } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { rentalProcess, salesProcess } from "~/lib/process-data"
import { motion, AnimatePresence } from "framer-motion"

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
          <motion.span 
            key={activeTotal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-extrabold text-primary"
          >
            {activeTotal}
          </motion.span>
          <span className="text-xs text-muted-foreground tracking-widest mt-1 uppercase">Operaciones en curso</span>
        </div>
        {/* Two clickable cards for Venta and Alquiler */}
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-2 w-full justify-center">
            {/* Venta Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 rounded-2xl p-2 flex flex-col items-center transition-all duration-200
                ${active === 'venta' ? 'bg-gray-100 shadow-xl' : 'bg-white shadow'}
                ${active !== 'venta' ? 'hover:shadow-lg' : ''}`}
              onClick={() => { setActive('venta'); setOpenStep(null); }}
              aria-label="Ver operaciones de venta"
              type="button"
            >
              <span className="text-base font-bold text-primary mb-0.5">10</span>
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Venta</span>
            </motion.button>
            {/* Alquiler Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 rounded-2xl p-2 flex flex-col items-center transition-all duration-200
                ${active === 'alquiler' ? 'bg-gray-100 shadow-xl' : 'bg-white shadow'}
                ${active !== 'alquiler' ? 'hover:shadow-lg' : ''}`}
              onClick={() => { setActive('alquiler'); setOpenStep(null); }}
              aria-label="Ver operaciones de alquiler"
              type="button"
            >
              <span className="text-base font-bold text-primary mb-0.5">7</span>
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Alquiler</span>
            </motion.button>
          </div>
          {/* Process breakdown as vertical stepper */}
          <div className="w-full flex flex-col gap-1.5 mt-4">
            {funnel.map((item, index) => {
              const Icon = item.icon
              const isOpen = openStep === item.label
              const processTotal = item.subprocesses.reduce((acc, sub) => acc + sub.value, 0)
              
              return (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none border border-transparent ${isOpen ? 'border-primary bg-gray-100' : ''}`}
                    onClick={() => setOpenStep(isOpen ? null : item.label)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{processTotal}</span>
                      {item.subprocesses && (
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                  {/* Subprocesses */}
                  <AnimatePresence>
                    {isOpen && item.subprocesses && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-1 flex flex-col gap-0.5 pr-4 overflow-hidden"
                      >
                        {item.subprocesses.map((sub, subIndex) => (
                          <motion.div
                            key={sub.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            className="flex justify-between items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <span className="text-xs text-gray-500">{sub.label}</span>
                            <span className="font-semibold text-xs text-primary">{sub.value}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 