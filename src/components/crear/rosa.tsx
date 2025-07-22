import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "lucide-react"

interface CompassRoseProps {
  value: string
  onChange: (value: string) => void
}

const directions = [
  { value: "norte", label: "N", angle: 0, fullName: "Norte", color: "bg-blue-600" },
  { value: "noreste", label: "NE", angle: 45, fullName: "Noreste", color: "bg-green-600" },
  { value: "este", label: "E", angle: 90, fullName: "Este", color: "bg-yellow-600" },
  { value: "sureste", label: "SE", angle: 135, fullName: "Sureste", color: "bg-orange-600" },
  { value: "sur", label: "S", angle: 180, fullName: "Sur", color: "bg-red-600" },
  { value: "suroeste", label: "SW", angle: 225, fullName: "Suroeste", color: "bg-purple-600" },
  { value: "oeste", label: "W", angle: 270, fullName: "Oeste", color: "bg-indigo-600" },
  { value: "noroeste", label: "NW", angle: 315, fullName: "Noroeste", color: "bg-teal-600" },
]

export function CompassRose({ value, onChange }: CompassRoseProps) {
  const selectedDirection = directions.find((d) => d.value === value) ?? directions[0] // Default to north

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-64 h-64">
        {/* Outer compass ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-4 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg"
        />

        {/* Inner compass ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="absolute inset-4 rounded-full border-2 border-gray-200 bg-white shadow-inner"
        />

        {/* Cardinal direction lines */}
        <div className="absolute inset-0">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
            <motion.div
              key={angle}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
              className={`absolute ${angle % 90 === 0 ? "w-1 bg-gray-400" : "w-0.5 bg-gray-300"}`}
              style={{
                height: angle % 90 === 0 ? "50px" : "30px",
                left: "50%",
                top: "8px",
                transformOrigin: "bottom center",
                transform: `translateX(-50%) rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>

        {/* Center compass needle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: selectedDirection ? selectedDirection.angle - 45 : 45,
              scale: selectedDirection ? 1.1 : 1,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`${selectedDirection ? "text-gray-700" : "text-gray-400"} transition-colors duration-300`}
          >
            <Navigation className="h-8 w-8" fill="currentColor" />
          </motion.div>
        </div>

        {/* Direction buttons */}
        {directions.map((direction, index) => {
          const isSelected = value === direction.value || (!value && direction.value === "norte")
          const radius = 100
          const x = Math.cos((direction.angle - 90) * (Math.PI / 180)) * radius
          const y = Math.sin((direction.angle - 90) * (Math.PI / 180)) * radius

          return (
            <motion.button
              key={direction.value}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3 + index * 0.08,
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{
                scale: 1.15,
                y: -2,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 },
              }}
              onClick={() => {
                onChange(direction.value)
              }}
              className={`
                absolute w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-md
                ${
                  isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-xl z-20"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50 z-10"
                }
              `}
              style={{
                left: `calc(50% + ${x}px - 24px)`,
                top: `calc(50% + ${y}px - 24px)`,
              }}
            >
              {/* Selection ripple effect - only when selected */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gray-800 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.2, 1],
                    opacity: [0, 0.8, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    times: [0, 0.6, 1],
                  }}
                />
              )}

              <motion.span
                className={`relative z-10 ${isSelected ? "text-white" : "text-gray-500"}`}
                animate={
                  isSelected
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.3,
                  times: [0, 0.5, 1],
                }}
              >
                {direction.label}
              </motion.span>
            </motion.button>
          )
        })}

        {/* Degree markers */}
        <div className="absolute inset-0">
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={`degree-${angle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="absolute text-xs font-medium text-gray-500"
              style={{
                left: `calc(50% + ${Math.cos((angle - 90) * (Math.PI / 180)) * 115}px - 8px)`,
                top: `calc(50% + ${Math.sin((angle - 90) * (Math.PI / 180)) * 115}px - 8px)`,
              }}
            >
              {angle}°
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected direction display */}
      <AnimatePresence mode="wait">
        {selectedDirection ? (
          <motion.div
            key={selectedDirection.value}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <p className="text-lg font-semibold text-gray-900 tracking-widest uppercase">{selectedDirection.fullName}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-sm text-gray-500">Selecciona la orientación de la propiedad</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
