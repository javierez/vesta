"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import {
  Building2,
  Users,
  Globe,
  Calendar,
  Sparkles,
  FileText,
  Check,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Euro,
  Eye,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  CalendarCheck,
  AlertCircle,
  FileCheck,
  Search,
  Upload,
  Download,
  Zap,
  Languages,
  PenTool,
} from "lucide-react";

const features = [
  {
    id: "properties",
    title: "Gestión de Propiedades",
    icon: Building2,
    description:
      "Administra tu portafolio inmobiliario con herramientas intuitivas y potentes. Crea listados detallados, gestiona documentos y realiza seguimiento de cada propiedad.",
    preview: {
      stats: [
        { label: "Propiedades activas", value: "124", trend: "+12%" },
        { label: "Visitas programadas", value: "48", trend: "+8%" },
        { label: "Documentos gestionados", value: "1,240", trend: "+24%" },
      ],
      features: [
        "Listados detallados con galerías ilimitadas",
        "Gestión de documentos integrada",
        "Seguimiento de estado en tiempo real",
        "Generación automática de fichas",
      ],
    },
  },
  {
    id: "crm",
    title: "CRM de Contactos",
    icon: Users,
    description:
      "Convierte más leads con nuestro sistema de gestión de contactos. Rastrea interacciones, automatiza seguimientos y cierra más tratos.",
    preview: {
      stats: [
        { label: "Contactos totales", value: "2,847", trend: "+18%" },
        { label: "Leads activos", value: "156", trend: "+22%" },
        { label: "Tasa de conversión", value: "24%", trend: "+5%" },
      ],
      features: [
        "Seguimiento automático de leads",
        "Historial completo de interacciones",
        "Segmentación inteligente",
        "Automatización de campañas",
      ],
    },
  },
  {
    id: "portals",
    title: "Publicación Multi-Portal",
    icon: Globe,
    description:
      "Publica en Fotocasa, Habitaclia, Idealista y Milanuncios con un solo clic. Ahorra tiempo y maximiza la exposición de tus propiedades.",
    preview: {
      stats: [
        { label: "Portales conectados", value: "8", trend: "100%" },
        { label: "Publicaciones activas", value: "342", trend: "+15%" },
        { label: "Tiempo ahorrado", value: "18h/sem", trend: "+30%" },
      ],
      features: [
        "Publicación simultánea en todos los portales",
        "Sincronización automática de cambios",
        "Gestión centralizada de respuestas",
        "Análisis de rendimiento por portal",
      ],
    },
  },
  {
    id: "calendar",
    title: "Calendario Integrado",
    icon: Calendar,
    description:
      "Nunca pierdas una cita. Programa visitas, recordatorios y tareas. Sincroniza con tu calendario favorito y mantén todo organizado.",
    preview: {
      stats: [
        { label: "Citas este mes", value: "186", trend: "+12%" },
        { label: "Tasa de asistencia", value: "94%", trend: "+3%" },
        { label: "Recordatorios enviados", value: "372", trend: "+25%" },
      ],
      features: [
        "Programación inteligente de visitas",
        "Recordatorios automáticos por SMS/Email",
        "Sincronización con Google/Outlook",
        "Vista de equipo compartida",
      ],
    },
  },
  {
    id: "ai",
    title: "Descripciones con IA",
    icon: Sparkles,
    description:
      "Genera descripciones atractivas y optimizadas para SEO con inteligencia artificial. Destaca las mejores características de cada propiedad.",
    preview: {
      stats: [
        { label: "Descripciones generadas", value: "1,420", trend: "+45%" },
        { label: "Tiempo ahorrado", value: "124h", trend: "+38%" },
        { label: "Mejora en CTR", value: "+34%", trend: "+12%" },
      ],
      features: [
        "Generación en segundos",
        "Optimización SEO automática",
        "Múltiples idiomas disponibles",
        "Personalización por portal",
      ],
    },
  },
  {
    id: "docs",
    title: "Procesamiento de Documentos",
    icon: FileText,
    description:
      "Digitaliza y extrae información de documentos automáticamente con OCR avanzado. Organiza contratos, escrituras y más en segundos.",
    preview: {
      stats: [
        { label: "Documentos procesados", value: "8,234", trend: "+28%" },
        { label: "Precisión OCR", value: "99.2%", trend: "+2%" },
        { label: "Tiempo de procesamiento", value: "3 seg", trend: "-40%" },
      ],
      features: [
        "OCR avanzado con IA",
        "Extracción automática de datos",
        "Organización inteligente",
        "Búsqueda en texto completo",
      ],
    },
  },
];

export function FeaturesGrid() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const toggleFeature = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
  };

  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Todo lo que necesitas para triunfar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Herramientas profesionales diseñadas específicamente para el sector inmobiliario español
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            
            return (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200",
                  "hover:scale-[1.02]",
                  isActive
                    ? "bg-gradient-to-br from-amber-50 to-rose-50 shadow-lg"
                    : "bg-gray-50 shadow hover:shadow-lg"
                )}
              >
                <div
                  className={cn(
                    "mb-2 rounded-lg p-2 transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-rose-400"
                      : "bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-gray-600"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center transition-colors",
                    isActive ? "text-gray-900" : "text-gray-600"
                  )}
                >
                  {feature.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expanded Content */}
        {activeFeature === "properties" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Gestión de Propiedades
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Administra tu portafolio inmobiliario con herramientas intuitivas y potentes. 
                      Crea listados detallados, gestiona documentos y realiza seguimiento de cada propiedad.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Listados detallados con galerías ilimitadas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Gestión de documentos integrada</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Seguimiento de estado en tiempo real</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Generación automática de fichas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* Property Cards Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">124</div>
                      <div className="text-xs text-gray-600">Propiedades activas</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">48</div>
                      <div className="text-xs text-gray-600">Visitas esta semana</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">€2.4M</div>
                      <div className="text-xs text-gray-600">Valor total portfolio</div>
                    </div>
                  </div>

                  {/* Property Cards */}
                  <div className="space-y-4">
                    {/* Property Card 1 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-3 gap-4 p-4">
                        <div className="col-span-1">
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-rose-100 rounded-lg flex items-center justify-center">
                            <Home className="h-8 w-8 text-amber-600" />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">Villa Mediterránea Premium</h5>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>Marbella, Málaga</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Disponible
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />4
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />3
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="h-3 w-3" />280m²
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4 text-amber-600" />
                              <span className="font-bold text-lg text-gray-900">875,000</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />342
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />28
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />12
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Card 2 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-3 gap-4 p-4">
                        <div className="col-span-1">
                          <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-rose-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-rose-600" />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">Ático Duplex Centro</h5>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>Valencia, Valencia</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Reservado
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />3
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />2
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="h-3 w-3" />150m²
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4 text-amber-600" />
                              <span className="font-bold text-lg text-gray-900">425,000</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />567
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />45
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />23
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* CRM de Contactos Preview */}
        {activeFeature === "crm" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      CRM de Contactos
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Convierte más leads con nuestro sistema de gestión de contactos. 
                      Rastrea interacciones, automatiza seguimientos y cierra más tratos.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Seguimiento automático de leads</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Historial completo de interacciones</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Segmentación inteligente</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700">Automatización de campañas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* Contact Cards Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">2,847</div>
                      <div className="text-xs text-gray-600">Contactos totales</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">156</div>
                      <div className="text-xs text-gray-600">Leads activos</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">24%</div>
                      <div className="text-xs text-gray-600">Tasa conversión</div>
                    </div>
                  </div>

                  {/* Contact Cards */}
                  <div className="space-y-4">
                    {/* Contact Card 1 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">Carlos Rodríguez</h5>
                              <p className="text-sm text-gray-600">carlos@example.com</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Lead Caliente
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>+34 612 345 678</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>Madrid</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span>500k-750k</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />8 mensajes
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />5 propiedades vistas
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Última actividad: hace 2h</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Card 2 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">María González</h5>
                              <p className="text-sm text-gray-600">maria.g@company.com</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Prospecto
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>+34 655 432 109</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>Barcelona</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span>300k-400k</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />3 mensajes
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />2 propiedades vistas
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Última actividad: hace 1 día</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Publicación Multi-Portal Preview */}
        {activeFeature === "portals" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Publicación Multi-Portal
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Publica en Fotocasa, Habitaclia, Idealista y Milanuncios con un solo clic. 
                      Ahorra tiempo y maximiza la exposición de tus propiedades.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      {["Publicación simultánea en todos los portales", "Sincronización automática de cambios", "Gestión centralizada de respuestas", "Análisis de rendimiento por portal"].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* Portal Status Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Portal Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Idealista", status: "Activo", listings: 42, views: "12.3k", color: "green" },
                      { name: "Fotocasa", status: "Activo", listings: 38, views: "8.7k", color: "green" },
                      { name: "Habitaclia", status: "Activo", listings: 35, views: "6.2k", color: "green" },
                      { name: "Milanuncios", status: "Sincronizando", listings: 35, views: "5.1k", color: "amber" },
                    ].map((portal, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">{portal.name}</h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${portal.color}-100 text-${portal.color}-800`}>
                            {portal.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Propiedades</span>
                            <span className="font-semibold">{portal.listings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Visitas totales</span>
                            <span className="font-semibold">{portal.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-3">Actividad Reciente</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Villa Mediterránea publicada en 4 portales</span>
                        <span className="text-gray-400 ml-auto">hace 5 min</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">15 nuevas consultas de Idealista</span>
                        <span className="text-gray-400 ml-auto">hace 1 hora</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-gray-600">Precio actualizado en todos los portales</span>
                        <span className="text-gray-400 ml-auto">hace 2 horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendario Integrado Preview */}
        {activeFeature === "calendar" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Calendario Integrado
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Nunca pierdas una cita. Programa visitas, recordatorios y tareas. 
                      Sincroniza con tu calendario favorito y mantén todo organizado.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      {["Programación inteligente de visitas", "Recordatorios automáticos por SMS/Email", "Sincronización con Google/Outlook", "Vista de equipo compartida"].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* Calendar Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Today's Schedule */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-900">Agenda de Hoy</h5>
                      <span className="text-sm text-gray-600">Miércoles, 17 Sept</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">10:00</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Visita Villa Mediterránea</div>
                          <div className="text-sm text-gray-600">Carlos Rodríguez • Marbella</div>
                        </div>
                        <CalendarCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">12:00</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Firma de contrato</div>
                          <div className="text-sm text-gray-600">Oficina central • Valencia</div>
                        </div>
                        <FileCheck className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">16:00</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Reunión equipo ventas</div>
                          <div className="text-sm text-gray-600">Videollamada • Zoom</div>
                        </div>
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Week Overview */}
                  <div className="grid grid-cols-7 gap-2">
                    {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
                      <div key={index} className={`bg-white rounded-lg p-3 text-center ${index === 2 ? 'ring-2 ring-amber-400' : ''}`}>
                        <div className="text-xs text-gray-600 mb-1">{day}</div>
                        <div className="text-lg font-semibold">{15 + index}</div>
                        <div className={`text-xs mt-1 ${index === 2 ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>
                          {index === 2 ? '3 citas' : index === 4 ? '2 citas' : index === 0 ? '1 cita' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Descripciones con IA Preview */}
        {activeFeature === "ai" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Descripciones con IA
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Genera descripciones atractivas y optimizadas para SEO con inteligencia artificial. 
                      Destaca las mejores características de cada propiedad.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      {["Generación en segundos", "Optimización SEO automática", "Múltiples idiomas disponibles", "Personalización por portal"].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* AI Generation Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* AI Controls */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-900">Generador de Descripciones IA</h5>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">Powered by GPT-4</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
                        <Languages className="h-4 w-4 inline mr-1" />
                        Español
                      </button>
                      <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        <PenTool className="h-4 w-4 inline mr-1" />
                        Tono Profesional
                      </button>
                    </div>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5" />
                      Generar Descripción
                    </button>
                  </div>

                  {/* Generated Description Example */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">Descripción Generada</h5>
                      <span className="text-xs text-green-600 font-medium">✓ Optimizada SEO</span>
                    </div>
                    <div className="prose prose-sm text-gray-700">
                      <p className="leading-relaxed">
                        Espectacular villa mediterránea ubicada en la exclusiva zona de Marbella. 
                        Esta propiedad de 280m² ofrece 4 amplios dormitorios y 3 baños completos, 
                        perfecta para familias que buscan confort y elegancia.
                      </p>
                      <p className="leading-relaxed mt-2">
                        Destacan sus acabados de alta calidad, cocina totalmente equipada con 
                        electrodomésticos de última generación, y un luminoso salón con acceso 
                        directo a la terraza con vistas panorámicas al mar.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs text-gray-500">Generado en 2.3 segundos</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">Score SEO: 94/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Procesamiento de Documentos Preview */}
        {activeFeature === "docs" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Description and Features - Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Procesamiento de Documentos
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Digitaliza y extrae información de documentos automáticamente con OCR avanzado. 
                      Organiza contratos, escrituras y más en segundos.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Características principales
                    </h4>
                    <ul className="space-y-2">
                      {["OCR avanzado con IA", "Extracción automática de datos", "Organización inteligente", "Búsqueda en texto completo"].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
                      Ver demo
                    </button>
                    <button className="w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                      Más información
                    </button>
                  </div>
                </div>

                {/* Document Processing Preview - Middle and Right Columns */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Upload Area */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-dashed border-gray-300 hover:border-amber-300 transition-colors">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Arrastra documentos aquí o haz clic para subir</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG hasta 10MB</p>
                    </div>
                  </div>

                  {/* Recent Documents */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-3">Documentos Procesados</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">Escritura_Villa_Marbella.pdf</div>
                            <div className="text-xs text-gray-500">Procesado • 2.4MB</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Search className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">Contrato_Alquiler_Valencia.pdf</div>
                            <div className="text-xs text-gray-500">Procesado • 1.8MB</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Search className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extraction Results */}
                  <div className="bg-amber-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Datos extraídos automáticamente</span>
                    </div>
                    <div className="mt-2 text-amber-700">
                      Propietario: Juan García • Precio: €875,000 • Fecha: 15/09/2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}