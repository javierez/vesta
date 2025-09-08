
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import {
  Star,
  Trash2,
  Check,
  Loader2,
  Package,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import type { SavedCartelConfiguration } from "~/types/template-data";

interface SavedConfigurationsProps {
  savedConfigurations: SavedCartelConfiguration[];
  selectedConfigurationId: string | null;
  isLoading: boolean;
  onLoadConfiguration: (config: SavedCartelConfiguration) => void;
  onDeleteConfiguration: (configId: string) => Promise<void>;
  onSetDefaultConfiguration: (configId: string) => Promise<void>;
  onRefreshConfigurations: () => Promise<void>;
}

export function SavedConfigurations({
  savedConfigurations,
  selectedConfigurationId,
  isLoading,
  onLoadConfiguration,
  onDeleteConfiguration,
  onSetDefaultConfiguration,
  onRefreshConfigurations,
}: SavedConfigurationsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<SavedCartelConfiguration | null>(null);

  const handleSetDefault = async (configId: string) => {
    setActionLoading(configId);
    
    try {
      await onSetDefaultConfiguration(configId);
      await onRefreshConfigurations();
      toast.success("Configuración predeterminada");
    } catch (error) {
      console.error("Error setting default configuration:", error);
      toast.error("Error al establecer predeterminada");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (config: SavedCartelConfiguration) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!configToDelete) return;
    
    setActionLoading(configToDelete.id);
    
    try {
      await onDeleteConfiguration(configToDelete.id);
      await onRefreshConfigurations();
      toast.success("Configuración eliminada");
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Error al eliminar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadConfiguration = (config: SavedCartelConfiguration) => {
    onLoadConfiguration(config);
    toast.success(`"${config.name}" cargada`);
  };

  if (savedConfigurations.length === 0) {
    return (
      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay configuraciones guardadas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Configuraciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Configuration Selection */}
              <div className="space-y-2">
                <Select
                  value={selectedConfigurationId ?? ""}
                  onValueChange={(value) => {
                    const config = savedConfigurations.find(c => c.id === value);
                    if (config) {
                      handleLoadConfiguration(config);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar configuración..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedConfigurations.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{config.name}</span>
                          {config.isDefault && (
                            <Star className="h-3 w-3 fill-current text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Management Section */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManagement(!showManagement)}
                  className="h-auto p-2 justify-start text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {showManagement ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  Gestionar Configuraciones
                </Button>

                {/* Collapsible Management List */}
                {showManagement && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {savedConfigurations.map((config) => (
                        <div
                          key={config.id}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                            selectedConfigurationId === config.id ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{config.name}</span>
                                {config.isDefault && (
                                  <Star className="h-3 w-3 fill-current text-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                            
                            {selectedConfigurationId === config.id && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-1 sm:gap-2 ml-2">
                            {!config.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefault(config.id)}
                                disabled={actionLoading === config.id}
                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2"
                                title="Establecer como predeterminada"
                              >
                                {actionLoading === config.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Star className="h-3 w-3 sm:mr-1" />
                                )}
                                <span className="hidden sm:inline text-xs">Predeterminada</span>
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(config)}
                              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2 text-destructive hover:text-destructive"
                              disabled={actionLoading === config.id}
                              title="Eliminar configuración"
                            >
                              {actionLoading === config.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 sm:mr-1" />
                              )}
                              <span className="hidden sm:inline text-xs">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar configuración?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente &ldquo;{configToDelete?.name}&rdquo;. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === configToDelete?.id}
            >
              {actionLoading === configToDelete?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}