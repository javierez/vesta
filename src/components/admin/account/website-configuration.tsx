"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "~/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "~/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
  Loader2,
  Check,
  ChevronRight,
  Share2,
  Building,
  RefreshCw,
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  MapPin,
  Mail,
  X,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWebsiteConfigurationAction,
  updateWebsiteSectionAction,
  getCurrentUserAccountId,
  getTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  seedTestimonialsAction,
} from "~/app/actions/website-settings";
import {
  websiteConfigurationSchema,
  type WebsiteConfigurationInput,
  type WebsiteTab,
  type Office,
  type Testimonial,
} from "~/types/website-settings";

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
    color: "text-blue-600",
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
    color: "text-gray-600",
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
];

export function WebsiteConfiguration() {
  const { data: session } = useSession();
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("seo");
  const [showHeroImageInput, setShowHeroImageInput] = useState(false);
  const [showSocialInputs, setShowSocialInputs] = useState({
    facebook: false,
    instagram: false,
    linkedin: false,
    twitter: false,
    youtube: false,
  });
  const [editingOffice, setEditingOffice] = useState<string | null>(null);
  const [showAddOffice, setShowAddOffice] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [showAvatarInput, setShowAvatarInput] = useState<string | null>(null);
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  const form = useForm<WebsiteConfigurationInput>({
    resolver: zodResolver(websiteConfigurationSchema),
    defaultValues: {
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
      },
      seoProps: {
        title: "",
        description: "",
        keywords: "",
        name: "",
        email: "",
        telephone: "",
        url: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        ogType: "website",
        ogUrl: "",
        ogLocale: "es_ES",
        ogSiteName: "",
      },
      logo: "",
      favicon: "",
      heroProps: {
        title: "",
        subtitle: "",
        backgroundImage: "",
        findPropertyButton: "Explorar Propiedades",
        contactButton: "Contáctanos",
      },
      featuredProps: {
        title: "Propiedades Destacadas",
        subtitle: "",
      },
      aboutProps: {
        title: "Sobre Nosotros",
        subtitle: "",
        content: "",
        content2: "",
        image: "",
        services: [],
        maxServicesDisplayed: 6,
        servicesSectionTitle: "Nuestros Servicios",
        aboutSectionTitle: "Nuestra Misión",
        buttonName: "Contacta a Nuestro Equipo",
        showKPI: true,
        kpi1Name: "",
        kpi1Data: "",
        kpi2Name: "",
        kpi2Data: "",
        kpi3Name: "",
        kpi3Data: "",
        kpi4Name: "",
        kpi4Data: "",
      },
      propertiesProps: {
        title: "Nuestras Propiedades",
        subtitle: "",
        itemsPerPage: 12,
      },
      testimonialProps: {
        title: "Lo que dicen nuestros clientes",
        testimonials: [],
      },
      contactProps: {
        title: "Contáctanos",
        subtitle: "",
        messageForm: true,
        address: true,
        phone: true,
        mail: true,
        schedule: true,
        map: true,
        offices: [],
      },
      footerProps: {
        companyName: "",
        description: "",
        socialLinks: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
        },
        officeLocations: [],
        quickLinksVisibility: {
          inicio: true,
          propiedades: true,
          nosotros: true,
          reseñas: true,
          contacto: true,
          comprar: false,
          alquilar: false,
          vender: false,
        },
        propertyTypesVisibility: {
          pisos: true,
          casas: true,
          locales: true,
          solares: true,
          garajes: true,
        },
        copyright: "",
        links: [],
      },
      headProps: {
        customScripts: "",
        googleAnalytics: "",
        facebookPixel: "",
      },
    },
  });

  const loadTestimonials = async (userAccountId: bigint) => {
    try {
      console.log("🔄 CLIENT: Starting loadTestimonials for accountId:", userAccountId);
      setLoadingTestimonials(true);
      
      // Seed testimonials if none exist
      console.log("🌱 CLIENT: Calling seedTestimonialsAction...");
      const seedResult = await seedTestimonialsAction(userAccountId);
      console.log("🌱 CLIENT: Seed result:", seedResult);
      
      console.log("📖 CLIENT: Calling getTestimonialsAction...");
      const testimonialsResult = await getTestimonialsAction(userAccountId);
      console.log("📖 CLIENT: Get testimonials result:", testimonialsResult);
      
      if (testimonialsResult.success && testimonialsResult.data) {
        console.log("✅ CLIENT: Setting", testimonialsResult.data.length, "testimonials to state");
        // Convert null avatars to undefined to match the schema
        const testimonials = testimonialsResult.data.map(t => ({
          ...t,
          avatar: t.avatar || undefined
        }));
        setDbTestimonials(testimonials);
      } else {
        console.log("❌ CLIENT: No testimonials data or failed request");
      }
    } catch (error) {
      console.error("❌ CLIENT: Error loading testimonials:", error);
    } finally {
      console.log("🏁 CLIENT: Finished loading testimonials");
      setLoadingTestimonials(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const userAccountId = await getCurrentUserAccountId(session.user.id);

        if (!userAccountId) {
          setError("No se pudo obtener el ID de la cuenta");
          return;
        }

        setAccountId(userAccountId);
        const result = await getWebsiteConfigurationAction(userAccountId);

        if (result.success && result.data) {
          form.reset(result.data);
        }

        // Load testimonials
        await loadTestimonials(userAccountId);
      } catch (error) {
        console.error("Error loading website configuration:", error);
        setError("Error al cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [session, form]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      console.log("📝 Form data changed:", data);
      if (!isPending) {
        console.log("🔄 Setting hasUnsavedChanges to true");
        setHasUnsavedChanges(true);
      } else {
        console.log("⏸️ Skipping hasUnsavedChanges update during submission");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isPending]);

  // Reset input visibility when changing sections
  useEffect(() => {
    setShowHeroImageInput(false);
    setShowSocialInputs({
      facebook: false,
      instagram: false,
      linkedin: false,
      twitter: false,
      youtube: false,
    });
    setEditingOffice(null);
    setShowAddOffice(false);
    setEditingTestimonial(null);
    setShowAddTestimonial(false);
    setShowAvatarInput(null);
  }, [activeSection]);

  const addOffice = () => {
    const newOffice: Office = {
      id: `office-${Date.now()}`,
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
      },
      phoneNumbers: {
        main: "",
        sales: "",
      },
      emailAddresses: {
        info: "",
        sales: "",
      },
      scheduleInfo: {
        weekdays: "",
        saturday: "",
        sunday: "",
      },
      mapUrl: "",
      isDefault: false,
    };

    const currentOffices = form.getValues("contactProps.offices") || [];
    form.setValue("contactProps.offices", [...currentOffices, newOffice]);
    setEditingOffice(newOffice.id);
    setShowAddOffice(false);
  };

  const removeOffice = (officeId: string) => {
    const currentOffices = form.getValues("contactProps.offices") || [];
    form.setValue("contactProps.offices", currentOffices.filter(office => office.id !== officeId));
    if (editingOffice === officeId) {
      setEditingOffice(null);
    }
  };

  const updateOfficeField = (officeId: string, fieldPath: string, value: string | boolean) => {
    const currentOffices = form.getValues("contactProps.offices") ?? [];
    const updatedOffices = currentOffices.map(office => {
      if (office.id === officeId) {
        const updated = { ...office };
        const keys = fieldPath.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (key && current[key] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            current = current[key];
          }
        }
        const lastKey = keys[keys.length - 1];
        if (lastKey && current) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          current[lastKey] = value;
        }
        
        return updated;
      }
      return office;
    });
    form.setValue("contactProps.offices", updatedOffices);
  };

  const addTestimonial = async () => {
    if (!accountId) {
      console.log("❌ CLIENT: No accountId available for creating testimonial");
      return;
    }

    const newTestimonialData = {
      name: "Nuevo Testimonio",
      role: "Cliente",
      content: "Escribe aquí el testimonio...",
      avatar: "/properties/confident-leader.png",
      rating: 5,
      is_verified: true,
      sort_order: dbTestimonials.length + 1,
      is_active: true,
    };

    console.log("➕ CLIENT: Creating new testimonial with data:", newTestimonialData);

    try {
      const result = await createTestimonialAction(accountId, newTestimonialData);
      console.log("➕ CLIENT: Create testimonial result:", result);
      
      if (result.success && result.data) {
        console.log("✅ CLIENT: Testimonial created successfully, reloading...");
        await loadTestimonials(accountId);
        setEditingTestimonial(result.data.testimonial_id);
        setShowAddTestimonial(false);
        toast.success("Testimonio creado correctamente");
      } else {
        console.log("❌ CLIENT: Failed to create testimonial:", result.error);
        toast.error(result.error || "Error al crear el testimonio");
      }
    } catch (error) {
      console.error("❌ CLIENT: Error creating testimonial:", error);
      toast.error("Error al crear el testimonio");
    }
  };

  const removeTestimonial = async (testimonialId: string) => {
    if (!accountId) return;

    try {
      const result = await deleteTestimonialAction(accountId, testimonialId);
      if (result.success) {
        await loadTestimonials(accountId);
        if (editingTestimonial === testimonialId) {
          setEditingTestimonial(null);
        }
        toast.success("Testimonio eliminado correctamente");
      } else {
        toast.error(result.error || "Error al eliminar el testimonio");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Error al eliminar el testimonio");
    }
  };

  const updateTestimonialField = async (testimonialId: string, field: keyof Testimonial, value: string | number | boolean) => {
    if (!accountId) return;

    // Update local state immediately
    setDbTestimonials(prev => prev.map(testimonial => {
      if (testimonial.testimonial_id === testimonialId) {
        return { ...testimonial, [field]: value };
      }
      return testimonial;
    }));

    // Find the testimonial and update in database
    const testimonial = dbTestimonials.find(t => t.testimonial_id === testimonialId);
    if (!testimonial) return;

    const updatedTestimonial = { ...testimonial, [field]: value };

    try {
      const result = await updateTestimonialAction(accountId, testimonialId, {
        name: updatedTestimonial.name,
        role: updatedTestimonial.role,
        content: updatedTestimonial.content,
        avatar: updatedTestimonial.avatar || undefined,
        rating: updatedTestimonial.rating,
        is_verified: updatedTestimonial.is_verified,
        sort_order: updatedTestimonial.sort_order,
        is_active: updatedTestimonial.is_active,
      });

      if (!result.success) {
        // Revert local state on error
        await loadTestimonials(accountId);
        toast.error(result.error || "Error al actualizar el testimonio");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      await loadTestimonials(accountId);
      toast.error("Error al actualizar el testimonio");
    }
  };

  const onSubmitSection = () => {
    const formData = form.getValues();
    console.log("🎯 onSubmitSection called for section:", activeSection);
    console.log("🔑 accountId:", accountId);
    
    if (!accountId) {
      console.error("❌ No accountId available");
      setError("No se pudo identificar la cuenta");
      return;
    }

    // Get only the data for the current section
    const sectionData: Partial<WebsiteConfigurationInput> = {};
    
    switch (activeSection) {
      case 'seo':
        sectionData.seoProps = formData.seoProps;
        break;
      case 'branding':
        sectionData.logo = formData.logo;
        sectionData.favicon = formData.favicon;
        sectionData.logotype = formData.logotype;
        break;
      case 'hero':
        sectionData.heroProps = formData.heroProps;
        break;
      case 'featured':
        sectionData.featuredProps = formData.featuredProps;
        break;
      case 'about':
        sectionData.aboutProps = formData.aboutProps;
        break;
      case 'properties':
        sectionData.propertiesProps = formData.propertiesProps;
        break;
      case 'testimonials':
        sectionData.testimonialProps = formData.testimonialProps;
        break;
      case 'contact':
        sectionData.contactProps = formData.contactProps;
        break;
      case 'footer':
        sectionData.footerProps = formData.footerProps;
        break;
      case 'head':
        sectionData.headProps = formData.headProps;
        break;
      case 'social':
        sectionData.socialLinks = formData.socialLinks;
        break;
      default:
        console.error("❌ Unknown section:", activeSection);
        setError("Sección desconocida");
        return;
    }

    console.log("📋 Section data to save:", sectionData);
    console.log("🚀 Starting section submission...");
    
    startTransition(async () => {
      try {
        setError(null);
        console.log("📡 Calling updateWebsiteSectionAction...");
        
        const result = await updateWebsiteSectionAction(accountId, activeSection, sectionData);
        console.log("📥 Server response:", result);

        if (result.success) {
          console.log("✅ Section saved successfully");
          toast.success(`Sección ${activeSection} guardada correctamente`);
          setHasUnsavedChanges(false);
        } else {
          console.error("❌ Server returned error:", result.error);
          setError(result.error ?? "Error al guardar la configuración");
          toast.error(result.error ?? "Error al guardar la configuración");
        }
      } catch (error) {
        console.error("💥 Unexpected error during save:", error);
        setError("Error inesperado al guardar la configuración");
        toast.error("Error inesperado al guardar la configuración");
      }
    });
  };


  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!accountId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar la configuración</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative flex h-auto flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:h-[600px] lg:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full border-b border-r-0 border-gray-100 bg-gray-50/50 lg:min-h-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Configuración del Sitio
          </h3>
        </div>

        <div className="flex gap-2 space-y-1 overflow-x-auto px-2 pb-2 lg:block lg:gap-0 lg:space-y-1 lg:overflow-x-visible lg:pb-0">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex w-full min-w-fit items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-all lg:min-w-0",
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="hidden text-xs text-gray-500 lg:block">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="hidden h-4 w-4 text-gray-400 lg:block" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Save Button - Small at bottom right of main content - Desktop only */}
      <div className="absolute bottom-4 right-4 z-10 hidden lg:block">
        <Button
          onClick={() => {
            console.log("🔘 Button clicked, isPending:", isPending, "hasUnsavedChanges:", hasUnsavedChanges);
            console.log("🎯 Active section:", activeSection);
            onSubmitSection();
          }}
          disabled={isPending || !hasUnsavedChanges}
          size="sm"
          className="min-w-[120px] shadow-lg bg-primary text-white hover:bg-primary/90 disabled:bg-gray-400 disabled:text-white"
        >
          {(() => {
            console.log("🎨 Button render state - isPending:", isPending, "hasUnsavedChanges:", hasUnsavedChanges);
            if (isPending) {
              return (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              );
            } else if (hasUnsavedChanges) {
              return "Guardar Cambios";
            } else {
              return (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardado
                </>
              );
            }
          })()}
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-y-auto">
        <Form {...form}>
          <form className="p-4 pb-16 lg:p-8 lg:pb-8">
            {/* SEO Section */}
            {activeSection === "seo" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Search className="h-5 w-5 text-gray-500" />
                    Optimización SEO
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Mejora la visibilidad de tu sitio en los motores de búsqueda
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seoProps.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Sitio</FormLabel>
                        <FormDescription>
                          Aparece en los resultados de búsqueda y en la pestaña del navegador
                        </FormDescription>
                        <FormControl>
                          <Input {...field} placeholder="Mi Inmobiliaria | Las mejores propiedades" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoProps.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Descripción</FormLabel>
                        <FormDescription>
                          Descripción breve que aparece en los resultados de búsqueda
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Encuentra las mejores propiedades en venta y alquiler..."
                            rows={3}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoProps.keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palabras Clave</FormLabel>
                        <FormDescription>
                          Separadas por comas, ayudan a los motores de búsqueda
                        </FormDescription>
                        <FormControl>
                          <Input {...field} placeholder="inmobiliaria, pisos, casas, alquiler, venta" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoProps.ogImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen Open Graph</FormLabel>
                        <FormDescription>
                          Imagen que aparece al compartir en redes sociales
                        </FormDescription>
                        <FormControl>
                          <Input {...field} placeholder="https://ejemplo.com/imagen-og.jpg" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Branding Section */}
            {activeSection === "branding" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Image className="h-5 w-5 text-gray-500" />
                    Marca
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Logo y favicon de tu empresa
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Logo */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Logo</h3>
                    {form.watch("logo") ? (
                      <div className="relative inline-block group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={form.watch("logo")} 
                          alt="Logo preview" 
                          className="max-h-24 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <p className="hidden text-sm text-red-500">Error al cargar la imagen</p>
                        <button
                          type="button"
                          onClick={() => window.location.href = 'http://localhost:3000/account-admin/branding'}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"
                        >
                          <RefreshCw className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = 'http://localhost:3000/account-admin/branding'}
                      >
                        Configurar logo
                      </Button>
                    )}
                  </div>

                  {/* Favicon */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Favicon</h3>
                    {form.watch("favicon") ? (
                      <div className="relative inline-block group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={form.watch("favicon")} 
                          alt="Favicon preview" 
                          className="max-h-24 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <p className="hidden text-sm text-red-500">Error al cargar la imagen</p>
                        <button
                          type="button"
                          onClick={() => window.location.href = 'http://localhost:3000/account-admin/branding'}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"
                        >
                          <RefreshCw className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = 'http://localhost:3000/account-admin/branding'}
                      >
                        Configurar favicon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hero Section */}
            {activeSection === "hero" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Home className="h-5 w-5 text-gray-500" />
                    Sección Principal
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    La primera sección que ven los visitantes
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="heroProps.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título Principal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Encuentra Tu Casa Ideal" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroProps.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Te ayudamos a encontrar la propiedad perfecta"
                            rows={2}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Imagen de Fondo</FormLabel>
                    {form.watch("heroProps.backgroundImage") && !showHeroImageInput ? (
                      <div className="relative inline-block group mt-3 w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={form.watch("heroProps.backgroundImage")} 
                          alt="Hero background preview" 
                          className="w-full max-h-48 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <p className="hidden text-sm text-red-500">Error al cargar la imagen</p>
                        <button
                          type="button"
                          onClick={() => setShowHeroImageInput(true)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"
                        >
                          <RefreshCw className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : !form.watch("heroProps.backgroundImage") && !showHeroImageInput ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHeroImageInput(true)}
                        className="mt-3"
                      >
                        Configurar imagen de fondo
                      </Button>
                    ) : (
                      <FormField
                        control={form.control}
                        name="heroProps.backgroundImage"
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <FormControl>
                              <Input {...field} placeholder="https://ejemplo.com/hero-bg.jpg" />
                            </FormControl>
                            <FormMessage />
                            {showHeroImageInput && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowHeroImageInput(false)}
                                className="mt-2"
                              >
                                Cancelar
                              </Button>
                            )}
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="heroProps.findPropertyButton"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto Botón Principal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Explorar Propiedades" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroProps.contactButton"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto Botón Secundario</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Contáctanos" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Featured Section */}
            {activeSection === "featured" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Star className="h-5 w-5 text-gray-500" />
                    Propiedades Destacadas
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configuración de la sección de propiedades destacadas
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featuredProps.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Sección</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Propiedades Destacadas" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredProps.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Las mejores oportunidades del mercado" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredProps.maxItems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número máximo de propiedades a mostrar</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            placeholder="6"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 6)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === "about" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Users className="h-5 w-5 text-gray-500" />
                    Sobre Nosotros
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Información sobre tu empresa
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="aboutProps.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sobre Nosotros" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutProps.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tu socio de confianza en el viaje inmobiliario" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutProps.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido Principal</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="En nuestra inmobiliaria, creemos que encontrar la propiedad perfecta..."
                            rows={4}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutProps.content2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido Secundario</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Nuestro enfoque personalizado y atención al detalle..."
                            rows={4}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutProps.image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://ejemplo.com/nosotros.jpg" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Section Titles */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aboutProps.servicesSectionTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Sección Servicios</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nuestros Servicios" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aboutProps.aboutSectionTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Sección Misión</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nuestra Misión" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="aboutProps.buttonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto del Botón</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Contacta a Nuestro Equipo" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* KPI Configuration */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Indicadores Clave (KPIs)</h3>
                    
                    <FormField
                      control={form.control}
                      name="aboutProps.showKPI"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 mb-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Mostrar KPIs</FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch("aboutProps.showKPI") && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="aboutProps.kpi1Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 1 - Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Años de Experiencia" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aboutProps.kpi1Data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 1 - Valor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="15+" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="aboutProps.kpi2Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 2 - Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Propiedades Vendidas" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aboutProps.kpi2Data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 2 - Valor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="500+" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="aboutProps.kpi3Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 3 - Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Agentes Profesionales" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aboutProps.kpi3Data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 3 - Valor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="50+" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="aboutProps.kpi4Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 4 - Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Clientes Satisfechos" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aboutProps.kpi4Data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KPI 4 - Valor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="98%" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Services Configuration */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Servicios</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Los servicios se pueden configurar desde el panel de administración.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="aboutProps.maxServicesDisplayed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo de servicios a mostrar</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              placeholder="6"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 6)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Properties Section */}
            {activeSection === "properties" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Building className="h-5 w-5 text-gray-500" />
                    Configuración de Propiedades
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Ajustes para la visualización de propiedades
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="propertiesProps.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Sección</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nuestras Propiedades" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertiesProps.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Encuentra la propiedad perfecta para ti" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertiesProps.itemsPerPage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propiedades por Página</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            placeholder="12"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertiesProps.defaultSort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordenamiento por defecto</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="price-desc">Precio: Mayor a menor</option>
                            <option value="price-asc">Precio: Menor a mayor</option>
                            <option value="date-desc">Más recientes primero</option>
                            <option value="date-asc">Más antiguos primero</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertiesProps.buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto del botón</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ver Todas las Propiedades" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Testimonials Section */}
            {activeSection === "testimonials" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    Testimonios
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Reseñas y testimonios de clientes
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="testimonialProps.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título de la Sección</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Lo que dicen nuestros clientes" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testimonialProps.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos." />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testimonialProps.itemsPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Testimonios por página</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              placeholder="3"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Testimonials Management */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        Testimonios
                        {loadingTestimonials && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                        )}
                      </h3>
                      {!showAddTestimonial && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddTestimonial(true)}
                          className="flex items-center gap-2"
                          disabled={loadingTestimonials}
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Testimonio
                        </Button>
                      )}
                    </div>

                    {showAddTestimonial && (
                      <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Agregar nuevo testimonio</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddTestimonial(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={addTestimonial}
                          className="w-full"
                          disabled={loadingTestimonials}
                        >
                          Crear Testimonio
                        </Button>
                      </div>
                    )}

                    {/* Testimonial Cards */}
                    <div className="space-y-4">
                      {dbTestimonials.map((testimonial, index) => (
                        <div key={testimonial.testimonial_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {testimonial.avatar && (
                                <img 
                                  src={testimonial.avatar} 
                                  alt={testimonial.name} 
                                  className="h-8 w-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="text-sm font-medium">
                                {testimonial.name || `Testimonio ${index + 1}`}
                              </span>
                              {testimonial.is_verified && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Verificado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTestimonial(editingTestimonial === testimonial.testimonial_id ? null : testimonial.testimonial_id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTestimonial(testimonial.testimonial_id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {editingTestimonial === testimonial.testimonial_id && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                              {/* Name and Role */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                                  <Input
                                    value={testimonial.name}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'name', e.target.value)}
                                    placeholder="María González"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Rol/Título</label>
                                  <Input
                                    value={testimonial.role}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'role', e.target.value)}
                                    placeholder="Compradora"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Content */}
                              <div>
                                <label className="text-sm font-medium text-gray-700">Testimonio</label>
                                <Textarea
                                  value={testimonial.content}
                                  onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'content', e.target.value)}
                                  placeholder="El servicio fue excelente..."
                                  rows={4}
                                  className="mt-1"
                                />
                              </div>

                              {/* Avatar */}
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-3">Avatar</label>
                                {testimonial.avatar && showAvatarInput !== testimonial.testimonial_id ? (
                                  <div className="relative inline-block group mt-3">
                                    <img 
                                      src={testimonial.avatar} 
                                      alt={`Avatar de ${testimonial.name}`} 
                                      className="h-16 w-16 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <p className="hidden text-sm text-red-500">Error al cargar la imagen</p>
                                    <button
                                      type="button"
                                      onClick={() => setShowAvatarInput(testimonial.testimonial_id)}
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full"
                                    >
                                      <RefreshCw className="h-4 w-4 text-white" />
                                    </button>
                                  </div>
                                ) : !testimonial.avatar && showAvatarInput !== testimonial.testimonial_id ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAvatarInput(testimonial.testimonial_id)}
                                    className="mt-3"
                                  >
                                    Configurar avatar
                                  </Button>
                                ) : (
                                  <div className="mt-3">
                                    <Input
                                      value={testimonial.avatar || ''}
                                      onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'avatar', e.target.value)}
                                      placeholder="/properties/confident-leader.png"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowAvatarInput(null)}
                                      className="mt-2"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Rating and Sort Order */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Calificación</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={testimonial.rating}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'rating', parseInt(e.target.value) || 5)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Orden</label>
                                  <Input
                                    type="number"
                                    value={testimonial.sort_order}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'sort_order', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Toggles */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={testimonial.is_verified}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'is_verified', e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                  <label className="text-sm font-medium text-gray-700">
                                    Verificado
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={testimonial.is_active}
                                    onChange={(e) => updateTestimonialField(testimonial.testimonial_id, 'is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                  <label className="text-sm font-medium text-gray-700">
                                    Activo
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {editingTestimonial !== testimonial.testimonial_id && (
                            <div className="text-sm text-gray-600 space-y-1">
                              {testimonial.role && (
                                <p className="font-medium">{testimonial.role}</p>
                              )}
                              {testimonial.content && (
                                <p className="italic">"{testimonial.content}"</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-yellow-500">{"★".repeat(testimonial.rating)}</span>
                                <span className="text-gray-400">{"★".repeat(5 - testimonial.rating)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {dbTestimonials.length === 0 && !loadingTestimonials && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No hay testimonios configurados</p>
                        <p className="text-sm">Agrega tu primer testimonio para comenzar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === "contact" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Phone className="h-5 w-5 text-gray-500" />
                    Información de Contacto
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configuración de información de contacto y oficinas
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactProps.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Contáctanos" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactProps.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Estamos aquí para ayudarte en tu próximo paso inmobiliario" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Display Options */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Opciones de Visualización</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactProps.messageForm"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Formulario de mensaje</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactProps.address"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Mostrar dirección</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactProps.phone"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Mostrar teléfono</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactProps.mail"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Mostrar email</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactProps.schedule"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Mostrar horarios</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactProps.map"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Mostrar mapa</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Offices Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Oficinas</h3>
                      {!showAddOffice && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddOffice(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Oficina
                        </Button>
                      )}
                    </div>

                    {showAddOffice && (
                      <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Agregar nueva oficina</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddOffice(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={addOffice}
                          className="w-full"
                        >
                          Crear Oficina
                        </Button>
                      </div>
                    )}

                    {/* Office Cards */}
                    <div className="space-y-4">
                      {form.watch("contactProps.offices")?.map((office, index) => (
                        <div key={office.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {office.name || `Oficina ${index + 1}`}
                              </span>
                              {office.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingOffice(editingOffice === office.id ? null : office.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOffice(office.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {editingOffice === office.id && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                              {/* Office Name */}
                              <div>
                                <label className="text-sm font-medium text-gray-700">Nombre de la Oficina</label>
                                <Input
                                  value={office.name}
                                  onChange={(e) => updateOfficeField(office.id, 'name', e.target.value)}
                                  placeholder="Oficina de Madrid"
                                  className="mt-1"
                                />
                              </div>

                              {/* Address */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Calle</label>
                                  <Input
                                    value={office.address.street}
                                    onChange={(e) => updateOfficeField(office.id, 'address.street', e.target.value)}
                                    placeholder="Calle Gran Vía 123"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Ciudad</label>
                                  <Input
                                    value={office.address.city}
                                    onChange={(e) => updateOfficeField(office.id, 'address.city', e.target.value)}
                                    placeholder="Madrid"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Provincia</label>
                                  <Input
                                    value={office.address.state}
                                    onChange={(e) => updateOfficeField(office.id, 'address.state', e.target.value)}
                                    placeholder="MD"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">País</label>
                                  <Input
                                    value={office.address.country}
                                    onChange={(e) => updateOfficeField(office.id, 'address.country', e.target.value)}
                                    placeholder="España"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Phone Numbers */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Teléfono Principal</label>
                                  <Input
                                    value={office.phoneNumbers.main}
                                    onChange={(e) => updateOfficeField(office.id, 'phoneNumbers.main', e.target.value)}
                                    placeholder="+34 910 234 567"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Teléfono Ventas</label>
                                  <Input
                                    value={office.phoneNumbers.sales ?? ""}
                                    onChange={(e) => updateOfficeField(office.id, 'phoneNumbers.sales', e.target.value)}
                                    placeholder="+34 910 234 568"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Email Addresses */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Email Principal</label>
                                  <Input
                                    value={office.emailAddresses.info}
                                    onChange={(e) => updateOfficeField(office.id, 'emailAddresses.info', e.target.value)}
                                    placeholder="madrid@empresa.com"
                                    type="email"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Email Ventas</label>
                                  <Input
                                    value={office.emailAddresses.sales ?? ""}
                                    onChange={(e) => updateOfficeField(office.id, 'emailAddresses.sales', e.target.value)}
                                    placeholder="ventas.madrid@empresa.com"
                                    type="email"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Schedule */}
                              <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Horarios</label>
                                <div className="grid grid-cols-1 gap-2">
                                  <Input
                                    value={office.scheduleInfo.weekdays}
                                    onChange={(e) => updateOfficeField(office.id, 'scheduleInfo.weekdays', e.target.value)}
                                    placeholder="Lunes a Viernes: 9:30 - 19:00"
                                    className="mt-1"
                                  />
                                  <Input
                                    value={office.scheduleInfo.saturday}
                                    onChange={(e) => updateOfficeField(office.id, 'scheduleInfo.saturday', e.target.value)}
                                    placeholder="Sábado: 10:00 - 15:00"
                                    className="mt-1"
                                  />
                                  <Input
                                    value={office.scheduleInfo.sunday}
                                    onChange={(e) => updateOfficeField(office.id, 'scheduleInfo.sunday', e.target.value)}
                                    placeholder="Domingo: Cerrado"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Map URL */}
                              <div>
                                <label className="text-sm font-medium text-gray-700">URL del Mapa</label>
                                <Input
                                  value={office.mapUrl}
                                  onChange={(e) => updateOfficeField(office.id, 'mapUrl', e.target.value)}
                                  placeholder="https://www.google.com/maps/embed?pb=..."
                                  className="mt-1"
                                />
                              </div>

                              {/* Default Office Toggle */}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={office.isDefault ?? false}
                                  onChange={(e) => updateOfficeField(office.id, 'isDefault', e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                  Establecer como oficina principal
                                </label>
                              </div>
                            </div>
                          )}

                          {editingOffice !== office.id && (
                            <div className="text-sm text-gray-600 space-y-1">
                              {office.address.street && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{office.address.street}, {office.address.city}</span>
                                </div>
                              )}
                              {office.phoneNumbers.main && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{office.phoneNumbers.main}</span>
                                </div>
                              )}
                              {office.emailAddresses.info && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{office.emailAddresses.info}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {form.watch("contactProps.offices")?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No hay oficinas configuradas</p>
                        <p className="text-sm">Agrega tu primera oficina para comenzar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Section */}
            {activeSection === "footer" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Pie de Página
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configuración del footer del sitio
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="footerProps.companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mi Inmobiliaria" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerProps.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tu socio de confianza para encontrar la propiedad perfecta..."
                              rows={3}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerProps.copyright"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto de Copyright</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="© 2024 Mi Inmobiliaria. Todos los derechos reservados." />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quick Links Visibility */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Enlaces Rápidos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="footerProps.quickLinksVisibility.inicio"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Inicio</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.quickLinksVisibility.propiedades"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Propiedades</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.quickLinksVisibility.nosotros"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Nosotros</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.quickLinksVisibility.contacto"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Contacto</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Property Types Visibility */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tipos de Propiedades</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="footerProps.propertyTypesVisibility.pisos"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Pisos</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.propertyTypesVisibility.casas"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Casas</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.propertyTypesVisibility.locales"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Locales</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerProps.propertyTypesVisibility.garajes"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Garajes</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      Las oficinas del footer se toman automáticamente de la configuración de contacto
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Section */}
            {activeSection === "social" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Share2 className="h-5 w-5 text-gray-500" />
                    Redes Sociales
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enlaces a tus perfiles en redes sociales
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {/* Facebook */}
                    <div>
                      {form.watch("socialLinks.facebook") ? (
                        <div className="relative inline-block group">
                          <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                            <Facebook className="h-5 w-5 text-gray-600" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: true }))}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
                          >
                            <RefreshCw className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: true }))}
                          className="flex items-center justify-center w-12 h-12 p-0"
                        >
                          <Facebook className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {/* Instagram */}
                    <div>
                      {form.watch("socialLinks.instagram") ? (
                        <div className="relative inline-block group">
                          <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                            <Instagram className="h-5 w-5 text-gray-600" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: true }))}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
                          >
                            <RefreshCw className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: true }))}
                          className="flex items-center justify-center w-12 h-12 p-0"
                        >
                          <Instagram className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {/* LinkedIn */}
                    <div>
                      {form.watch("socialLinks.linkedin") ? (
                        <div className="relative inline-block group">
                          <div className="flex items-center justify-center w-12 h-12 border rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                            <Linkedin className="h-5 w-5 text-gray-600" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: true }))}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg"
                          >
                            <RefreshCw className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: true }))}
                          className="flex items-center justify-center w-12 h-12 p-0"
                        >
                          <Linkedin className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Input fields below icons */}
                  {(showSocialInputs.facebook || showSocialInputs.instagram || showSocialInputs.linkedin) && (
                    <div className="space-y-4 pt-2">
                      {showSocialInputs.facebook && (
                        <FormField
                          control={form.control}
                          name="socialLinks.facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Facebook className="h-4 w-4" />
                                Facebook
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://facebook.com/miempresa" />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSocialInputs(prev => ({ ...prev, facebook: false }))}
                                className="mt-2"
                              >
                                Cancelar
                              </Button>
                            </FormItem>
                          )}
                        />
                      )}

                      {showSocialInputs.instagram && (
                        <FormField
                          control={form.control}
                          name="socialLinks.instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Instagram className="h-4 w-4" />
                                Instagram
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://instagram.com/miempresa" />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSocialInputs(prev => ({ ...prev, instagram: false }))}
                                className="mt-2"
                              >
                                Cancelar
                              </Button>
                            </FormItem>
                          )}
                        />
                      )}

                      {showSocialInputs.linkedin && (
                        <FormField
                          control={form.control}
                          name="socialLinks.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Linkedin className="h-4 w-4" />
                                LinkedIn
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://linkedin.com/company/miempresa" />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSocialInputs(prev => ({ ...prev, linkedin: false }))}
                                className="mt-2"
                              >
                                Cancelar
                              </Button>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Head/Scripts Section */}
            {activeSection === "head" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <Code className="h-5 w-5 text-gray-500" />
                    Scripts y Código Personalizado
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Añade scripts de seguimiento y código personalizado
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="headProps.googleAnalytics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Analytics ID</FormLabel>
                        <FormDescription>
                          ID de seguimiento de Google Analytics (ej: G-XXXXXXXXXX)
                        </FormDescription>
                        <FormControl>
                          <Input {...field} placeholder="G-XXXXXXXXXX" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headProps.facebookPixel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook Pixel ID</FormLabel>
                        <FormDescription>
                          ID del píxel de Facebook para seguimiento
                        </FormDescription>
                        <FormControl>
                          <Input {...field} placeholder="1234567890" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headProps.customScripts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scripts Personalizados</FormLabel>
                        <FormDescription>
                          Código HTML/JavaScript personalizado para el head
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="<!-- Tu código personalizado aquí -->"
                            rows={6}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Save Button for Mobile - at bottom of form */}
            <div className="mt-8 flex justify-end lg:hidden">
              <Button
                onClick={() => onSubmitSection()}
                disabled={isPending || !hasUnsavedChanges}
                size="sm"
                className="min-w-[120px] bg-primary text-white hover:bg-primary disabled:bg-gray-400 disabled:text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : hasUnsavedChanges ? (
                  "Guardar Cambios"
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardado
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}