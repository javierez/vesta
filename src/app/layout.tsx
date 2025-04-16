import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Acropolis Bienes Raíces | Encuentra Tu Casa Soñada",
  description:
    "Acropolis Bienes Raíces ofrece propiedades premium en las mejores ubicaciones. Explora nuestros listados para encontrar tu hogar perfecto, apartamento o propiedad de inversión.",
  keywords: "bienes raíces, propiedades en venta, casas, apartamentos, agencia inmobiliaria, Acropolis",
  openGraph: {
    title: "Acropolis Bienes Raíces | Encuentra Tu Casa Soñada",
    description:
      "Acropolis Bienes Raíces ofrece propiedades premium en las mejores ubicaciones. Explora nuestros listados para encontrar tu hogar perfecto, apartamento o propiedad de inversión.",
    url: "https://acropolis-realestate.com",
    siteName: "Acropolis Bienes Raíces",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Acropolis Bienes Raíces",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acropolis Bienes Raíces | Encuentra Tu Casa Soñada",
    description:
      "Acropolis Bienes Raíces ofrece propiedades premium en las mejores ubicaciones. Explora nuestros listados para encontrar tu hogar perfecto, apartamento o propiedad de inversión.",
    images: ["/images/og-image.jpg"],
  },
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
