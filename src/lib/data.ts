export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje";

export type PropertyImage = {
  propertyImageId: bigint;
  propertyId: bigint;
  referenceNumber: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageKey: string;
  imageTag?: string;
  s3key: string;
  imageOrder: number;
};

export type Location = {
  neighborhoodId: bigint;
  city: string;
  province: string;
  municipality: string;
  neighborhood: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type Property = {
  propertyId: bigint;
  referenceNumber: string;
  title?: string;
  description?: string;
  propertyType: string;
  propertySubtype?: string;
  formPosition: number;
  price?: string;
  bedrooms?: number;
  bathrooms?: string;
  squareMeter?: number;
  yearBuilt?: number;
  cadastralReference?: string;
  builtSurfaceArea?: string;
  street?: string;
  addressDetails?: string;
  postalCode?: string;
  neighborhoodId?: bigint;
  latitude?: string;
  longitude?: string;
  energyCertification?: string;
  hasHeating: boolean;
  heatingType?: string;
  hasElevator: boolean;
  hasGarage: boolean;
  hasStorageRoom: boolean;
  optionalGarage?: boolean;
  optionalGaragePrice?: string;
  optionalStorageRoom?: boolean;
  optionalStorageRoomPrice?: string;
  hasKeys?: boolean;
  createdAt: Date;
  updatedAt: Date;
  listedByAgentId?: bigint;
  ownerId?: bigint;
  isActive: boolean;
  garageType?: string;
  garageSpaces?: number;
  garageInBuilding?: boolean;
  elevatorToGarage?: boolean;
  garageNumber?: string;
  disabledAccessible?: boolean;
  vpo?: boolean;
  videoIntercom?: boolean;
  conciergeService?: boolean;
  securityGuard?: boolean;
  satelliteDish?: boolean;
  doubleGlazing?: boolean;
  alarm?: boolean;
  securityDoor?: boolean;
  brandNew?: boolean;
  newConstruction?: boolean;
  underConstruction?: boolean;
  needsRenovation?: boolean;
  lastRenovationYear?: number;
  kitchenType?: string;
  hotWaterType?: string;
  openKitchen?: boolean;
  frenchKitchen?: boolean;
  furnishedKitchen?: boolean;
  pantry?: boolean;
  storageRoomSize?: number;
  storageRoomNumber?: string;
  terrace?: boolean;
  terraceSize?: number;
  wineCellar?: boolean;
  wineCellarSize?: number;
  livingRoomSize?: number;
  balconyCount?: number;
  galleryCount?: number;
  buildingFloors?: number;
  builtInWardrobes?: string;
  mainFloorType?: string;
  shutterType?: string;
  carpentryType?: string;
  orientation?: string;
  airConditioningType?: string;
  windowType?: string;
  exterior?: boolean;
  bright?: boolean;
  views?: boolean;
  mountainViews?: boolean;
  seaViews?: boolean;
  beachfront?: boolean;
  jacuzzi?: boolean;
  hydromassage?: boolean;
  garden?: boolean;
  pool?: boolean;
  homeAutomation?: boolean;
  musicSystem?: boolean;
  laundryRoom?: boolean;
  coveredClothesline?: boolean;
  fireplace?: boolean;
  gym?: boolean;
  sportsArea?: boolean;
  childrenArea?: boolean;
  suiteBathroom?: boolean;
  nearbyPublicTransport?: boolean;
  communityPool?: boolean;
  privatePool?: boolean;
  tennisCourt?: boolean;
};

export type Prospect = {
  preListingId: bigint;
  contactId: bigint;
  sourceType: string;
  sourceDetails?: string;
  status: string;
  statusUpdatedAt: Date;
  listingId?: bigint;
  createdAt: Date;
  updatedAt: Date;
};

// Mock data for development/testing
export const properties: Property[] = [
  {
    propertyId: BigInt(1),
    referenceNumber: "VESTA2024000001",
    title: "Piso en Avenida Ordoño II (Centro Ciudad)",
    description: "Beautiful apartment with stunning views of the city center",
    propertyType: "piso",
    propertySubtype: "Apartment",
    formPosition: 1,
    price: "350000",
    bedrooms: 3,
    bathrooms: "2",
    squareMeter: 120,
    yearBuilt: 2020,
    cadastralReference: "123456789ABC",
    builtSurfaceArea: "110",
    street: "Avenida Ordoño II, 15",
    postalCode: "24001",
    neighborhoodId: BigInt(1), // Centro Ciudad
    latitude: "42.59870000",
    longitude: "-5.56710000",
    energyCertification: "A",
    hasHeating: true,
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: true,
    exterior: true,
    bright: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    gym: true,
    sportsArea: true,
    childrenArea: true,
    suiteBathroom: true,
    nearbyPublicTransport: true,
    communityPool: true,
    privatePool: false,
    tennisCourt: true,
  },
  {
    propertyId: BigInt(2),
    referenceNumber: "VESTA2024000002",
    title: "Piso en Calle Ancha (Casco Antiguo)",
    description: "Renovated apartment in historic building near the Cathedral",
    propertyType: "piso",
    propertySubtype: "Ground floor",
    formPosition: 2,
    price: "275000",
    bedrooms: 2,
    bathrooms: "1",
    squareMeter: 85,
    yearBuilt: 1960,
    cadastralReference: "987654321XYZ",
    builtSurfaceArea: "75",
    street: "Calle Ancha, 8",
    postalCode: "24003",
    neighborhoodId: BigInt(9), // Casco Antiguo
    latitude: "42.59870000",
    longitude: "-5.56710000",
    energyCertification: "C",
    hasHeating: true,
    hasElevator: false,
    hasGarage: false,
    hasStorageRoom: false,
    exterior: true,
    bright: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    gym: false,
    sportsArea: false,
    childrenArea: false,
    suiteBathroom: false,
    nearbyPublicTransport: true,
    communityPool: false,
    privatePool: false,
    tennisCourt: false,
  },
  {
    propertyId: BigInt(3),
    referenceNumber: "VESTA2024000003",
    title: "Local en Avenida de la Facultad (Las Ventas)",
    description: "Prime location commercial property near university area",
    propertyType: "local",
    propertySubtype: "Offices",
    formPosition: 3,
    price: "450000",
    bedrooms: 0,
    bathrooms: "1",
    squareMeter: 150,
    yearBuilt: 1990,
    cadastralReference: "456789123DEF",
    builtSurfaceArea: "150",
    street: "Avenida de la Facultad, 25",
    postalCode: "24004",
    neighborhoodId: BigInt(10), // Las Ventas
    latitude: "42.59870000",
    longitude: "-5.56710000",
    energyCertification: "B",
    hasHeating: true,
    hasElevator: true,
    hasGarage: false,
    hasStorageRoom: true,
    exterior: true,
    bright: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    gym: false,
    sportsArea: false,
    childrenArea: false,
    suiteBathroom: false,
    nearbyPublicTransport: true,
    communityPool: false,
    privatePool: false,
    tennisCourt: false,
  },
  {
    propertyId: BigInt(4),
    referenceNumber: "VESTA2024000004",
    title: "Casa en Calle La Lastra (La Chantría- La Lastra)",
    description: "Large family home with garden in quiet residential area",
    propertyType: "casa",
    propertySubtype: "House",
    formPosition: 4,
    price: "550000",
    bedrooms: 4,
    bathrooms: "3",
    squareMeter: 250,
    yearBuilt: 2005,
    cadastralReference: "789123456GHI",
    builtSurfaceArea: "220",
    street: "Calle La Lastra, 12",
    postalCode: "24005",
    neighborhoodId: BigInt(2), // La Chantría- La Lastra
    latitude: "42.59870000",
    longitude: "-5.56710000",
    energyCertification: "A",
    hasHeating: true,
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    exterior: true,
    bright: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    gym: false,
    sportsArea: true,
    childrenArea: true,
    suiteBathroom: true,
    nearbyPublicTransport: false,
    communityPool: false,
    privatePool: true,
    tennisCourt: false,
  },
  {
    propertyId: BigInt(5),
    referenceNumber: "VESTA2024000005",
    title: "Garaje en Calle Padre Isla (Centro Ciudad)",
    description: "Convenient parking space in central location",
    propertyType: "garaje",
    propertySubtype: "Individual",
    formPosition: 5,
    price: "25000",
    bedrooms: 0,
    bathrooms: "0",
    squareMeter: 20,
    yearBuilt: 2010,
    cadastralReference: "321654987JKL",
    builtSurfaceArea: "20",
    street: "Calle Padre Isla, 5",
    postalCode: "24002",
    neighborhoodId: BigInt(1), // Centro Ciudad
    latitude: "42.59870000",
    longitude: "-5.56710000",
    energyCertification: "N/A",
    hasHeating: false,
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: false,
    exterior: false,
    bright: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    gym: false,
    sportsArea: false,
    childrenArea: false,
    suiteBathroom: false,
    nearbyPublicTransport: true,
    communityPool: false,
    privatePool: false,
    tennisCourt: false,
  },
];

export const propertyImages: PropertyImage[] = [
  {
    propertyImageId: BigInt(1),
    propertyId: BigInt(1),
    referenceNumber: "VESTA2024000001",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000001/images/image_1_b89dc078.jpg",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000001/images/image_1_b89dc078.jpg",
    imageTag: "exterior",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000001/images/image_1_b89dc078.jpg",
    imageOrder: 1,
  },
  {
    propertyImageId: BigInt(2),
    propertyId: BigInt(1),
    referenceNumber: "VESTA2024000001",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000001/images/image_2_9e28838e.png",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000001/images/image_2_9e28838e.png",
    imageTag: "interior",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000001/images/image_2_9e28838e.png",
    imageOrder: 2,
  },
  {
    propertyImageId: BigInt(3),
    propertyId: BigInt(1),
    referenceNumber: "VESTA2024000001",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000001/images/image_3_4e0e1792.jpg",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000001/images/image_3_4e0e1792.jpg",
    imageTag: "dormitorio",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000001/images/image_3_4e0e1792.jpg",
    imageOrder: 3,
  },
  {
    propertyImageId: BigInt(4),
    propertyId: BigInt(2),
    referenceNumber: "VESTA2024000002",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000002/images/image_1_030aebc8.jpg",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000002/images/image_1_030aebc8.jpg",
    imageTag: "exterior",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000002/images/image_1_030aebc8.jpg",
    imageOrder: 1,
  },
  {
    propertyImageId: BigInt(5),
    propertyId: BigInt(2),
    referenceNumber: "VESTA2024000002",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000002/images/image_1_944360d4.jpg",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000002/images/image_1_944360d4.jpg",
    imageTag: "salon",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000002/images/image_1_944360d4.jpg",
    imageOrder: 2,
  },
  {
    propertyImageId: BigInt(6),
    propertyId: BigInt(2),
    referenceNumber: "VESTA2024000002",
    imageUrl:
      "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/VESTA2024000002/images/image_10_030aebc8.jpg",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    imageKey: "VESTA2024000002/images/image_10_030aebc8.jpg",
    imageTag: "cocina",
    s3key:
      "s3://inmobiliariaacropolis/VESTA2024000002/images/image_10_030aebc8.jpg",
    imageOrder: 3,
  },
];

export const testimonials = [
  {
    id: "1",
    name: "Sara Jiménez",
    role: "Propietaria",
    content:
      "Trabajar con Acropolis Bienes Raíces fue un sueño. Entendieron exactamente lo que estábamos buscando y nos encontraron nuestra casa familiar perfecta dentro de nuestro presupuesto. Todo el proceso fue fluido y sin estrés.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Miguel Chen",
    role: "Inversionista Inmobiliario",
    content:
      "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Emilia Rodríguez",
    role: "Compradora por Primera Vez",
    content:
      "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
    avatar: "/properties/serene-gaze.png",
    rating: 5,
    isVerified: true,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Carlos Mendoza",
    role: "Propietario",
    content:
      "Acropolis Bienes Raíces superó todas mis expectativas. Su equipo profesional me ayudó a encontrar la casa perfecta para mi familia en tiempo récord. El proceso fue fluido y sin complicaciones desde el principio hasta el final.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "María González",
    role: "Inversora Inmobiliaria",
    content:
      "Como inversora, valoro enormemente la experiencia y conocimiento del mercado que tiene el equipo de Acropolis. Han sido fundamentales para ampliar mi cartera de propiedades con inversiones rentables.",
    avatar: "/properties/confident-leader.png",
    rating: 4.5,
    isVerified: true,
    sortOrder: 5,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    name: "Alejandro Torres",
    role: "Comprador Primerizo",
    content:
      "Siendo mi primera compra, estaba nervioso por todo el proceso. El equipo de Acropolis me guió paso a paso, explicándome cada detalle y asegurándose de que entendiera todas mis opciones. ¡Ahora soy un orgulloso propietario!",
    avatar: "/properties/thoughtful-gaze.png",
    rating: 5,
    isVerified: true,
    sortOrder: 6,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export type SeoProps = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  name: string;
  image: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: Array<{
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  priceRange: string;
  areaServed: {
    name: string;
    sameAs: string;
  };
  hasOfferCatalog: {
    name: string;
    itemListElement: Array<{
      name: string;
      description: string;
    }>;
  };
  sameAs: string[];
  aggregateRating: {
    ratingValue: string;
    reviewCount: string;
    bestRating: string;
    worstRating: string;
  };
};

export type HeroProps = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  findPropertyButton: string;
  contactButton: string;
};

export type FeaturedProps = {
  title: string;
  subtitle: string;
  maxItems: number;
};

export type AboutProps = {
  title: string;
  subtitle: string;
  content: string;
  content2: string;
  image: string;
  services: Array<{
    title: string;
    icon: string;
  }>;
  maxServicesDisplayed: number;
  servicesSectionTitle: string;
  aboutSectionTitle: string;
  buttonName: string;
  showKPI: boolean;
  kpi1Name?: string;
  kpi1Data?: string;
  kpi2Name?: string;
  kpi2Data?: string;
  kpi3Name?: string;
  kpi3Data?: string;
  kpi4Name?: string;
  kpi4Data?: string;
};

export type PropertiesProps = {
  title: string;
  subtitle: string;
  itemsPerPage: number;
  defaultSort: string;
  buttonText: string;
};

export type TestimonialProps = {
  title: string;
  subtitle: string;
  itemsPerPage: number;
};

export type FooterProps = {
  companyName: string;
  description: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  officeLocations: Array<{
    name: string;
    address: string[];
    phone: string;
    email: string;
  }>;
  quickLinksVisibility: Record<string, boolean>;
  propertyTypesVisibility: Record<string, boolean>;
  copyright: string;
};

export type HeadProps = {
  title: string;
  description: string;
};

export type ContactProps = {
  title: string;
  subtitle: string;
  messageForm: boolean;
  address: boolean;
  phone: boolean;
  mail: boolean;
  schedule: boolean;
  map: boolean;
  // Contact information fields
  offices: Array<{
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    phoneNumbers: {
      main: string;
      sales: string;
    };
    emailAddresses: {
      info: string;
      sales: string;
    };
    scheduleInfo: {
      weekdays: string;
      saturday: string;
      sunday: string;
    };
    mapUrl: string;
    isDefault?: boolean;
  }>;
};

export type WebsiteConfig = {
  id: string;
  accountId: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  seoProps: SeoProps | null;
  logo: string | null;
  favicon: string | null;
  heroProps: HeroProps | null;
  featuredProps: FeaturedProps | null;
  aboutProps: AboutProps | null;
  propertiesProps: PropertiesProps | null;
  testimonialProps: TestimonialProps | null;
  contactProps: ContactProps | null;
  footerProps: FooterProps | null;
  headProps: HeadProps | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  accountId: string;
  name: string;
  shortName: string;
  status: "active" | "inactive" | "suspended";
  subscriptionType: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date | null;
  maxOffices: number;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
};

export const websiteConfigs: WebsiteConfig[] = [
  {
    id: "1",
    accountId: "1234",
    socialLinks: {
      facebook: "https://facebook.com/acropolisrealestate",
      linkedin: "https://linkedin.com/company/acropolisrealestate",
      twitter: "https://twitter.com/acropolisRE",
      instagram: "https://instagram.com/acropolisrealestate",
    },
    seoProps: {
      title: "Acropolis Bienes Raíces - Propiedades en España",
      description:
        "Tu socio de confianza en el mercado inmobiliario de España. Especializados en propiedades residenciales y comerciales.",
      name: "Acropolis Bienes Raíces",
      image: "https://acropolis-realestate.com/images/logo.jpg",
      url: "https://acropolis-realestate.com",
      telephone: "+34 987 123 456",
      email: "info@acropolis-realestate.com",
      address: {
        streetAddress: "123 Avenida Inmobiliaria",
        addressLocality: "León",
        addressRegion: "CL",
        postalCode: "24001",
        addressCountry: "ES",
      },
      geo: {
        latitude: 42.5987,
        longitude: -5.5671,
      },
      openingHoursSpecification: [
        {
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        {
          dayOfWeek: ["Saturday"],
          opens: "10:00",
          closes: "14:00",
        },
      ],
      priceRange: "€€",
      areaServed: {
        name: "León",
        sameAs: "https://es.wikipedia.org/wiki/Le%C3%B3n_(Espa%C3%B1a)",
      },
      hasOfferCatalog: {
        name: "Propiedades",
        itemListElement: [
          {
            name: "Pisos",
            description: "Pisos premium en las zonas más exclusivas de León",
          },
          {
            name: "Casas",
            description:
              "Chalets y casas exclusivas en ubicaciones privilegiadas",
          },
        ],
      },
      sameAs: [
        "https://www.facebook.com/acropolisrealestate",
        "https://www.twitter.com/acropolisrealty",
        "https://www.instagram.com/acropolisrealestate",
        "https://www.linkedin.com/company/acropolis-real-estate",
      ],
      aggregateRating: {
        ratingValue: "4.9",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
      keywords: ["inmobiliaria", "casas", "pisos", "locales", "lujo", "España"],
      ogImage: "/images/og-image.png",
    },
    logo: null,
    favicon: null,
    heroProps: {
      title: "Encuentra Tu Casa con Acropolis",
      subtitle: "Permítenos guiarte en tu viaje inmobiliario",
      backgroundImage: "/properties/sleek-city-tower.png",
      findPropertyButton: "Explorar Propiedades",
      contactButton: "Contáctanos",
    },
    featuredProps: {
      title: "Propiedades Destacadas",
      subtitle:
        "Descubre nuestra selección de propiedades premium en las ubicaciones más deseables",
      maxItems: 6,
    },
    aboutProps: {
      title: "Sobre Inmobiliaria Acropolis",
      subtitle: "Tu socio de confianza en el viaje inmobiliario desde 20XX",
      content:
        "En Inmobiliaria Acropolis, creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante. Con más de 25 años de experiencia en la industria, nuestro dedicado equipo de profesionales está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje inmobiliario. Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión, tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.",
      content2:
        "Nuestro enfoque personalizado y atención al detalle nos distingue en el mercado. Nos enorgullece ofrecer un servicio integral que abarca desde la búsqueda inicial hasta el cierre de la operación, asegurando que cada cliente reciba la atención y el asesoramiento que merece. Nuestro profundo conocimiento del mercado local y nuestras conexiones en la industria nos permiten ofrecer oportunidades exclusivas y negociaciones ventajosas para nuestros clientes.",
      image: "/properties/thoughtful-man.png",
      services: [
        {
          title: "Conocimiento local experto",
          icon: "map",
        },
        {
          title: "Servicio personalizado",
          icon: "user",
        },
        {
          title: "Comunicación transparente",
          icon: "message-square",
        },
        {
          title: "Experiencia en negociación",
          icon: "handshake",
        },
        {
          title: "Marketing integral",
          icon: "megaphone",
        },
        {
          title: "Soporte continuo",
          icon: "help-circle",
        },
      ],
      maxServicesDisplayed: 6,
      servicesSectionTitle: "Nuestros Servicios",
      aboutSectionTitle: "Nuestra Misión",
      buttonName: "Contacta a Nuestro Equipo",
      showKPI: true,
      kpi1Name: "Años de Experiencia",
      kpi1Data: "15+",
      kpi2Name: "Propiedades Vendidas",
      kpi2Data: "500+",
      kpi3Name: "Agentes Profesionales",
      kpi3Data: "50+",
      kpi4Name: "Clientes Satisfechos",
      kpi4Data: "98%",
    },
    propertiesProps: {
      title: "Explora Nuestras Propiedades",
      subtitle:
        "Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta",
      itemsPerPage: 6,
      defaultSort: "price-desc",
      buttonText: "Ver Todas las Propiedades",
    },
    testimonialProps: {
      title: "Lo Que Dicen Nuestros Clientes",
      subtitle:
        "No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos.",
      itemsPerPage: 3,
    },
    contactProps: {
      title: "Contacta con Nosotros",
      subtitle: "Estamos aquí para ayudarte en tu próximo paso inmobiliario",
      messageForm: true,
      address: true,
      phone: true,
      mail: true,
      schedule: true,
      map: true,
      offices: [
        {
          id: "leon",
          name: "Oficina de León",
          address: {
            street: "123 Avenida Inmobiliaria",
            city: "León",
            state: "CL",
            country: "España",
          },
          phoneNumbers: {
            main: "+34 987 123 456",
            sales: "+34 987 123 457",
          },
          emailAddresses: {
            info: "leon@acropolis-realestate.com",
            sales: "ventas.leon@acropolis-realestate.com",
          },
          scheduleInfo: {
            weekdays: "Lunes a Viernes: 9:00 - 18:00",
            saturday: "Sábado: 10:00 - 14:00",
            sunday: "Domingo: Cerrado",
          },
          mapUrl:
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.8278533985427!2d-5.569259684526154!3d42.59872697917133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd374a0c2c000001%3A0x400f8d1ce997580!2sLe%C3%B3n!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses",
          isDefault: true,
        },
        {
          id: "madrid",
          name: "Oficina de Madrid",
          address: {
            street: "456 Calle Gran Vía",
            city: "Madrid",
            state: "MD",
            country: "España",
          },
          phoneNumbers: {
            main: "+34 910 234 567",
            sales: "+34 910 234 568",
          },
          emailAddresses: {
            info: "madrid@acropolis-realestate.com",
            sales: "ventas.madrid@acropolis-realestate.com",
          },
          scheduleInfo: {
            weekdays: "Lunes a Viernes: 9:30 - 19:00",
            saturday: "Sábado: 10:00 - 15:00",
            sunday: "Domingo: Cerrado",
          },
          mapUrl:
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4301046875!2d-3.7022426845974537!3d40.41995597936578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e472b3b8f%3A0x6a4f71889c8b3b8f!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses",
        },
      ],
    },
    footerProps: {
      companyName: "Acropolis Bienes Raíces",
      description:
        "Tu socio de confianza para encontrar la propiedad perfecta. Con años de experiencia y dedicación a la excelencia, te ayudamos a tomar decisiones inmobiliarias informadas.",
      socialLinks: {
        facebook: "https://facebook.com/acropolisrealestate",
        linkedin: "https://linkedin.com/company/acropolisrealestate",
        twitter: "https://twitter.com/acropolisRE",
        instagram: "https://instagram.com/acropolisrealestate",
      },
      officeLocations: [
        {
          name: "León",
          address: ["123 Avenida Inmobiliaria", "León, CL 24001", "España"],
          phone: "+34 987 123 456",
          email: "leon@acropolis-realestate.com",
        },
        {
          name: "Madrid",
          address: ["456 Calle Gran Vía", "Madrid, MD 28013", "España"],
          phone: "+34 910 234 567",
          email: "madrid@acropolis-realestate.com",
        },
        {
          name: "Barcelona",
          address: ["789 Passeig de Gràcia", "Barcelona, CT 08007", "España"],
          phone: "+34 934 567 890",
          email: "barcelona@acropolis-realestate.com",
        },
      ],
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
      copyright: `© ${new Date().getFullYear()} Acropolis Bienes Raíces. Todos los derechos reservados.`,
    },
    headProps: {
      title: "idealista — Casas y pisos, alquiler y venta. Anuncios gratis",
      description:
        "¿Buscas casa? Con idealista es más fácil. Más de 1.200.000 anuncios de pisos y casas en venta o alquiler. Publicar anuncios es gratis para particulares.",
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const accounts: Account[] = [
  {
    accountId: "1234",
    name: "Acropolis Real Estate",
    shortName: "Acropolis",
    status: "active",
    subscriptionType: "premium",
    subscriptionStartDate: new Date("2024-01-01"),
    subscriptionEndDate: null,
    maxOffices: 5,
    maxUsers: 20,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export type User = {
  userId: number;
  accountId: bigint;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
  timezone: string;
  language: string;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isVerified: boolean;
  isActive: boolean;
};

export type Role = {
  roleId: number;
  name: string;
  description?: string;
  permissions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type UserRole = {
  userRoleId: number;
  userId: number;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type Listing = {
  listingId: bigint;
  propertyId: bigint;
  agentId: bigint;
  listingType: "Sale" | "Rent" | "Sold";
  price: string;
  status: "Active" | "Pending" | "Resolved";
  isFeatured: boolean;
  isBankOwned: boolean;
  visibilityMode: number; // 1=Exact, 2=Street, 3=Zone
  viewCount: number;
  inquiryCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFurnished?: boolean;
  furnitureQuality?: string;
  optionalGarage?: boolean;
  optionalGaragePrice?: string;
  optionalStorageRoom: boolean;
  optionalStorageRoomPrice?: string;
  hasKeys: boolean;
  studentFriendly?: boolean;
  petsAllowed?: boolean;
  appliancesIncluded?: boolean;
  internet?: boolean;
  oven?: boolean;
  microwave?: boolean;
  washingMachine?: boolean;
  fridge?: boolean;
  tv?: boolean;
  stoneware?: boolean;
  fotocasa?: boolean;
  idealista?: boolean;
  habitaclia?: boolean;
  pisoscom?: boolean;
  yaencontre?: boolean;
  milanuncios?: boolean;
};

export type Contact = {
  contactId: bigint;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  additionalInfo?: {
    demandType?: string; // For demandante: what they're looking for
    propertiesCount?: number; // For sellers: number of properties
    propertyTypes?: string[]; // For sellers: types of properties they sell
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Organization = {
  orgId: bigint;
  orgName: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type Lead = {
  leadId: bigint;
  contactId: bigint;
  listingId?: bigint;
  source: string;
  status: "New" | "Working" | "Converted" | "Disqualified";
  createdAt: Date;
  updatedAt: Date;
};

export type Deal = {
  dealId: bigint;
  listingId: bigint;
  status: "Offer" | "UnderContract" | "Closed" | "Lost";
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DealParticipant = {
  dealId: bigint;
  contactId: bigint;
  role: "Buyer" | "Seller" | "Lawyer" | "Agent" | "Other";
};

export type Appointment = {
  appointmentId: bigint;
  userId: bigint;
  contactId: bigint;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  datetimeStart: Date;
  datetimeEnd: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Task = {
  taskId: bigint;
  userId: bigint;
  description: string;
  dueDate?: Date;
  completed: boolean;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  appointmentId?: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Document = {
  docId: bigint;
  filename: string;
  fileType: string;
  fileUrl: string;
  userId: bigint;
  contactId?: bigint;
  uploadedAt: Date;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  appointmentId?: bigint;
  propertyId?: bigint;
  // Add these fields to match schema
  documentKey: string;
  s3key: string;
  documentTag?: string;
  documentOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Mock data for users (real estate agents)
export const mockUsers = [
  {
    userId: BigInt(1),
    email: "azucena.ramos@acropolis-realestate.com",
    firstName: "Azucena",
    lastName: "Ramos",
    phone: "+34 987 123 456",
    profileImageUrl: "/agents/azucena-ramos.jpg",
    timezone: "Europe/Madrid",
    language: "es",
    preferences: {
      notifications: true,
      theme: "light",
      emailNotifications: true,
      smsNotifications: false,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-03-15"),
    isVerified: true,
    isActive: true,
  },
  {
    userId: BigInt(2),
    email: "santos.martinez@acropolis-realestate.com",
    firstName: "Santos",
    lastName: "Martínez",
    phone: "+34 987 123 457",
    profileImageUrl: "/agents/santos-martinez.jpg",
    timezone: "Europe/Madrid",
    language: "es",
    preferences: {
      notifications: true,
      theme: "dark",
      emailNotifications: true,
      smsNotifications: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-03-14"),
    isVerified: true,
    isActive: true,
  },
  {
    userId: BigInt(3),
    email: "alberto.martinez@acropolis-realestate.com",
    firstName: "Alberto",
    lastName: "Martínez",
    phone: "+34 987 123 458",
    profileImageUrl: "/agents/carlos-martinez.jpg",
    timezone: "Europe/Madrid",
    language: "es",
    preferences: {
      notifications: true,
      theme: "light",
      emailNotifications: true,
      smsNotifications: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-03-13"),
    isVerified: true,
    isActive: true,
  },
];

// Mock data for roles
export const roles: Role[] = [
  {
    roleId: 1,
    name: "admin",
    description: "Administrator with full system access",
    permissions: {
      canManageUsers: true,
      canManageProperties: true,
      canManageDeals: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true,
  },
  {
    roleId: 2,
    name: "agent",
    description: "Real estate agent with property management access",
    permissions: {
      canManageProperties: true,
      canManageDeals: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true,
  },
];

// Mock data for user roles
export const userRoles: UserRole[] = [
  {
    userRoleId: 1,
    userId: 1,
    roleId: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true,
  },
  {
    userRoleId: 2,
    userId: 2,
    roleId: 2,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true,
  },
];

// Mock data for organizations
export const organizations: Organization[] = [
  {
    orgId: BigInt(1),
    orgName: "Banco Santander",
    address: "Plaza de España 1",
    city: "Madrid",
    state: "MD",
    postalCode: "28008",
    country: "España",
  },
  {
    orgId: BigInt(2),
    orgName: "Despacho Legal Martínez",
    address: "Calle Mayor 15",
    city: "León",
    state: "CL",
    postalCode: "24001",
    country: "España",
  },
];

// Mock data for contacts
export const contacts: Contact[] = [
  {
    contactId: BigInt(1),
    firstName: "Amaya",
    lastName: "Martínez",
    email: "amaya.martinez@email.com",
    phone: "+34 987 123 456",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    contactId: BigInt(2),
    firstName: "Javier",
    lastName: "Pérez",
    email: "javier.perez@email.com",
    phone: "+34 987 234 567",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    contactId: BigInt(3),
    firstName: "Beatriz",
    lastName: "García",
    email: "beatriz.garcia@email.com",
    phone: "+34 987 345 678",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    contactId: BigInt(4),
    firstName: "Francisco",
    lastName: "Pérez",
    email: "francisco.perez@email.com",
    phone: "+34 987 456 789",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    contactId: BigInt(5),
    firstName: "Alvaro",
    lastName: "Pérez",
    email: "alvaro.perez@email.com",
    phone: "+34 987 567 890",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
];

// Mock data for listing contacts
export const listingContacts: ListingContact[] = [
  {
    listingContactId: BigInt(1),
    listingId: BigInt(1),
    contactId: BigInt(1),
    contactType: "owner",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    isActive: true,
  },
  {
    listingContactId: BigInt(2),
    listingId: BigInt(2),
    contactId: BigInt(2),
    contactType: "owner",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    isActive: true,
  },
  {
    listingContactId: BigInt(3),
    listingId: BigInt(3),
    contactId: BigInt(3),
    contactType: "owner",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    isActive: true,
  },
  {
    listingContactId: BigInt(4),
    listingId: BigInt(4),
    contactId: BigInt(4),
    contactType: "owner",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    isActive: true,
  },
  {
    listingContactId: BigInt(5),
    listingId: BigInt(5),
    contactId: BigInt(5),
    contactType: "owner",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    isActive: true,
  },
];

// Mock data for listings
export const listings: Listing[] = [
  {
    listingId: BigInt(1),
    propertyId: BigInt(1),
    agentId: BigInt(1),
    listingType: "Sale",
    price: "1250000.00",
    status: "Active",
    isFeatured: true,
    isBankOwned: false,
    visibilityMode: 1,
    viewCount: 150,
    inquiryCount: 12,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-15"),
    isFurnished: true,
    furnitureQuality: "Alta",
    optionalGarage: false,
    optionalGaragePrice: "25000.00",
    optionalStorageRoom: true,
    optionalStorageRoomPrice: "10000.00",
    hasKeys: true,
    studentFriendly: false,
    petsAllowed: true,
    appliancesIncluded: true,
    internet: true,
    oven: true,
    microwave: true,
    washingMachine: true,
    fridge: true,
    stoneware: true,
    fotocasa: false,
    idealista: false,
    habitaclia: false,
    pisoscom: false,
    yaencontre: false,
    milanuncios: false,
  },
  {
    listingId: BigInt(2),
    propertyId: BigInt(2),
    agentId: BigInt(2),
    listingType: "Rent",
    price: "350000.00",
    status: "Active",
    isFeatured: true,
    isBankOwned: false,
    visibilityMode: 1,
    viewCount: 89,
    inquiryCount: 7,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-14"),
    isFurnished: false,
    furnitureQuality: "Media",
    optionalGarage: true,
    optionalGaragePrice: "25000.00",
    optionalStorageRoom: true,
    optionalStorageRoomPrice: "15000.00",
    hasKeys: true,
    studentFriendly: true,
    petsAllowed: true,
    appliancesIncluded: true,
    internet: true,
    oven: true,
    microwave: true,
    washingMachine: true,
    fridge: true,
    stoneware: true,
    fotocasa: false,
    idealista: false,
    habitaclia: false,
    pisoscom: false,
    yaencontre: false,
    milanuncios: false,
  },
  {
    listingId: BigInt(3),
    propertyId: BigInt(3),
    agentId: BigInt(1),
    listingType: "Sold",
    price: "450000.00",
    status: "Active",
    isFeatured: false,
    isBankOwned: false,
    visibilityMode: 1,
    viewCount: 45,
    inquiryCount: 3,
    isActive: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-13"),
    isFurnished: false,
    optionalGarage: false,
    optionalStorageRoom: false,
    hasKeys: true,
    studentFriendly: false,
    petsAllowed: false,
    appliancesIncluded: false,
    internet: false,
    oven: false,
    microwave: false,
    washingMachine: false,
    fridge: false,
    stoneware: false,
    fotocasa: false,
    idealista: false,
    habitaclia: false,
    pisoscom: false,
    yaencontre: false,
    milanuncios: false,
  },
  {
    listingId: BigInt(4),
    propertyId: BigInt(4),
    agentId: BigInt(2),
    listingType: "Sold",
    price: "250000.00",
    status: "Active",
    isFeatured: false,
    isBankOwned: false,
    visibilityMode: 1,
    viewCount: 67,
    inquiryCount: 5,
    isActive: true,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-12"),
    isFurnished: false,
    optionalGarage: false,
    optionalStorageRoom: false,
    hasKeys: true,
    studentFriendly: false,
    petsAllowed: false,
    appliancesIncluded: false,
    internet: false,
    oven: false,
    microwave: false,
    washingMachine: false,
    fridge: false,
    stoneware: false,
    fotocasa: false,
    idealista: false,
    habitaclia: false,
    pisoscom: false,
    yaencontre: false,
    milanuncios: false,
  },
  {
    listingId: BigInt(5),
    propertyId: BigInt(5),
    agentId: BigInt(1),
    listingType: "Sold",
    price: "350.00",
    status: "Active",
    isFeatured: false,
    isBankOwned: false,
    visibilityMode: 1,
    viewCount: 34,
    inquiryCount: 2,
    isActive: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-11"),
    isFurnished: false,
    optionalGarage: false,
    optionalStorageRoom: false,
    hasKeys: true,
    studentFriendly: false,
    petsAllowed: false,
    appliancesIncluded: false,
    internet: false,
    oven: false,
    microwave: false,
    washingMachine: false,
    fridge: false,
    stoneware: false,
    fotocasa: false,
    idealista: false,
    habitaclia: false,
    pisoscom: false,
    yaencontre: false,
    milanuncios: false,
  },
];

// Mock data for leads
export const leads: Lead[] = [
  {
    leadId: BigInt(1),
    contactId: BigInt(1),
    listingId: BigInt(1),
    source: "Website",
    status: "Working",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    leadId: BigInt(2),
    contactId: BigInt(2),
    listingId: BigInt(2),
    source: "Referral",
    status: "New",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

// Mock data for deals
export const deals: Deal[] = [
  {
    dealId: BigInt(1),
    listingId: BigInt(1),
    status: "UnderContract",
    closeDate: new Date("2024-04-15"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    dealId: BigInt(2),
    listingId: BigInt(2),
    status: "Offer",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

// Mock data for deal participants
export const dealParticipants: DealParticipant[] = [
  {
    dealId: BigInt(1),
    contactId: BigInt(1),
    role: "Buyer",
  },
  {
    dealId: BigInt(1),
    contactId: BigInt(2),
    role: "Lawyer",
  },
];

// Mock data for appointments
export const appointments: Appointment[] = [
  {
    appointmentId: BigInt(1),
    userId: BigInt(1),
    contactId: BigInt(1),
    listingId: BigInt(1),
    leadId: BigInt(1),
    dealId: BigInt(1),
    datetimeStart: new Date("2024-03-20T10:00:00"),
    datetimeEnd: new Date("2024-03-20T11:00:00"),
    status: "Scheduled",
    notes: "Property viewing for potential buyer",
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    appointmentId: BigInt(2),
    userId: BigInt(2),
    contactId: BigInt(2),
    listingId: BigInt(2),
    leadId: BigInt(2),
    datetimeStart: new Date("2024-03-21T15:00:00"),
    datetimeEnd: new Date("2024-03-21T16:00:00"),
    status: "Scheduled",
    notes: "Initial consultation for rental property",
    isActive: true,
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
  },
];

// Mock data for tasks
export const tasks: Task[] = [
  {
    taskId: BigInt(1),
    userId: BigInt(1),
    description: "Follow up with buyer about property viewing",
    dueDate: new Date("2024-03-19"),
    completed: false,
    listingId: BigInt(1),
    leadId: BigInt(1),
    dealId: BigInt(1),
    appointmentId: BigInt(1),
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    taskId: BigInt(2),
    userId: BigInt(2),
    description: "Prepare rental agreement for new tenant",
    dueDate: new Date("2024-03-22"),
    completed: false,
    listingId: BigInt(2),
    leadId: BigInt(2),
    isActive: true,
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
  },
];

// Mock data for documents
export const documents: Document[] = [
  {
    docId: BigInt(1),
    filename: "property_deed.pdf",
    fileType: "PDF",
    fileUrl: "/documents/property_deed.pdf",
    userId: BigInt(1),
    contactId: BigInt(1),
    uploadedAt: new Date("2024-03-15"),
    listingId: BigInt(1),
    dealId: BigInt(1),
    documentKey: "property_deed.pdf",
    s3key: "s3://inmobiliariaacropolis/documents/property_deed.pdf",
    documentTag: "property deed",
    documentOrder: 1,
    isActive: true,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    docId: BigInt(2),
    filename: "rental_agreement.pdf",
    fileType: "PDF",
    fileUrl: "/documents/rental_agreement.pdf",
    userId: BigInt(2),
    contactId: BigInt(2),
    uploadedAt: new Date("2024-03-16"),
    listingId: BigInt(2),
    leadId: BigInt(2),
    documentKey: "rental_agreement.pdf",
    s3key: "s3://inmobiliariaacropolis/documents/rental_agreement.pdf",
    documentTag: "rental agreement",
    documentOrder: 2,
    isActive: true,
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
  },
];

// Mock data for prospects
export const prospects: Prospect[] = [
  {
    preListingId: BigInt(1),
    contactId: BigInt(1),
    sourceType: "OWNER_DIRECT",
    sourceDetails: "Contacto directo con propietario",
    status: "CAPTACION",
    statusUpdatedAt: new Date("2024-03-15"),
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    preListingId: BigInt(2),
    contactId: BigInt(2),
    sourceType: "PORTAL_SEARCH",
    sourceDetails: "Encontrado en Idealista",
    status: "VALORACION_SCHED",
    statusUpdatedAt: new Date("2024-03-16"),
    createdAt: new Date("2024-03-16"),
    updatedAt: new Date("2024-03-16"),
  },
];

export const LEON_NEIGHBORHOODS: Omit<Location, "createdAt" | "updatedAt">[] = [
  {
    neighborhoodId: BigInt(1),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Centro Ciudad",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(2),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "La Chantría- La Lastra",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(3),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "La Vega-Oteruelo",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(4),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Las Eras de Renueva",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(5),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "San Mamés- La Palomera",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(6),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Crucero- Pinilla",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(7),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "El Ejido- Sta. Ana",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(8),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "San Esteban",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(9),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Casco Antiguo",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(10),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Las Ventas",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(11),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "Puente Castro",
    isActive: true,
  },
  {
    neighborhoodId: BigInt(12),
    city: "León",
    province: "León",
    municipality: "León",
    neighborhood: "La Asunción - La Inmaculada",
    isActive: true,
  },
];

export type ListingContact = {
  listingContactId: bigint;
  listingId: bigint;
  contactId: bigint;
  contactType: "owner" | "buyer";
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};
