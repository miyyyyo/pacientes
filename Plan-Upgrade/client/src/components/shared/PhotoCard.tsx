import { Photo } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ZoomIn, Trash2, Tag, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onDelete: (e: React.MouseEvent, index: number) => void;
  onUpdate: (index: number, updatedPhoto: Photo) => void;
  onClick: (index: number) => void;
}

export function PhotoCard({ photo, index, onDelete, onUpdate, onClick }: PhotoCardProps) {
  const [newLabel, setNewLabel] = useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      onUpdate(index, { ...photo, type: newLabel.trim() as any });
      setNewLabel("");
      setIsLabelPopoverOpen(false);
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden flex flex-col cursor-pointer border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-all rounded-xl bg-card"
      onClick={() => onClick(index)}
      // ACCESSIBILITY: Added role and keyboard support
      role="button"
      tabIndex={0}
      aria-label={`Ver foto del paciente${photo.notes ? `: ${photo.notes}` : ''} tomada el ${format(new Date(photo.date), "dd MMM yyyy", { locale: es })}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(index);
        }
      }}
    >
      <div className="aspect-square relative overflow-hidden">
        {/* ACCESSIBILITY: Added meaningful alt text */}
        <img 
          src={photo.url} 
          alt={photo.notes || `Foto del paciente del ${format(new Date(photo.date), "dd MMM yyyy", { locale: es })}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Labels */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 max-w-[80%]">
           {photo.type && (
             <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-[10px] shadow-sm animate-in fade-in zoom-in">
               {photo.type}
             </Badge>
           )}
           
           <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
             <PopoverTrigger asChild>
               <Badge 
                 variant="outline" 
                 className="bg-background/80 backdrop-blur-md text-[10px] hover:bg-primary hover:text-white transition-colors cursor-pointer border-transparent shadow-sm opacity-0 group-hover:opacity-100"
                 onClick={(e) => e.stopPropagation()}
                 aria-label="Agregar etiqueta a la foto"
               >
                 <Tag className="w-3 h-3 mr-1" aria-hidden="true" />
                 Etiquetar
               </Badge>
             </PopoverTrigger>
             <PopoverContent className="w-48 p-2" onClick={(e) => e.stopPropagation()}>
               <div className="space-y-2">
                 <h4 className="text-xs font-medium text-muted-foreground">Nueva etiqueta</h4>
                 <div className="flex gap-1">
                   <label htmlFor={`photo-label-${index}`} className="sr-only">Nombre de la etiqueta</label>
                   <Input 
                     id={`photo-label-${index}`}
                     className="h-7 text-xs" 
                     placeholder="Ej. Destacada" 
                     value={newLabel}
                     onChange={(e) => setNewLabel(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter") {
                         e.preventDefault();
                         handleAddLabel();
                       }
                     }}
                   />
                   <Button 
                     size="icon" 
                     className="h-7 w-7" 
                     onClick={handleAddLabel}
                     aria-label="Guardar etiqueta"
                   >
                     <Check className="w-3 h-3" />
                   </Button>
                 </div>
               </div>
             </PopoverContent>
           </Popover>
        </div>

        {/* Delete Button */}
        <Button 
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, index);
          }}
          aria-label="Eliminar foto"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 pointer-events-none" aria-hidden="true">
           <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
             <ZoomIn className="text-white w-6 h-6 drop-shadow-md" />
           </div>
        </div>
      </div>

      {/* Description Footer */}
      <div className="p-3 bg-card border-t" onClick={(e) => e.stopPropagation()}>
         <div className="text-xs text-muted-foreground mb-1">
            <time dateTime={photo.date}>{format(new Date(photo.date), "dd MMM yyyy", { locale: es })}</time>
         </div>
         <label htmlFor={`photo-desc-${index}`} className="sr-only">Descripción de la foto</label>
         <Input 
           id={`photo-desc-${index}`}
           className="h-7 text-xs border-transparent hover:border-input focus:border-primary px-1 -ml-1 bg-transparent"
           placeholder="Agregar descripción..."
           value={photo.notes || ""}
           onChange={(e) => onUpdate(index, { ...photo, notes: e.target.value })}
           onKeyDown={(e) => {
             if (e.key === "Enter") {
               e.currentTarget.blur();
             }
           }}
           aria-label="Descripción de la foto"
         />
      </div>
    </Card>
  );
}
