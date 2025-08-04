# Vesta - Real Estate Management Platform

A comprehensive real estate management platform built with Next.js, featuring property listings, contact management, calendar scheduling, and multi-portal integration capabilities.

## 🌟 Features

### Core Functionality
- **Property Management**: Create, edit, and manage property listings with detailed characteristics
- **Contact Management**: Track prospects, leads, and clients with detailed profiles
- **Calendar System**: Schedule appointments and manage real estate operations
- **Multi-Portal Integration**: Publish properties to multiple platforms (Fotocasa, Habitaclia, Idealista, etc.)
- **Document Management**: OCR processing and automated document handling
- **Image Management**: Gallery system with watermarking capabilities

### Advanced Features
- **AI-Powered Descriptions**: Automated property descriptions using OpenAI
- **Cadastral Integration**: Retrieve property information from official sources
- **Google Maps Integration**: Location services and property mapping
- **AWS S3 Integration**: Secure file storage and management
- **Real-time Search**: Advanced property and contact filtering

## 🚀 Tech Stack

- **Framework**: Next.js 15.2.3 with React 19
- **Database**: MySQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Built-in auth system
- **Cloud Storage**: AWS S3
- **AI Services**: OpenAI GPT integration
- **Maps**: Google Maps API
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── propiedades/       # Property management pages
│   ├── contactos/         # Contact management pages
│   ├── calendario/        # Calendar scheduling
│   └── vender/           # Selling workflow
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── propiedades/      # Property-specific components
│   ├── contactos/        # Contact management components
│   └── layout/           # Layout components
├── server/               # Server-side logic
│   ├── db/              # Database schema and connection
│   ├── queries/         # Database queries
│   ├── portals/         # Third-party integrations
│   └── openai/          # AI integration
└── lib/                 # Utilities and helpers
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd vesta
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:
   ```
   DATABASE_URL=your_database_url
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   OPENAI_API_KEY=your_openai_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

## 📜 Available Scripts

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm format:write` - Format code with Prettier

## 🔗 Integrations

### Real Estate Portals
- **Fotocasa**: Property listing and lead management
- **Habitaclia**: Multi-channel property publishing
- **Idealista**: Premium property portal integration
- **Milanuncios**: Classified ads integration

### External Services
- **Google Maps**: Geocoding and location services
- **AWS Textract**: OCR document processing
- **OpenAI**: AI-powered content generation
- **Cadastral API**: Official property data retrieval

## 🎯 Key Features

### Property Management
- Comprehensive property forms with step-by-step creation
- Image galleries with drag-and-drop upload
- Energy certificate management
- Automated property descriptions
- Multi-portal publishing capabilities

### Contact & Lead Management
- Prospect to client conversion tracking
- Detailed contact profiles with interaction history
- Interest-based property matching
- Appointment scheduling integration

### Dashboard & Analytics
- Real-time property statistics
- Operation tracking and management
- Quick action shortcuts
- Performance metrics

## 📱 Mobile Support

The platform is fully responsive and optimized for mobile devices, ensuring real estate professionals can manage their business on the go.

## 🚀 Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration.

```bash
pnpm build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

# TODOs: 

## High Priority
- Pasarela de pagos
- Watermark
- Cartelería
- Upscaller images
- Operations page
- Calendar integration



## Med Priority
- Generación de Nota de encargo: P000460

## Low Priority
- Rent: add deposit information
- Separators (tabs on top) in Property and Contact detail pages -> improve UI 
- Short name for barrios


## To Validate
- Properties: Reading the formulario nueva creación
- Reading Ficha de Venta: try out other formularios
- Authentication: check if we really have separation of data per request and user.
- Make sure forms are 'similar' to the casa/piso one (!)






## To improve
- Progress bar when uploading logo -- also changing the tooltip of best recommendations to before when image was uploaded
- Add multimedia material in Fotocasa integration (videos, tours)
- Add multichannel publishing (spanishhouses, kyero, pisos.com, think spain, listglobally basic)



     



    




### Operations Page?
With and without tasks to do. Each of it with its process and its documents
- Prospect: ---
- Lead: ----
- Deal: -------


### Rent: Rent Assistant (xxx)

### Portal: Integración Idealista (not urgent)

### Properties: Converesational agent






Changes 



FIXES
- Cliked state in Finalizar -- change the clicked state.
- Armarios empotrados -- apparently fixed (to be checked)
- Código de invitación (non-mock) -- apparently fixed (to be checked)
- Change design of 'Redirigiendo al dashboard' -- change cliked state


- Redirecting me to pages if I want to go quick: from first to second, to third, and so on. (changed but to be tested)
- What happens if I upload Referencia Catastral but also a Ficha de Venta
- After I click on @property-identification-form on siguiente (once is ready). It has like a clicked state where it says cargando or something like that. But between that and before the property-form is reached, there is some time where I don't have anything and I would be able to click on finish again.
- Authentication with Google 
- Authentication in general
- 
- Reduce barrios lenght (admin task)
-

OPTIMIZATIONS
- Concurrent data fethcing: contacts, listings, etc.
- Query Optimization: reduced queries
- Middleware caching: 2 minute cache for auth session validation
- Data Caching: when needed 

