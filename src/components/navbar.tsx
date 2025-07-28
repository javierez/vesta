"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Building,
  Menu,
  X,
  ChevronDown,
  Home,
  Building2,
  Store,
  LandPlot,
  Car,
  PlusCircle,
} from "lucide-react";
import { useState, useCallback, memo } from "react";
import { cn } from "~/lib/utils";
import { SocialLinks } from "~/components/ui/social-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

// Types
type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube";

interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

interface NavbarProps {
  socialLinks?: SocialLink[];
  shortName?: string;
}

// Memoized Social Links Section
const MobileSocialLinks = memo(({ links }: { links: SocialLink[] }) => (
  <div className="border-t bg-muted/50 backdrop-blur-sm">
    <div className="px-4 py-4">
      <div className="mb-3 text-xs font-medium text-muted-foreground">
        Síguenos en redes sociales
      </div>
      <SocialLinks links={links} />
    </div>
  </div>
));

MobileSocialLinks.displayName = "MobileSocialLinks";

// Main Component
export default function Navbar({
  socialLinks,
  shortName,
}: NavbarProps): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Memoized handlers
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleMenuClose();
      }
    },
    [handleMenuClose],
  );

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      onKeyDown={handleKeyPress}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left section - Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            aria-label="Home"
          >
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">{shortName}</span>
          </Link>
        </div>

        {/* Center section - Navigation */}
        <nav className="hidden gap-6 lg:flex" aria-label="Main navigation">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Comprar opciones"
            >
              Comprar <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link href="/venta-pisos/todas-ubicaciones" className="w-full">
                  Pisos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/venta-casas/todas-ubicaciones" className="w-full">
                  Casas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/venta-locales/todas-ubicaciones"
                  className="w-full"
                >
                  Locales
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/venta-solares/todas-ubicaciones"
                  className="w-full"
                >
                  Solares
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/venta-garajes/todas-ubicaciones"
                  className="w-full"
                >
                  Garajes
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Alquilar opciones"
            >
              Alquilar <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link
                  href="/alquiler-pisos/todas-ubicaciones"
                  className="w-full"
                >
                  Pisos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/alquiler-casas/todas-ubicaciones"
                  className="w-full"
                >
                  Casas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/alquiler-locales/todas-ubicaciones"
                  className="w-full"
                >
                  Locales
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/alquiler-garajes/todas-ubicaciones"
                  className="w-full"
                >
                  Garajes
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/vender"
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Vender propiedad"
          >
            Vender
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Sobre nosotros"
          >
            Nosotros
          </Link>
          <Link
            href="#reviews"
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Reseñas"
          >
            Reseñas
          </Link>
          <Link
            href="#contactos"
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Contactos"
          >
            Contactos
          </Link>
        </nav>

        {/* Right section - Social Links and Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            {socialLinks && socialLinks.length > 0 && (
              <SocialLinks links={socialLinks} />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={handleMenuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={handleMenuClose}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed right-0 top-16 h-[calc(100vh-4rem)] w-[280px] border-l bg-background shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex h-full flex-col">
          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-4 py-6">
              {/* Comprar Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Comprar
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/venta-pisos/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Home className="h-4 w-4" />
                    Pisos
                  </Link>
                  <Link
                    href="/venta-casas/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Building2 className="h-4 w-4" />
                    Casas
                  </Link>
                  <Link
                    href="/venta-locales/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Store className="h-4 w-4" />
                    Locales
                  </Link>
                  <Link
                    href="/venta-solares/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <LandPlot className="h-4 w-4" />
                    Solares
                  </Link>
                  <Link
                    href="/venta-garajes/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Car className="h-4 w-4" />
                    Garajes
                  </Link>
                </div>
              </div>

              {/* Alquilar Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Alquilar
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/alquiler-pisos/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Home className="h-4 w-4" />
                    Pisos
                  </Link>
                  <Link
                    href="/alquiler-casas/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Building2 className="h-4 w-4" />
                    Casas
                  </Link>
                  <Link
                    href="/alquiler-locales/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Store className="h-4 w-4" />
                    Locales
                  </Link>
                  <Link
                    href="/alquiler-garajes/todas-ubicaciones"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Car className="h-4 w-4" />
                    Garajes
                  </Link>
                </div>
              </div>

              {/* Other Links */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Más
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/vender"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Vender
                  </Link>
                  <Link
                    href="#about"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    Nosotros
                  </Link>
                  <Link
                    href="#reviews"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    Reseñas
                  </Link>
                  <Link
                    href="#contactos"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    Contactos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Footer */}
          {socialLinks && socialLinks.length > 0 && (
            <MobileSocialLinks links={socialLinks} />
          )}
        </div>
      </div>
    </header>
  );
}
