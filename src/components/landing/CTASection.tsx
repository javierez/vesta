"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

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
    <section className="bg-gradient-to-r from-primary to-primary/80 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Transforma tu Negocio Inmobiliario Hoy
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/90">
          Únete a cientos de profesionales inmobiliarios que ya están
          revolucionando su forma de trabajar con Vesta. Comienza gratis, sin
          compromiso.
        </p>

        {!isSubscribed ? (
          <div className="mt-10">
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex gap-x-4">
                <Input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-auto bg-white/90 text-gray-900 placeholder:text-gray-500"
                />
                <Button type="submit" variant="secondary" className="flex-none">
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

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/dashboard">Explorar Demo</Link>
          </Button>
          <p className="text-sm leading-6 text-primary-foreground/80">
            ¿Ya tienes cuenta?{" "}
            <button className="font-semibold underline hover:no-underline">
              Iniciar sesión
            </button>
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-16 border-t border-white/20 pt-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-primary-foreground/80">
                Propiedades gestionadas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-primary-foreground/80">
                Satisfacción del cliente
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-primary-foreground/80">
                Soporte técnico
              </div>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center text-sm text-primary-foreground/90">
            <Check className="mr-2 h-4 w-4 text-green-300" />
            Publica en todos los portales con un solo clic
          </div>
          <div className="flex items-center text-sm text-primary-foreground/90">
            <Check className="mr-2 h-4 w-4 text-green-300" />
            Convierte más leads con seguimiento inteligente
          </div>
          <div className="flex items-center text-sm text-primary-foreground/90">
            <Check className="mr-2 h-4 w-4 text-green-300" />
            Ahorra tiempo con descripciones generadas por IA
          </div>
          <div className="flex items-center text-sm text-primary-foreground/90">
            <Check className="mr-2 h-4 w-4 text-green-300" />
            Mantén toda tu información en un solo lugar
          </div>
        </div>
      </div>
    </section>
  );
}
