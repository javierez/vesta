"use client";

import { useState, useEffect } from "react";
import { useSession } from "~/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { LogoUpload } from "~/components/ui/logo-upload";
import { BrandColorPalette } from "~/components/admin/brand-color-palette";
import { removeBackground, canRemoveBackground, cleanupUrls } from "~/lib/background-removal";
import { extractColorPalette, getHexColors } from "~/lib/color-extraction";
import { uploadBrandAsset, getBrandAsset, deleteBrandAsset } from "~/app/actions/brand-upload";
import { getCurrentUserAccountId } from "~/app/actions/settings";
import { useToast } from "~/components/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Eye, Download, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BrandAsset, LogoUploadProgress } from "~/types/brand";
import Image from "next/image";

export const AccountBranding = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // State management
  const [accountId, setAccountId] = useState<string | null>(null);
  const [brandAsset, setBrandAsset] = useState<BrandAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<LogoUploadProgress | undefined>();
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Load account data on mount
  useEffect(() => {
    async function loadAccountData() {
      if (session?.user?.id) {
        try {
          const userAccountId = await getCurrentUserAccountId(session.user.id);
          if (userAccountId) {
            const accountIdStr = userAccountId.toString();
            setAccountId(accountIdStr);
            
            // Load existing brand asset if available
            const existingBrand = await getBrandAsset(accountIdStr);
            if (existingBrand) {
              setBrandAsset(existingBrand);
              setColorPalette(existingBrand.colorPalette);
            }
          }
        } catch (error) {
          console.error('Error loading account data:', error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la cuenta",
            variant: "destructive",
          });
        }
      }
    }
    void loadAccountData();
  }, [session, toast]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrls.length > 0) {
        cleanupUrls(previewUrls);
      }
    };
  }, [previewUrls]);

  // Main logo upload handler
  const handleLogoUpload = async (file: File) => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "ID de cuenta no disponible",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({
      stage: 'uploading',
      percentage: 10,
      message: 'Iniciando subida...'
    });

    const tempUrls: string[] = [];

    try {
      // Step 1: Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona un archivo de imagen válido');
      }

      setUploadProgress({
        stage: 'uploading',
        percentage: 20,
        message: 'Validando archivo...'
      });

      // Step 2: Remove background
      setUploadProgress({
        stage: 'processing',
        percentage: 30,
        message: 'Removiendo fondo automáticamente...'
      });

      const bgRemovalResult = await removeBackground(file);
      tempUrls.push(bgRemovalResult.originalUrl, bgRemovalResult.transparentUrl);

      setUploadProgress({
        stage: 'extracting',
        percentage: 60,
        message: 'Extrayendo colores de marca...'
      });

      // Step 3: Extract colors from original
      const colorPaletteResult = await extractColorPalette(bgRemovalResult.originalUrl);
      const hexColors = getHexColors(colorPaletteResult.colors);

      setUploadProgress({
        stage: 'saving',
        percentage: 80,
        message: 'Guardando en almacenamiento...'
      });

      // Step 4: Upload both versions to S3
      const uploadResult = await uploadBrandAsset(
        bgRemovalResult.originalBlob,
        bgRemovalResult.transparentBlob,
        accountId,
        hexColors,
        file.name
      );

      setUploadProgress({
        stage: 'complete',
        percentage: 100,
        message: 'Completado exitosamente'
      });

      // Step 5: Update UI state
      setBrandAsset(uploadResult);
      setColorPalette(hexColors);
      setPreviewUrls(tempUrls);

      toast({
        title: "¡Éxito!",
        description: "Logo subido y procesado correctamente",
      });

    } catch (error) {
      console.error('Logo upload failed:', error);
      
      // Clean up temporary URLs on error
      cleanupUrls(tempUrls);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al procesar el logo',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(undefined);
      }, 2000);
    }
  };

  // Delete brand asset
  const handleDelete = async () => {
    if (!accountId || !brandAsset) return;

    setIsDeleting(true);
    try {
      await deleteBrandAsset(accountId);
      
      setBrandAsset(null);
      setColorPalette([]);
      cleanupUrls(previewUrls);
      setPreviewUrls([]);

      toast({
        title: "Eliminado",
        description: "Los elementos de marca han sido eliminados",
      });
    } catch (error) {
      console.error('Error deleting brand asset:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el logo",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Browser compatibility check
  const browserSupported = canRemoveBackground();

  return (
    <div className="space-y-6">
      {/* Browser compatibility warning */}
      {!browserSupported && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tu navegador no soporta la remoción automática de fondos. 
            Por favor actualiza tu navegador o usa Chrome 88+, Firefox 79+, Safari 14.1+, o Edge 88+.
          </AlertDescription>
        </Alert>
      )}

      {/* Main branding card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Marca y Logo</CardTitle>
            {brandAsset && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload/Preview Section */}
          {brandAsset ? (
            <div className="space-y-4">
              <Tabs defaultValue="original" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">Logo Original</TabsTrigger>
                  <TabsTrigger value="transparent">Sin Fondo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="original" className="space-y-4">
                  <div className="relative mx-auto w-fit">
                    <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={brandAsset.logoOriginalUrl}
                        alt="Logo original"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transparent" className="space-y-4">
                  <div className="relative mx-auto w-fit">
                    <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <Image
                        src={brandAsset.logoTransparentUrl}
                        alt="Logo sin fondo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <Badge variant="secondary">Fondo Transparente</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href={brandAsset.logoOriginalUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Original
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={brandAsset.logoTransparentUrl} download="logo-transparente.png">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          ) : (
            <LogoUpload
              onUpload={handleLogoUpload}
              isUploading={isUploading}
              progress={uploadProgress}
              className="max-w-lg mx-auto"
            />
          )}
        </CardContent>
      </Card>

      {/* Color Palette Section */}
      {colorPalette.length > 0 && (
        <BrandColorPalette
          colors={colorPalette}
          title="Paleta de Colores Extraída"
          showHexValues={true}
        />
      )}

      {/* Tips and guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consejos para tu Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-2">
            <li>Usa imágenes de alta calidad (mínimo 300x300 píxeles) para mejores resultados</li>
            <li>Los logos con fondos sólidos se procesan mejor que los degradados complejos</li>
            <li>El sistema extraerá automáticamente los 6 colores más prominentes de tu logo</li>
            <li>La versión sin fondo es perfecta para usar sobre diferentes colores de fondo</li>
            <li>Los colores extraídos te ayudarán a mantener consistencia visual en toda la plataforma</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};