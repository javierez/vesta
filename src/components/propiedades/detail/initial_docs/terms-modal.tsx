"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { getAccountDetailsAction, getCurrentUserAccountId } from "~/app/actions/account-settings";
import { useSession } from "~/lib/auth-client";

const termsSchema = z.object({
  commission: z.number().min(0).max(100),
  min_commission: z.number().min(0),
  duration: z.number().min(1),
  exclusivity: z.boolean(),
  communications: z.boolean(),
});

type TermsFormData = z.infer<typeof termsSchema>;

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (terms: TermsFormData) => void;
}

export function TermsModal({ isOpen, onClose, onContinue }: TermsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: session } = useSession();

  const form = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      commission: 3.0,
      min_commission: 1500,
      duration: 12,
      exclusivity: false,
      communications: false,
    },
  });

  // Load account data and terms when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      console.log("Modal opened, loading account terms...");
      loadAccountTerms();
    }
  }, [isOpen, session?.user?.id]);

  const loadAccountTerms = async () => {
    console.log("loadAccountTerms called, session:", session?.user?.id);
    if (!session?.user?.id) {
      console.log("No session found, skipping account terms load");
      return;
    }

    try {
      setIsLoadingTerms(true);
      const userAccountId = await getCurrentUserAccountId(session.user.id);
      if (!userAccountId) {
        setError("No se pudo obtener la información de la cuenta");
        return;
      }

      const accountResult = await getAccountDetailsAction(userAccountId);
      
      if (accountResult.success && accountResult.data?.terms) {
        const terms = accountResult.data.terms as Record<string, unknown>;
        form.reset({
          commission: (terms.commission as number) ?? 3.0,
          min_commission: (terms.min_commission as number) ?? 1500,
          duration: (terms.duration as number) ?? 12,
          exclusivity: (terms.exclusivity as boolean) ?? false,
          communications: (terms.communications as boolean) ?? false,
        });
      }
    } catch (error) {
      console.error("Error loading account terms:", error);
      setError("Error al cargar los términos de la cuenta");
    } finally {
      setIsLoadingTerms(false);
    }
  };

  const onSubmit = async (data: TermsFormData) => {
    console.log("Modal onSubmit called with data:", data);
    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate contract with the selected terms (keep modal open with animation)
      await onContinue(data);
      // Close modal only after successful generation
      onClose();
    } catch (error) {
      console.error("Error generating contract:", error);
      setError("Error al generar el contrato");
    } finally {
      setIsGenerating(false);
    }
  };

  console.log("TermsModal render - isOpen:", isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Términos del Contrato
          </DialogTitle>
          <DialogDescription>
            Revisa y ajusta los términos para esta hoja de encargo específica.
          </DialogDescription>
        </DialogHeader>

        {isLoadingTerms ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Cargando términos...</span>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            {/* Icon container with animation like the old button */}
            <div className="mb-4 mx-auto rounded-full flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-700 ease-in-out">
              <FileText className="h-8 w-8 text-white scale-110 transition-all duration-700 ease-in-out" />
            </div>
            
            {/* Loading state with spinner */}
            <div className="flex items-center justify-center gap-2 text-gray-600 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generando documento...</span>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comisión (%)</FormLabel>
                    <FormDescription>
                      Porcentaje de comisión sobre el precio de venta
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comisión mínima (€)</FormLabel>
                    <FormDescription>
                      Comisión mínima garantizada
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (meses)</FormLabel>
                    <FormDescription>
                      Duración del contrato en meses
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                        value={field.value || 12}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exclusivity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Exclusividad</FormLabel>
                      <FormDescription>
                        Contrato de exclusividad
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Comunicaciones</FormLabel>
                      <FormDescription>
                        Autorizar comunicaciones comerciales
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              {!isGenerating && (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500"
                  >
                    Generar
                  </Button>
                </DialogFooter>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}