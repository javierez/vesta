# Voice Recording and Transcription System - Implementation Plan

## 🎯 **System Overview**

A comprehensive voice recording system that transcribes audio and automatically extracts property information to populate the database schema. Users can record 5-minute voice messages describing properties, automatically transcribe them using OpenAI Whisper, and extract structured data using GPT-4 to populate the property database schema.

## 📋 **Architecture Design**

### **1. Audio Storage Strategy**
- **Storage Location**: Use existing S3 infrastructure following the pattern: `{referenceNumber}/audio/voice_recording_{timestamp}_{nanoid}.webm`
- **File Format**: WebM audio (browser native, ~1MB per 5 minutes)
- **Retention Policy**: Keep recordings for 30 days for quality assurance, then auto-delete
- **Cost Estimate**: ~$0.02 per property recording (5min average)

### **2. Transcription Pipeline**
- **Service**: OpenAI Whisper API (most accurate for Spanish)
- **Model**: `whisper-1` (supports 50+ languages including Spanish)
- **Cost**: ~$0.006 per minute ($0.03 for 5-minute recording)
- **Processing Time**: ~30 seconds for 5-minute audio

### **3. AI Data Extraction System**
- **Primary Model**: GPT-4 for structured data extraction
- **Backup Model**: GPT-3.5-turbo for cost optimization
- **Prompt Engineering**: Custom prompts trained on Spanish real estate terminology
- **Schema Mapping**: Direct mapping to existing database fields

## 🏗️ **Technical Implementation Plan**

### **Phase 1: Audio Processing Infrastructure**

#### **1.1 Enhanced VoiceRecording Component**
```typescript
// Key enhancements to existing component:
interface VoiceRecordingProps {
  onProcessingComplete: (extractedData: PropertyData) => void;
  referenceNumber?: string;
  className?: string;
}

// New states to add:
const [isProcessing, setIsProcessing] = useState(false);
const [processingStep, setProcessingStep] = useState<'uploading' | 'transcribing' | 'extracting' | 'complete'>('uploading');
const [extractedData, setExtractedData] = useState<PropertyData | null>(null);
const [processingError, setProcessingError] = useState<string | null>(null);
```

#### **1.2 Audio Upload Service**
```typescript
// New service: src/lib/audio-upload.ts
export async function uploadAudioToS3(
  audioBlob: Blob,
  referenceNumber: string
): Promise<{
  audioUrl: string;
  s3key: string;
  audioKey: string;
}>;
```

#### **1.3 API Route Structure**
```
/api/voice-processing/
├── upload/          # Upload audio to S3
├── transcribe/      # OpenAI Whisper integration
├── extract/         # Property data extraction
└── process/         # Complete pipeline endpoint
```

### **Phase 2: Transcription Integration**

#### **2.1 OpenAI Whisper Integration**
```typescript
// New service: src/lib/transcription.ts
export async function transcribeAudio(audioUrl: string): Promise<{
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
}>;
```

#### **2.2 Spanish Real Estate Optimization**
- Custom prompts for Spanish property terminology
- Context-aware transcription for addresses and property types
- Number and measurement recognition (m², €, habitaciones)

### **Phase 3: AI Data Extraction**

#### **3.1 Property Data Extraction Engine**
```typescript
// New service: src/lib/property-extraction.ts
interface PropertyExtractionResult {
  confidence: number;
  extractedFields: Partial<PropertyData>;
  missingFields: string[];
  suggestions: string[];
}

export async function extractPropertyData(
  transcript: string
): Promise<PropertyExtractionResult>;
```

#### **3.2 Schema Mapping System**
Based on the database schema analysis, the system will extract:

**Core Property Information:**
- `propertyType` (piso, casa, local, garaje, solar)
- `propertySubtype` 
- `title` and `description`
- `price` and `listingType` (Sale/Rent)

**Physical Characteristics:**
- `bedrooms`, `bathrooms`, `squareMeter`
- `yearBuilt`, `conservationStatus`
- `hasElevator`, `hasGarage`, `hasStorageRoom`

**Location Data:**
- `street`, `postalCode`
- `city`, `province`, `municipality`, `neighborhood` (via locations table)
- `latitude`, `longitude` (via geocoding)

**Features & Amenities:**
- All boolean fields (terrace, pool, garden, etc.)
- Energy certification data
- Heating and AC types

### **Phase 4: Integration with Existing Flow**

#### **4.1 Property Registration Integration**
The voice recording will integrate with the existing registration flow:

1. **Voice Recording Tab**: New option in `/propiedades/registro/page.tsx`
2. **Data Pre-population**: Extracted data populates the existing forms
3. **Validation Flow**: Users can review and correct extracted data
4. **Save Integration**: Uses existing `save-service.ts` infrastructure

#### **4.2 UI/UX Enhancements**
```typescript
// Processing states with visual feedback:
const ProcessingSteps = {
  uploading: "Subiendo grabación...",
  transcribing: "Transcribiendo audio...", 
  extracting: "Extrayendo información...",
  complete: "¡Procesamiento completado!"
};
```

## 💰 **Cost Analysis**

### **Per Property Recording (5 minutes average):**
- **Storage**: ~$0.02/month (S3 costs)
- **Transcription**: ~$0.03 (Whisper API)
- **Data Extraction**: ~$0.02 (GPT-4 API)
- **Total per property**: ~$0.07

### **Monthly Estimates (100 properties):**
- **Processing costs**: ~$7/month
- **Storage costs**: ~$2/month
- **Total**: ~$9/month

## 🔧 **Implementation Strategy**

### **Development Phases:**

1. **Week 1**: Audio upload and S3 integration
2. **Week 2**: OpenAI Whisper transcription pipeline
3. **Week 3**: GPT-4 data extraction and schema mapping
4. **Week 4**: UI integration and error handling
5. **Week 5**: Testing and optimization

### **Quality Assurance:**

1. **Accuracy Metrics**: Track extraction accuracy rates
2. **Fallback Strategies**: Manual review for low-confidence extractions
3. **User Feedback Loop**: Allow users to correct and improve the system

## 📝 **Key Questions Addressed:**

### **Q: Do I have to store the recording? Where?**
**A:** Yes, temporarily in S3 following existing patterns (`{referenceNumber}/audio/`). Auto-delete after 30 days for cost optimization.

### **Q: What voice-to-text model to use?**
**A:** OpenAI Whisper API - best accuracy for Spanish, cost-effective at $0.006/minute, handles real estate terminology well.

### **Q: How to handle 5-minute voice messages?**
**A:** Optimized for 5-minute recordings (~5MB WebM files). Processing pipeline handles this efficiently with ~30-second processing time.

## 🚀 **Next Steps**

The system is designed to integrate seamlessly with your existing infrastructure, leveraging:
- ✅ Current S3 upload patterns
- ✅ Existing OpenAI integration
- ✅ Database schema compatibility  
- ✅ Property registration flow
- ✅ UI component architecture

This plan provides a comprehensive, cost-effective solution that will save users significant time while maintaining data quality and system reliability.

## 📁 **File Structure**

### **New Files to Create:**
```
src/
├── lib/
│   ├── audio-upload.ts          # S3 audio upload service
│   ├── transcription.ts         # OpenAI Whisper integration
│   └── property-extraction.ts   # GPT-4 data extraction
├── app/api/voice-processing/
│   ├── upload/route.ts          # Audio upload endpoint
│   ├── transcribe/route.ts      # Transcription endpoint
│   ├── extract/route.ts         # Data extraction endpoint
│   └── process/route.ts         # Complete pipeline endpoint
└── components/propiedades/registro/
    └── voice-recording-enhanced.tsx  # Enhanced voice component
```

### **Files to Modify:**
```
src/
├── components/propiedades/registro/voice-recording.tsx  # Add processing states
├── app/(dashboard)/propiedades/registro/page.tsx        # Add voice option
└── components/propiedades/registro/forms/               # Integration points
```

## 🔄 **Processing Flow**

1. **User Records**: max 5-minute voice message describing property
2. **Upload**: Audio blob uploaded to S3 with reference number
3. **Transcribe**: OpenAI Whisper converts speech to text
4. **Extract**: GPT-4 analyzes text and extracts property data
5. **Map**: Data mapped to database schema fields
6. **Validate**: User reviews and corrects extracted data
7. **Save**: Data saved using existing property creation flow

## 🛡️ **Error Handling**

### **Transcription Errors:**
- Low confidence scores trigger manual review
- Fallback to alternative transcription services
- User can re-record if needed

### **Extraction Errors:**
- Missing critical fields prompt user input
- Low confidence extractions highlighted for review
- Graceful degradation to manual form completion

### **System Errors:**
- Comprehensive logging and monitoring
- Retry mechanisms for API failures
- User-friendly error messages with recovery options





NOTE: don't do changes in the UI in @voice