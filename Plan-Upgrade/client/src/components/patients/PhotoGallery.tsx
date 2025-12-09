import { Photo } from "@/lib/mockData";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PhotoCard } from "@/components/shared/PhotoCard";

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos: initialPhotos }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deletedPhotos, setDeletedPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const openLightbox = (index: number) => setSelectedPhotoIndex(index);
  const closeLightbox = () => setSelectedPhotoIndex(null);
  
  const nextPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(prev => (prev !== null ? prev + 1 : null));
    }
  }, [selectedPhotoIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(prev => (prev !== null ? prev - 1 : null));
    }
  }, [selectedPhotoIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, nextPhoto, prevPhoto]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      
      // Process files
      const files = Array.from(e.dataTransfer.files);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPhotos: Photo[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        date: new Date().toISOString(),
        type: "general" as const,
        notes: ""
      }));

      setPhotos([...newPhotos, ...photos]);
      setIsUploading(false);
      toast({
        title: "Fotos subidas correctamente",
        description: `${newPhotos.length} imágenes se han agregado a la galería.`
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newPhotos: Photo[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        date: new Date().toISOString(),
        type: "general" as const,
        notes: ""
      }));
      setPhotos([...newPhotos, ...photos]);
      toast({
        title: "Fotos subidas correctamente",
        description: `${newPhotos.length} imágenes se han agregado a la galería.`
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const photoToDelete = photos[index];
    setDeletedPhotos([photoToDelete, ...deletedPhotos]);
    setPhotos(photos.filter((_, i) => i !== index));
    
    if (selectedPhotoIndex === index) closeLightbox();

    toast({
      title: "Foto eliminada",
      description: "La foto ha sido movida a la papelera.",
      action: (
        <Button variant="outline" size="sm" onClick={() => handleUndoDelete(photoToDelete)}>
          Deshacer
        </Button>
      )
    });
  };

  const handleUndoDelete = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
    setDeletedPhotos(prev => prev.filter(p => p.id !== photo.id));
  };

  const handleUpdatePhoto = (index: number, updatedPhoto: Photo) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = updatedPhoto;
    setPhotos(updatedPhotos);
  };

  return (
    <div className="space-y-8">
      {photos.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Todavía no hay fotos cargadas para este paciente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              onDelete={handleDelete}
              onUpdate={handleUpdatePhoto}
              onClick={openLightbox}
            />
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer relative",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
        )}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileSelect}
        />
        {isUploading ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <h3 className="font-medium text-foreground">Subiendo fotos...</h3>
            <p className="text-sm text-muted-foreground mt-1">Por favor espere un momento.</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-foreground">Subir más fotos</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Arrastre y suelte las imágenes aquí para agregarlas a la galería.
            </p>
          </>
        )}
      </div>

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-transparent border-none text-white overflow-hidden flex flex-col focus:outline-none shadow-2xl [&>button]:text-white [&>button]:bg-black/20 [&>button]:hover:bg-white/20 [&>button]:top-4 [&>button]:right-4 [&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full shadow-none ring-0">
          {/* Close Icon - ONLY ONE now (using default DialogPrimitive.Close styled via className above) */}
          
          <div className="flex-1 relative flex items-center justify-center bg-black/95">
             {selectedPhotoIndex !== null && (
               <>
                 <img 
                   src={photos[selectedPhotoIndex].url} 
                   alt="Full view" 
                   className="max-h-full max-w-full object-contain animate-in fade-in zoom-in-95 duration-300"
                 />
                 
                 <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                   <div className="inline-block bg-transparent px-6 py-4 rounded-xl text-sm max-w-xl pointer-events-auto">
                     <div className="flex items-center justify-center gap-4 mb-2">
                        <span className="font-semibold text-white drop-shadow-md">{format(new Date(photos[selectedPhotoIndex].date), "dd MMMM yyyy", { locale: es })}</span>
                        {photos[selectedPhotoIndex].type && (
                          <Badge variant="outline" className="text-white border-white/60 bg-black/20 backdrop-blur-sm">
                            {photos[selectedPhotoIndex].type}
                          </Badge>
                        )}
                     </div>
                     <Input 
                       className="bg-transparent border-transparent text-white placeholder:text-white/70 focus:bg-transparent focus:ring-0 shadow-none text-center text-lg font-medium drop-shadow-md"
                       value={photos[selectedPhotoIndex].notes || ""}
                       onChange={(e) => handleUpdatePhoto(selectedPhotoIndex, { ...photos[selectedPhotoIndex], notes: e.target.value })}
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
             
             {selectedPhotoIndex !== null && selectedPhotoIndex > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 border border-white/10 bg-black/20 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
             )}
             
             {selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 border border-white/10 bg-black/20 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
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
