"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Building,
  Menu,
  X,
  ChevronDown,
  Package,
  Users,
  BookOpen,
  Info,
  Shield,
  Code,
  DollarSign,
  FileText,
  GraduationCap,
  MessageSquare,
  HeadphonesIcon,
  Briefcase,
  UserPlus,
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
              aria-label="Opciones de producto"
            >
              Producto <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link href="#features" className="w-full">
                  Características
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#integrations" className="w-full">
                  Integraciones
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#security" className="w-full">
                  Seguridad
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#api" className="w-full">
                  API y Desarrolladores
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Opciones de soluciones"
            >
              Soluciones <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link href="#sales-teams" className="w-full">
                  Equipos de Ventas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#marketing-teams" className="w-full">
                  Equipos de Marketing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#customer-service" className="w-full">
                  Servicio al Cliente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#small-business" className="w-full">
                  Pequeñas Empresas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#enterprise" className="w-full">
                  Empresas
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="#pricing"
            className="text-sm font-medium transition-colors hover:text-primary"
            aria-label="Precios"
          >
            Precios
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Opciones de recursos"
            >
              Recursos <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link href="#documentation" className="w-full">
                  Documentación
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#blog" className="w-full">
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#academy" className="w-full">
                  Academia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#community" className="w-full">
                  Comunidad
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#support" className="w-full">
                  Soporte
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Opciones de empresa"
            >
              Empresa <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>
                <Link href="#about" className="w-full">
                  Acerca de Nosotros
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#careers" className="w-full">
                  Carreras
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#partners" className="w-full">
                  Socios
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#contact" className="w-full">
                  Contacto
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right section - Auth Buttons, Social Links and Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {socialLinks && socialLinks.length > 0 && (
              <SocialLinks links={socialLinks} />
            )}
            <Link
              href="/auth/signin"
              className="text-sm font-medium transition-colors hover:text-primary"
              aria-label="Iniciar Sesión"
            >
              Iniciar Sesión
            </Link>
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href="/auth/signup" aria-label="Registrarse">
                Registrarse
              </Link>
            </Button>
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
              {/* Auth Section */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/auth/signup" onClick={handleMenuClose}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Registrarse
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Link href="/auth/signin" onClick={handleMenuClose}>
                      Iniciar Sesión
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Product Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Producto
                </h3>
                <div className="space-y-1">
                  <Link
                    href="#features"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Package className="h-4 w-4" />
                    Características
                  </Link>
                  <Link
                    href="#integrations"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Code className="h-4 w-4" />
                    Integraciones
                  </Link>
                  <Link
                    href="#security"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Shield className="h-4 w-4" />
                    Seguridad
                  </Link>
                  <Link
                    href="#api"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Code className="h-4 w-4" />
                    API y Desarrolladores
                  </Link>
                </div>
              </div>

              {/* Solutions Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Soluciones
                </h3>
                <div className="space-y-1">
                  <Link
                    href="#sales-teams"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Users className="h-4 w-4" />
                    Equipos de Ventas
                  </Link>
                  <Link
                    href="#marketing-teams"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Users className="h-4 w-4" />
                    Equipos de Marketing
                  </Link>
                  <Link
                    href="#customer-service"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Servicio al Cliente
                  </Link>
                  <Link
                    href="#small-business"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Briefcase className="h-4 w-4" />
                    Pequeñas Empresas
                  </Link>
                  <Link
                    href="#enterprise"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Building className="h-4 w-4" />
                    Empresas
                  </Link>
                </div>
              </div>

              {/* Precios Link */}
              <div className="space-y-3">
                <Link
                  href="#pricing"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={handleMenuClose}
                >
                  <DollarSign className="h-4 w-4" />
                  Precios
                </Link>
              </div>

              {/* Resources Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Recursos
                </h3>
                <div className="space-y-1">
                  <Link
                    href="#documentation"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <FileText className="h-4 w-4" />
                    Documentación
                  </Link>
                  <Link
                    href="#blog"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </Link>
                  <Link
                    href="#academy"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Academia
                  </Link>
                  <Link
                    href="#community"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Comunidad
                  </Link>
                  <Link
                    href="#support"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Soporte
                  </Link>
                </div>
              </div>

              {/* Company Section */}
              <div className="space-y-3">
                <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Empresa
                </h3>
                <div className="space-y-1">
                  <Link
                    href="#about"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Info className="h-4 w-4" />
                    Acerca de Nosotros
                  </Link>
                  <Link
                    href="#careers"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Briefcase className="h-4 w-4" />
                    Carreras
                  </Link>
                  <Link
                    href="#partners"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <Users className="h-4 w-4" />
                    Socios
                  </Link>
                  <Link
                    href="#contact"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contacto
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
