import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "~/components/ui/card"

export default function InmueblesPublicadosCard() {
  return (
    <Card className="relative group">
      <Link
        href="/propiedades"
        className="absolute inset-0 z-10"
        aria-label="Ver inmuebles publicados"
        tabIndex={0}
      />
      <CardContent>
        <div className="flex flex-col items-center my-4 mt-8 mb-6">
          <span className="text-5xl font-extrabold text-primary">245</span>
          <span className="text-xs text-muted-foreground tracking-widest mt-1 uppercase">Inmuebles Publicados</span>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between shadow-md rounded-md p-2 bg-white">
            <div className="flex items-center">
              <Image
                src="/logos/logo-idealista.png"
                alt="Idealista"
                width={80}
                height={20}
                className="rounded-sm"
              />
            </div>
            <span className="text-sm font-bold">180</span>
          </div>
          <div className="flex items-center justify-between shadow-md rounded-md p-2 bg-white">
            <div className="flex items-center">
              <Image
                src="/logos/logo-fotocasa-min.png"
                alt="Fotocasa"
                width={80}
                height={20}
                className="rounded-sm"
              />
            </div>
            <span className="text-sm font-bold">65</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 