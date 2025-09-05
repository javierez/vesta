
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send, X } from "lucide-react";

interface ReplyComposerProps {
  parentId: string;
  onReply: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function ReplyComposer({
  parentId,
  onReply,
  onCancel,
  placeholder = "Escribe tu respuesta...",
  maxLength = 280,
}: ReplyComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onReply(content.trim());
      setContent("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = maxLength - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="border rounded-lg p-3 bg-background">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isSubmitting}
          autoFocus
        />
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className={`text-xs ${
            remainingChars < 20 ? "text-destructive" : "text-muted-foreground"
          }`}>
            {remainingChars}
          </span>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            
            <Button 
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting || remainingChars < 0}
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? "Enviando..." : "Responder"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}