"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Link from "next/link";

export function HeroSection() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                Gestiona tu Negocio Inmobiliario con Inteligencia
              </h1>
              <p className="text-xl text-gray-600">
                El CRM más completo para agentes y agencias inmobiliarias en
                España. Automatiza, optimiza y crece tu negocio con herramientas
                impulsadas por IA.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="group">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Iniciar Sesión</DialogTitle>
                    <DialogDescription>
                      Ingresa a tu cuenta de Vesta. El sistema de autenticación
                      completo estará disponible próximamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Sistema de autenticación próximamente disponible.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button disabled>Iniciar Sesión</Button>
                    <Button
                      variant="outline"
                      asChild
                      onClick={() => setIsLoginOpen(false)}
                    >
                      <Link href="/dashboard">Explorar Demo</Link>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 h-4 w-4" />
                Ver Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Configuración en minutos
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Soporte 24/7
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-2xl">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-primary/20" />
                  <p className="text-lg font-medium text-gray-600">
                    Dashboard Preview
                  </p>
                  <p className="text-sm text-gray-500">
                    Visualización disponible próximamente
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
