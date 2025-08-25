
import { cn } from "~/lib/utils";
import {
  Search,
  Image,
  Home,
  Star,
  Users,
  MessageSquare,
  Phone,
  FileText,
  Code,
  Share2,
  Building,
  Database,
} from "lucide-react";
import type { WebsiteTab } from "~/types/website-settings";

// Navigation items - PRESERVE existing navigation structure
const navigationItems: (WebsiteTab & { color?: string })[] = [
  {
    id: "seo",
    label: "SEO",
    description: "Optimización para buscadores",
    icon: Search,
  },
  {
    id: "branding",
    label: "Marca",
    description: "Logo y favicon",
    icon: Image,
  },
  {
    id: "social",
    label: "Redes Sociales",
    description: "Enlaces a redes sociales",
    icon: Share2,
  },
  {
    id: "hero",
    label: "Hero",
    description: "Sección principal",
    icon: Home,
  },
  {
    id: "featured",
    label: "Destacados",
    description: "Propiedades destacadas",
    icon: Star,
  },
  {
    id: "about",
    label: "Nosotros",
    description: "Información de la empresa",
    icon: Users,
  },
  {
    id: "properties",
    label: "Propiedades",
    description: "Configuración de listados",
    icon: Building,
  },
  {
    id: "testimonials",
    label: "Testimonios",
    description: "Reseñas de clientes",
    icon: MessageSquare,
  },
  {
    id: "contact",
    label: "Contacto",
    description: "Información de contacto",
    icon: Phone,
  },
  {
    id: "footer",
    label: "Pie de Página",
    description: "Enlaces y copyright",
    icon: FileText,
  },
  {
    id: "head",
    label: "Head/Scripts",
    description: "Código personalizado",
    icon: Code,
  },
  {
    id: "meta",
    label: "Meta",
    description: "Configuración de metadatos",
    icon: Database,
  },
];

interface WebsiteSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  hasUnsavedChanges: boolean;
}

export function WebsiteSidebar({ 
  activeSection, 
  onSectionChange, 
  hasUnsavedChanges 
}: WebsiteSidebarProps) {
  const handleSectionClick = (sectionId: string) => {
    // TODO: Add unsaved changes warning if needed
    if (hasUnsavedChanges) {
      // For now, just proceed - we can add confirmation dialog later if needed
    }
    onSectionChange(sectionId);
  };

  return (
    <div className="w-80 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-6 flex-shrink-0">
        <h2 className="text-lg font-semibold">Configuración del Sitio Web</h2>
        <p className="text-sm text-muted-foreground">
          Personaliza la apariencia y contenido de tu sitio web
        </p>
      </div>
      
      <nav className="space-y-2 px-4 pb-4 flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors rounded-md",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                "group relative"
              )}
            >
              <Icon 
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  item.color ?? (isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")
                )}
              />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.description}
                </div>
              </div>
              
            </button>
          );
        })}
      </nav>
    </div>
  );
}