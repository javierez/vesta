"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, TrendingUp } from "lucide-react";
import { cn } from "~/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Carmen Martínez",
    role: "Agente Inmobiliario Senior",
    company: "Inmobiliaria Costa Brava",
    location: "Girona, España",
    avatar: "CM",
    rating: 5,
    testimonial: "Vesta ha revolucionado completamente mi forma de trabajar. En 6 meses he duplicado mis ventas gracias a la automatización del CRM y las publicaciones multi-portal. La IA para descripciones me ahorra horas cada semana.",
    metrics: {
      sales: "+120%",
      time: "15h/sem",
      leads: "+85%"
    },
    featured: true
  },
  {
    id: 2,
    name: "Miguel Rodríguez",
    role: "Director Comercial",
    company: "PropiaMadrid",
    location: "Madrid, España",
    avatar: "MR",
    rating: 5,
    testimonial: "La integración con todos los portales principales ha sido un game-changer. Publicamos 200+ propiedades simultáneamente y el seguimiento de leads es impecable. ROI increíble.",
    metrics: {
      sales: "+95%",
      time: "20h/sem",
      leads: "+150%"
    },
    featured: false
  },
  {
    id: 3,
    name: "Ana García-López",
    role: "Fundadora & CEO",
    company: "Valencia Properties",
    location: "Valencia, España",
    avatar: "AG",
    rating: 5,
    testimonial: "Como directora de una agencia con 25 agentes, Vesta nos ha permitido escalar sin perder calidad. El calendario compartido y la gestión de documentos son excepcionales.",
    metrics: {
      sales: "+75%",
      time: "30h/sem",
      leads: "+110%"
    },
    featured: false
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    role: "Agente Inmobiliario",
    company: "Costas & Asociados",
    location: "Málaga, España",
    avatar: "CM2",
    rating: 5,
    testimonial: "La herramienta de IA para generar descripciones es espectacular. Mis listados tienen más visitas y mejores conversiones. El soporte técnico es de primera.",
    metrics: {
      sales: "+140%",
      time: "12h/sem",
      leads: "+90%"
    },
    featured: false
  },
  {
    id: 5,
    name: "Isabel Ruiz",
    role: "Agente Freelance",
    company: "Independiente",
    location: "Sevilla, España",
    avatar: "IR",
    rating: 5,
    testimonial: "Trabajo sola y Vesta me da las herramientas de una gran agencia. La automatización me permite competir con equipos grandes manteniendo un servicio personalizado.",
    metrics: {
      sales: "+160%",
      time: "18h/sem",
      leads: "+200%"
    },
    featured: false
  }
];

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "time" | "leads">("sales");

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial] ?? testimonials[0];
  
  if (!current) return null;

  const metricLabels = {
    sales: "Incremento Ventas",
    time: "Tiempo Ahorrado",
    leads: "Más Leads"
  };

  return (
    <section className="bg-gradient-to-b from-white to-amber-50/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Un grupo selecto de profesionales inmobiliarios ya confía en Vesta para hacer crecer su negocio
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row sm:gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Agentes activos</div>
            </div>
            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-600">Valoración media</div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Recomendarían</div>
            </div>
          </div>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative">
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="grid lg:grid-cols-3">
                {/* Testimonial Content - Left 2/3 */}
                <div className="lg:col-span-2 p-8 lg:p-12">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-rose-400">
                      <Quote className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-xl leading-relaxed text-gray-900 mb-8">
                    &ldquo;{current.testimonial}&rdquo;
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">{current.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{current.name}</div>
                      <div className="text-gray-600">{current.role}</div>
                      <div className="text-sm text-gray-500">{current.company}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {current.location}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex">
                      {Array.from({ length: current.rating }, (_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({current.rating}/5)</span>
                  </div>
                </div>

                {/* Metrics Sidebar - Right 1/3 */}
                <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-6 lg:p-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Resultados obtenidos</h4>
                  
                  {/* Metric Selector */}
                  <div className="space-y-2 mb-4">
                    {(Object.keys(metricLabels) as Array<keyof typeof metricLabels>).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg transition-all",
                          selectedMetric === metric
                            ? "bg-white shadow-md ring-2 ring-amber-200"
                            : "hover:bg-white/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {metricLabels[metric]}
                          </span>
                          <span className="font-bold text-lg text-gray-900">
                            {current.metrics[metric]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Achievement Badge */}
                  <div className="bg-white rounded-lg p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Cliente destacado</div>
                    <div className="text-xs text-gray-600">Top 10% rendimiento</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group sm:left-4 sm:w-12 sm:h-12"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group sm:right-4 sm:w-12 sm:h-12"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-900 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentTestimonial
                  ? "bg-gradient-to-r from-amber-400 to-rose-400 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>


        {/* Call to Action */}
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg">
            Ver demo
          </button>
        </div>
      </div>
    </section>
  );
}