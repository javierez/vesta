"use client";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { ChevronDown } from "lucide-react";
import { rentalProcess, salesProcess } from "~/lib/process-data";
import { motion, AnimatePresence } from "framer-motion";

export default function OperacionesEnCursoCard({ className = "" }) {
  const [active, setActive] = useState<"venta" | "alquiler">("venta");
  const [openStep, setOpenStep] = useState<string | null>(null);
  const funnel = active === "venta" ? salesProcess : rentalProcess;

  // Calculate total operations (currently unused but may be needed for future features)
  // const totalOperations = funnel.reduce((acc, process) => {
  //   const processTotal = process.subprocesses.reduce((subAcc, sub) => subAcc + sub.value, 0)
  //   return acc + processTotal
  // }, 0)

  // Calculate total for active type (venta/alquiler)
  const activeTotal = active === "venta" ? 10 : 7; // These numbers should come from your data source

  return (
    <Card className={className + " group relative"}>
      <CardContent>
        <div className="my-4 mb-6 mt-8 flex flex-col items-center">
          <motion.span
            key={activeTotal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-extrabold text-primary"
          >
            {activeTotal}
          </motion.span>
          <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            Operaciones en curso
          </span>
        </div>
        {/* Two clickable cards for Venta and Alquiler */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full justify-center gap-2">
            {/* Venta Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-1 flex-col items-center rounded-2xl p-2 transition-all duration-200 ${active === "venta" ? "bg-gray-100 shadow-xl" : "bg-white shadow"} ${active !== "venta" ? "hover:shadow-lg" : ""}`}
              onClick={() => {
                setActive("venta");
                setOpenStep(null);
              }}
              aria-label="Ver operaciones de venta"
              type="button"
            >
              <span className="mb-0.5 text-base font-bold text-primary">
                10
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Venta
              </span>
            </motion.button>
            {/* Alquiler Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-1 flex-col items-center rounded-2xl p-2 transition-all duration-200 ${active === "alquiler" ? "bg-gray-100 shadow-xl" : "bg-white shadow"} ${active !== "alquiler" ? "hover:shadow-lg" : ""}`}
              onClick={() => {
                setActive("alquiler");
                setOpenStep(null);
              }}
              aria-label="Ver operaciones de alquiler"
              type="button"
            >
              <span className="mb-0.5 text-base font-bold text-primary">7</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Alquiler
              </span>
            </motion.button>
          </div>
          {/* Process breakdown as vertical stepper */}
          <div className="mt-4 flex w-full flex-col gap-1.5">
            {funnel.map((item, index) => {
              const Icon = item.icon;
              const isOpen = openStep === item.label;
              const processTotal = item.subprocesses.reduce(
                (acc, sub) => acc + sub.value,
                0,
              );

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    className={`flex w-full items-center justify-between rounded-lg border border-transparent bg-white px-3 py-1.5 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none ${isOpen ? "border-primary bg-gray-100" : ""}`}
                    onClick={() => setOpenStep(isOpen ? null : item.label)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">
                        {processTotal}
                      </span>
                      {item.subprocesses && (
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-3 w-3 text-gray-400" />
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
                        className="ml-6 mt-1 flex flex-col gap-0.5 overflow-hidden pr-4"
                      >
                        {item.subprocesses.map((sub, subIndex) => (
                          <motion.div
                            key={sub.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 transition-colors duration-200 hover:bg-gray-100"
                          >
                            <span className="text-xs text-gray-500">
                              {sub.label}
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {sub.value}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
