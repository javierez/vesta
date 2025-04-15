"use client"

import { useState } from "react"
import { ContactStep } from "./form-steps/contact-step"
import { LocationStep } from "./form-steps/location-step"
import { PropertyStep } from "./form-steps/property-step"
import { EconomicStep } from "./form-steps/economic-step"
import { ImagesStep } from "./form-steps/images-step"
import { ReviewStep } from "./form-steps/review-step"
import { ProgressBar } from "./progress-bar"
import { Button } from "~/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { FormStep, PropertyFormData } from "~/types/property-form"

const initialFormData: PropertyFormData = {
  contactInfo: {
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
  },
  locationInfo: {
    direccion: "",
    numero: "",
    planta: "",
    puerta: "",
    codigoPostal: "",
    localidad: "",
    provincia: "León",
  },
  propertyInfo: {
    tipo: "piso",
    superficie: "",
    habitaciones: "",
    banos: "",
    descripcion: "",
    caracteristicas: [],
  },
  economicInfo: {
    precioVenta: "",
    precioAlquiler: "",
    gastosComunitarios: "",
    ibi: "",
  },
  images: [],
  acceptTerms: false,
}

const steps: FormStep[] = ["contact", "location", "property", "economic", "images", "review"]

export function PropertyListingForm() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const updateFormData = (stepData: Partial<PropertyFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }))
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    switch (steps[currentStep]) {
      case "contact":
        if (!formData.contactInfo.nombre) {
          newErrors.nombre = "El nombre es obligatorio"
          isValid = false
        }
        if (!formData.contactInfo.email) {
          newErrors.email = "El email es obligatorio"
          isValid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
          newErrors.email = "El email no es válido"
          isValid = false
        }
        if (!formData.contactInfo.telefono) {
          newErrors.telefono = "El teléfono es obligatorio"
          isValid = false
        }
        break

      case "location":
        if (!formData.locationInfo.direccion) {
          newErrors.direccion = "La dirección es obligatoria"
          isValid = false
        }
        if (!formData.locationInfo.codigoPostal) {
          newErrors.codigoPostal = "El código postal es obligatorio"
          isValid = false
        }
        if (!formData.locationInfo.localidad) {
          newErrors.localidad = "La localidad es obligatoria"
          isValid = false
        }
        break

      case "property":
        if (!formData.propertyInfo.superficie) {
          newErrors.superficie = "La superficie es obligatoria"
          isValid = false
        }
        if (!formData.propertyInfo.descripcion) {
          newErrors.descripcion = "La descripción es obligatoria"
          isValid = false
        }
        break

      case "economic":
        if (!formData.economicInfo.precioVenta && !formData.economicInfo.precioAlquiler) {
          newErrors.precioVenta = "Debe indicar al menos un precio de venta o alquiler"
          isValid = false
        }
        break

      case "review":
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = "Debe aceptar los términos y condiciones"
          isValid = false
        }
        break
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsSubmitting(true)
      try {
        // Aquí iría la lógica para enviar los datos al servidor
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulación de envío
        setIsSubmitted(true)
      } catch (error) {
        setErrors({
          submit: "Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo.",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const renderStep = () => {
    switch (steps[currentStep]) {
      case "contact":
        return (
          <ContactStep
            data={formData.contactInfo}
            updateData={(data) => updateFormData({ contactInfo: { ...formData.contactInfo, ...data } })}
            errors={errors}
          />
        )
      case "location":
        return (
          <LocationStep
            data={formData.locationInfo}
            updateData={(data) => updateFormData({ locationInfo: { ...formData.locationInfo, ...data } })}
            errors={errors}
          />
        )
      case "property":
        return (
          <PropertyStep
            data={formData.propertyInfo}
            updateData={(data) => updateFormData({ propertyInfo: { ...formData.propertyInfo, ...data } })}
            errors={errors}
          />
        )
      case "economic":
        return (
          <EconomicStep
            data={formData.economicInfo}
            updateData={(data) => updateFormData({ economicInfo: { ...formData.economicInfo, ...data } })}
            errors={errors}
          />
        )
      case "images":
        return (
          <ImagesStep images={formData.images} updateImages={(images) => updateFormData({ images })} errors={errors} />
        )
      case "review":
        return (
          <ReviewStep data={formData} updateTerms={(acceptTerms) => updateFormData({ acceptTerms })} errors={errors} />
        )
      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Gracias por publicar tu inmueble!</h2>
          <p className="mb-4">
            Hemos recibido correctamente la información de tu propiedad. Uno de nuestros agentes se pondrá en contacto
            contigo en breve para completar el proceso.
          </p>
          <Button asChild>
            <a href="/">Volver al inicio</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <Card className="mt-8">
        <CardContent className="pt-6">
          {errors.submit && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button onClick={handleNext} disabled={isSubmitting}>
              {currentStep === steps.length - 1 ? (
                isSubmitting ? (
                  "Enviando..."
                ) : (
                  "Publicar inmueble"
                )
              ) : (
                <>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
