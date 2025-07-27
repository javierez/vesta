import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";

export default function InmueblesPublicadosCard() {
  return (
    <Card className="group relative">
      <Link
        href="/propiedades"
        className="absolute inset-0 z-10"
        aria-label="Ver inmuebles publicados"
        tabIndex={0}
      />
      <CardContent>
        <div className="my-4 mb-6 mt-8 flex flex-col items-center">
          <span className="text-5xl font-extrabold text-primary">245</span>
          <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            Inmuebles Publicados
          </span>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between rounded-md bg-white p-2 shadow-md">
            <div className="flex items-center">
              <Image
                src="https://vesta-configuration-files.s3.amazonaws.com/logos/logo-idealista.png"
                alt="Idealista"
                width={80}
                height={20}
                className="rounded-sm"
              />
            </div>
            <span className="text-sm font-bold">180</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-white p-2 shadow-md">
            <div className="flex items-center">
              <Image
                src="https://vesta-configuration-files.s3.amazonaws.com/logos/logo-fotocasa-min.png"
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
  );
}
