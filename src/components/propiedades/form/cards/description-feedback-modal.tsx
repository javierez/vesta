"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { MessageSquare, Send, X, FileText, AlignLeft, Sparkles } from "lucide-react";

interface DescriptionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: DescriptionFeedback) => void;
  currentDescription: string;
  currentShortDescription: string;
}

export interface DescriptionFeedback {
  shortDescriptionFeedback?: string;
  longDescriptionFeedback?: string;
  generalInstructions?: string;
  includeSignature?: boolean;
  signatureText?: string;
  avoidMentions?: string[];
  emphasize?: string[];
}

export function DescriptionFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  currentDescription,
  currentShortDescription 
}: DescriptionFeedbackModalProps) {
  const [shortDescriptionFeedback, setShortDescriptionFeedback] = useState("");
  const [longDescriptionFeedback, setLongDescriptionFeedback] = useState("");
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [includeSignature, setIncludeSignature] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [avoidMentions, setAvoidMentions] = useState("");
  const [emphasize, setEmphasize] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");

  const handleSubmit = () => {
    const feedback: DescriptionFeedback = {
      shortDescriptionFeedback: shortDescriptionFeedback.trim() || undefined,
      longDescriptionFeedback: longDescriptionFeedback.trim() || undefined,
      generalInstructions: generalInstructions.trim() || undefined,
      includeSignature,
      signatureText: includeSignature && signatureText.trim() ? signatureText.trim() : undefined,
      avoidMentions: avoidMentions.trim() ? avoidMentions.split(",").map(s => s.trim()) : undefined,
      emphasize: emphasize.trim() ? emphasize.split(",").map(s => s.trim()) : undefined,
    };
    
    onSubmit(feedback);
    handleClose();
  };

  const handleClose = () => {
    // Reset all fields
    setShortDescriptionFeedback("");
    setLongDescriptionFeedback("");
    setGeneralInstructions("");
    setIncludeSignature(false);
    setSignatureText("");
    setAvoidMentions("");
    setEmphasize("");
    setActiveTab("feedback");
    onClose();
  };

  const hasAnyFeedback = () => {
    return shortDescriptionFeedback.trim() || 
           longDescriptionFeedback.trim() || 
           generalInstructions.trim() || 
           includeSignature ||
           avoidMentions.trim() ||
           emphasize.trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            Feedback y Preferencias de Descripción
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
              BETA
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback" className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-1">
              <AlignLeft className="h-3.5 w-3.5" />
              Instrucciones
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Preferencias
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="feedback" className="space-y-4 mt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Feedback sobre Descripción Corta
                  </Label>
                  {currentShortDescription && (
                    <div className="bg-gray-50 p-3 rounded-md mb-2 text-xs text-gray-600 italic">
                      Actual: "{currentShortDescription.substring(0, 100)}..."
                    </div>
                  )}
                  <Textarea
                    placeholder="Ej: Hazla más concisa, menciona el precio, incluye metros cuadrados..."
                    value={shortDescriptionFeedback}
                    onChange={(e) => setShortDescriptionFeedback(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Feedback sobre Descripción Completa
                  </Label>
                  {currentDescription && (
                    <div className="bg-gray-50 p-3 rounded-md mb-2 text-xs text-gray-600 italic">
                      Actual: "{currentDescription.substring(0, 150)}..."
                    </div>
                  )}
                  <Textarea
                    placeholder="Ej: Añade más detalles sobre la ubicación, menciona transporte público, destaca la luminosidad..."
                    value={longDescriptionFeedback}
                    onChange={(e) => setLongDescriptionFeedback(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 mt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Instrucciones Generales
                  </Label>
                  <Textarea
                    placeholder="Ej: Usa un tono profesional pero cercano, destaca siempre la eficiencia energética..."
                    value={generalInstructions}
                    onChange={(e) => setGeneralInstructions(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Evitar Mencionar (separado por comas)
                  </Label>
                  <Textarea
                    placeholder="Ej: problemas de humedad, vecinos ruidosos, reformas pendientes..."
                    value={avoidMentions}
                    onChange={(e) => setAvoidMentions(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Enfatizar (separado por comas)
                  </Label>
                  <Textarea
                    placeholder="Ej: luminosidad, vistas, ubicación céntrica, recién reformado..."
                    value={emphasize}
                    onChange={(e) => setEmphasize(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="includeSignature"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor="includeSignature" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Incluir firma al final de las descripciones
                    </Label>
                    {includeSignature && (
                      <Textarea
                        placeholder="Ej: Para más información, contacta con nosotros en..."
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        className="min-h-[60px] resize-none mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Consejos</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Las instrucciones se aplicarán a futuras generaciones de descripciones</li>
                    <li>• Sé específico con lo que quieres destacar o evitar</li>
                    <li>• El feedback ayuda a mejorar las descripciones actuales</li>
                    <li>• Puedes guardar estas preferencias para usar en otras propiedades</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasAnyFeedback()}
            className={cn(
              "flex-1",
              hasAnyFeedback() 
                ? "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600" 
                : ""
            )}
          >
            <Send className="h-4 w-4 mr-2" />
            Aplicar Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}