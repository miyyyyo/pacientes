import { Visit, Photo } from "@/lib/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, FileText, Trash2, Edit2, ChevronDown, ChevronUp, Undo2, Plus, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PhotoCard } from "@/components/shared/PhotoCard";
import { VisitForm } from "@/components/forms/DialogForms";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface VisitHistoryProps {
  visits: Visit[];
  onAddVisit?: () => void;
}

export function VisitHistory({ visits: initialVisits, onAddVisit }: VisitHistoryProps) {
  // Use local state but sync with props if they change (key for persistence)
  const [visits, setVisits] = useState(initialVisits);
  
  // Update local state when props change (crucial for "New Visit" appearing)
  if (initialVisits !== visits && initialVisits.length !== visits.length) {
     if (initialVisits.length > visits.length) {
        setVisits(initialVisits);
     }
  }

  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  
  // Lightbox State
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);
  const [activeVisitIdForLightbox, setActiveVisitIdForLightbox] = useState<string | null>(null);

  const { toast } = useToast();

  const toggleVisit = (id: string) => {
    setExpandedVisitId(prev => prev === id ? null : id);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleVisit(id);
    }
  };

  const handleDeleteVisit = (e: React.MouseEvent, visit: Visit) => {
    e.stopPropagation();
    setVisits(prev => prev.filter(v => v.id !== visit.id));
    toast({
      title: "Visita eliminada",
      description: "El registro ha sido eliminado.",
      action: (
        <Button variant="outline" size="sm" onClick={() => setVisits(prev => [visit, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))}>
          <Undo2 className="w-4 h-4 mr-2" />
          Deshacer
        </Button>
      )
    });
  };

  const handleEditVisit = (e: React.MouseEvent, visit: Visit) => {
    e.stopPropagation();
    setEditingVisit(visit);
  };

  const handleUpdateVisit = (data: any) => {
    if (!editingVisit) return;
    
    // Merge existing photos with new ones
    const updatedVisit = {
      ...editingVisit,
      date: `${data.date}T${data.time}:00`,
      treatment: data.treatment,
      notes: data.notes || "",
      status: data.status,
      photos: [...editingVisit.photos, ...(data.photos || [])]
    };

    setVisits(prev => prev.map(v => v.id === editingVisit.id ? updatedVisit : v));
    setEditingVisit(null);
    toast({
      title: "Visita actualizada",
      description: "Los cambios han sido guardados correctamente."
    });
  };

  const handleUpdatePhotoInVisit = (visitId: string, photoIndex: number, updatedPhoto: Photo) => {
     setVisits(prev => prev.map(v => {
       if (v.id !== visitId) return v;
       const updatedPhotos = [...v.photos];
       updatedPhotos[photoIndex] = updatedPhoto;
       return { ...v, photos: updatedPhotos };
     }));
  };

  const handleDeletePhotoFromVisit = (e: React.MouseEvent, visitId: string, photoIndex: number) => {
     e.stopPropagation(); // Avoid collapsing
     setVisits(prev => prev.map(v => {
       if (v.id !== visitId) return v;
       const updatedPhotos = [...v.photos];
       const deleted = updatedPhotos.splice(photoIndex, 1)[0];
       
       toast({
         title: "Foto eliminada",
         description: "La foto ha sido eliminada de la visita.",
         action: (
           <Button variant="outline" size="sm" onClick={() => {
              // Simple undo logic for demo
              setVisits(current => current.map(currV => {
                if (currV.id !== visitId) return currV;
                return { ...currV, photos: [...currV.photos, deleted] };
              }));
           }}>
             Deshacer
           </Button>
         )
       });

       return { ...v, photos: updatedPhotos };
     }));
  };

  const openLightbox = (visitId: string, index: number) => {
    setActiveVisitIdForLightbox(visitId);
    setLightboxPhotoIndex(index);
  };

  const closeLightbox = () => {
    setLightboxPhotoIndex(null);
    setActiveVisitIdForLightbox(null);
  };

  const getActivePhotos = () => {
    if (!activeVisitIdForLightbox) return [];
    const visit = visits.find(v => v.id === activeVisitIdForLightbox);
    return visit ? visit.photos : [];
  };

  const activePhotos = getActivePhotos();

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case "Realizada":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1"><CheckCircle2 className="w-3 h-3" /> Realizada</Badge>;
      case "Cancelada":
        return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 gap-1"><XCircle className="w-3 h-3" /> Cancelada</Badge>;
      case "Programada":
      default:
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white gap-1"><Circle className="w-3 h-3" /> Programada</Badge>;
    }
  };

  if (visits.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed flex flex-col items-center gap-4">
        <p>Todavía no hay visitas para este paciente.</p>
        {onAddVisit && (
          <Button onClick={onAddVisit} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
            <Plus className="w-4 h-4 mr-2" />
            Nueva visita
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onAddVisit && (
        <div className="flex justify-end">
          <Button onClick={onAddVisit} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Visita
          </Button>
        </div>
      )}
      
      <div className="relative border-l border-muted ml-3 space-y-6 py-2">
        {visits.map((visit) => {
          const isExpanded = expandedVisitId === visit.id;
          
          return (
            <div key={visit.id} className="relative pl-8 transition-all">
              {/* Timeline Dot */}
              <div className={cn(
                "absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-background transition-colors",
                isExpanded ? "bg-primary" : "bg-muted-foreground/30 hover:bg-primary/50"
              )} />
              
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-300 border-transparent hover:border-border",
                  isExpanded ? "ring-1 ring-primary shadow-lg scale-[1.01]" : "shadow-sm hover:shadow-md bg-card/50"
                )}
                onClick={() => toggleVisit(visit.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Ver detalles de la visita del ${format(new Date(visit.date), "dd 'de' MMMM", { locale: es })}`}
                onKeyDown={(e) => handleKeyDown(e, visit.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <h4 className="font-heading font-semibold text-lg text-foreground">
                           {visit.treatment}
                         </h4>
                         {getStatusBadge(visit.status)}
                         {visit.photos.length > 0 && (
                           <Badge variant="secondary" className="text-xs font-normal">
                             {visit.photos.length} fotos
                           </Badge>
                         )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Calendar className="w-3.5 h-3.5" />
                         <span>{format(new Date(visit.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                         <span className="mx-1">•</span>
                         <Clock className="w-3.5 h-3.5" />
                         <span>{format(new Date(visit.date), "HH:mm")}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => handleEditVisit(e, visit)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteVisit(e, visit)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="ml-2">
                           {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </div>
                    </div>
                  </div>

                  <div className={cn("grid transition-all duration-300 ease-in-out", isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-4">
                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Notas Clínicas
                        </h5>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {visit.notes || "Sin notas adicionales."}
                        </p>
                      </div>

                      {/* Action to add photos to this specific visit directly from list */}
                      <div className="flex justify-end mb-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={(e) => handleEditVisit(e, visit)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar fotos
                        </Button>
                      </div>

                      {visit.photos.length > 0 ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {visit.photos.map((photo, idx) => (
                             <PhotoCard 
                               key={photo.id}
                               photo={photo}
                               index={idx}
                               onClick={() => openLightbox(visit.id, idx)}
                               onDelete={(e, i) => handleDeletePhotoFromVisit(e, visit.id, i)}
                               onUpdate={(i, p) => handleUpdatePhotoInVisit(visit.id, i, p)}
                             />
                           ))}
                         </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic pl-1 text-center py-4 border border-dashed rounded-lg">
                          No hay fotos adjuntas a esta visita.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <VisitForm 
        open={!!editingVisit} 
        onOpenChange={(open) => !open && setEditingVisit(null)}
        onSubmit={handleUpdateVisit}
        defaultValues={editingVisit ? {
          date: format(new Date(editingVisit.date), "yyyy-MM-dd"),
          time: format(new Date(editingVisit.date), "HH:mm"),
          treatment: editingVisit.treatment,
          notes: editingVisit.notes,
          status: editingVisit.status as any
        } : undefined}
        existingPhotos={editingVisit?.photos}
        mode="edit"
      />

      {/* Lightbox for Visit Photos */}
      <Dialog open={lightboxPhotoIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-transparent border-none text-white overflow-hidden flex flex-col focus:outline-none shadow-2xl [&>button]:text-white [&>button]:bg-black/20 [&>button]:hover:bg-white/20 [&>button]:top-4 [&>button]:right-4 [&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full shadow-none ring-0">
          
          <div className="flex-1 relative flex items-center justify-center bg-black/95">
             {lightboxPhotoIndex !== null && activePhotos[lightboxPhotoIndex] && (
               <>
                 <img 
                   src={activePhotos[lightboxPhotoIndex].url} 
                   alt={`Foto de visita: ${activePhotos[lightboxPhotoIndex].notes || 'Sin descripción'}`}
                   className="max-h-full max-w-full object-contain animate-in fade-in zoom-in-95 duration-300"
                   onClick={(e) => e.stopPropagation()} 
                 />
                 
                 <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                   <div className="inline-block bg-transparent px-6 py-4 rounded-xl text-sm max-w-xl pointer-events-auto">
                     <div className="flex items-center justify-center gap-4 mb-2">
                        <span className="font-semibold text-white drop-shadow-md">{format(new Date(activePhotos[lightboxPhotoIndex].date), "dd MMMM yyyy", { locale: es })}</span>
                        {activePhotos[lightboxPhotoIndex].type && (
                          <Badge variant="outline" className="text-white border-white/60 bg-black/20 backdrop-blur-sm">
                            {activePhotos[lightboxPhotoIndex].type}
                          </Badge>
                        )}
                     </div>
                     <Input 
                       className="bg-transparent border-transparent text-white placeholder:text-white/70 focus:bg-transparent focus:ring-0 shadow-none text-center text-lg font-medium drop-shadow-md"
                       value={activePhotos[lightboxPhotoIndex].notes || ""}
                       onChange={(e) => handleUpdatePhotoInVisit(activeVisitIdForLightbox!, lightboxPhotoIndex, { ...activePhotos[lightboxPhotoIndex], notes: e.target.value })}
                       placeholder="Agregar descripción..."
                       onKeyDown={(e) => {
                         if (e.key === "Enter") {
                           e.currentTarget.blur();
                         }
                       }}
                     />
                   </div>
                 </div>
               </>
             )}
             
             {lightboxPhotoIndex !== null && lightboxPhotoIndex > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 border border-white/10 bg-black/20 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setLightboxPhotoIndex(prev => prev! - 1); }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
             )}
             
             {lightboxPhotoIndex !== null && activePhotos.length > 0 && lightboxPhotoIndex < activePhotos.length - 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 border border-white/10 bg-black/20 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setLightboxPhotoIndex(prev => prev! + 1); }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
