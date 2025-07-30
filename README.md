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

- Separators (tabs on top) in Property and Contact detail pages -- improve UI (secondary)

- Rent: add deposit information (x)

- Properties: Reading the formulario nueva creación (xxx)
    - Generación de Nota de encargo: P000460
    - Improve Readiness of Documents: P000427 

- Authentication: check if we really have separation of data per request and user.
- Pasarela de pagos


- Images: watermark (!xxx)
    - Logo of the RE business
    
- Images: create cartelería y marcas de agua (!xxx)


- Logos: remove background and get palette.


### Should I do a operations page?
With and without tasks to do. Each of it with its process and its documents
- Prospect: 
- Lead: 
- Deal: 


- Rent: Rent Assistant (xxx)
- Portal: Integración Idealista (not urgent)
- Properties: Converesational agent (xxxxx)




Checks:
- Adjust forms to make them similar to the casa/piso one (!)
- Listing Types: find synonyms and add labels (badges)



    ### FOTOCASA INTEGRATION
    Errors or doubts
    - When I 'publish', I just upload info, but it does not get published
    - superficie de parecela does not appear in the api docs (!)
    - being extremely careful with locations
    - Fotocasa; Habitaclia; Milanuncios
    - Leads API

Changes 
- add multimedia material (videos, tours)
- add multichannel (spanishhouses, kyero, pisos.com, think spain, listglobally basic)



FIXES
- Cliked state in Finalizar
- Armarios empotrados
- Código de invitación (non-mock)
- Change design of 'Redirigiendo al dashboard'
- Redirecting me to pages if I want to go quick: from first to second, to third, and so on.
- Reduce barrios lenght

VERIFICATIONS 
- Form for solar/local/garaje