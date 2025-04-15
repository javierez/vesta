import { cn } from "~/lib/utils"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = [
    { name: "Contacto", description: "Datos personales" },
    { name: "Ubicación", description: "Dirección del inmueble" },
    { name: "Propiedad", description: "Características" },
    { name: "Económicos", description: "Precios y gastos" },
    { name: "Imágenes", description: "Fotos del inmueble" },
    { name: "Revisión", description: "Confirmar datos" },
  ]

  const percentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-muted">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500 ease-in-out"
          ></div>
        </div>
      </div>

      <div className="hidden md:flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center text-center",
              index <= currentStep ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full mb-2 transition-all duration-300",
                index < currentStep
                  ? "bg-primary text-primary-foreground shadow-md"
                  : index === currentStep
                    ? "border-2 border-primary text-primary"
                    : "border border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <div className="text-sm font-medium">{step.name}</div>
            <div className="text-xs hidden lg:block">{step.description}</div>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <div className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full mr-3 transition-all duration-300",
              "bg-primary text-primary-foreground shadow-sm",
            )}
          >
            {currentStep + 1}
          </div>
          <div>
            <div className="text-sm font-medium">{steps[currentStep]!.name}</div>
            <div className="text-xs text-muted-foreground">{steps[currentStep]!.description}</div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            Paso {currentStep + 1} de {totalSteps}
          </div>
        </div>
      </div>
    </div>
  )
}
