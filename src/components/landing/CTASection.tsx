"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowRight, Check } from "lucide-react";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would normally handle the email submission
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-gradient-to-r from-amber-400/90 to-rose-400/90 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Transforma tu Negocio Inmobiliario Hoy
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/90">
          Únete al grupo de profesionales inmobiliarios que ya están
          revolucionando su forma de trabajar con Vesta. Atrévete.
        </p>

        {!isSubscribed ? (
          <div className="mt-10">
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-x-4">
                <Input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-auto bg-white/90 text-gray-900 placeholder:text-gray-500"
                />
                <Button type="submit" variant="secondary" className="flex-none w-full sm:w-auto">
                  Comenzar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/80">
              Te enviaremos las credenciales de acceso. Sin spam, prometido.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <div className="inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-green-800">
              <Check className="mr-2 h-5 w-5" />
              ¡Gracias! Te contactaremos pronto.
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center">
          <p className="text-sm leading-6 text-primary-foreground/80">
            ¿Ya tienes cuenta?{" "}
            <button className="font-semibold underline hover:no-underline">
              Iniciar sesión
            </button>
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-16 border-t border-white/20 pt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-primary-foreground/80">
                Propiedades gestionadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-primary-foreground/80">
                Satisfacción del cliente
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-primary-foreground/80">
                Soporte técnico
              </div>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3 text-sm text-primary-foreground/90">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-300" />
            <span>Publica en todos los portales con un solo clic</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-primary-foreground/90">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-300" />
            <span>Convierte más leads con seguimiento inteligente</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-primary-foreground/90">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-300" />
            <span>Ahorra tiempo con descripciones generadas por IA</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-primary-foreground/90">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-300" />
            <span>Mantén toda tu información en un solo lugar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
