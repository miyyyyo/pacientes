import { BeforeAfterCase, Photo } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Upload, X, Edit, Info, UploadCloud } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PhotoCard } from "@/components/shared/PhotoCard";
import { cn } from "@/lib/utils";

interface BeforeAfterProps {
  cases: BeforeAfterCase[];
}

export function BeforeAfter({ cases: initialCases }: BeforeAfterProps) {
  const [cases, setCases] = useState(initialCases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<BeforeAfterCase | null>(null);
  
  // Local state for the modal form inputs
  const [modalPhotoBefore, setModalPhotoBefore] = useState<string>("");
  const [modalPhotoAfter, setModalPhotoAfter] = useState<string>("");

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    // Default fallback images if not provided
    const defaultImg = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60";

    if (editingCase) {
      // Update existing case
      const updatedCase: BeforeAfterCase = {
        ...editingCase,
        title,
        description,
        photoBefore: { 
          ...editingCase.photoBefore, 
          url: modalPhotoBefore || editingCase.photoBefore.url 
        },
        photoAfter: { 
          ...editingCase.photoAfter, 
          url: modalPhotoAfter || editingCase.photoAfter.url 
        }
      };
      
      const hasChangedImages = modalPhotoBefore !== editingCase.photoBefore.url || modalPhotoAfter !== editingCase.photoAfter.url;

      setCases(cases.map(c => c.id === editingCase.id ? updatedCase : c));
      
      if (hasChangedImages) {
        toast({
          title: "Caso actualizado",
          description: "Las imágenes han sido modificadas.",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                 setCases(prev => prev.map(c => c.id === editingCase.id ? editingCase : c));
              }}
            >
              Deshacer
            </Button>
          )
        });
      } else {
        toast({
          title: "Caso actualizado",
          description: "Los cambios han sido guardados correctamente."
        });
      }
    } else {
      // Create new case
      const newCase: BeforeAfterCase = {
        id: Math.random().toString(36).substr(2, 9),
        title: title || "Nuevo Caso",
        description: description || "Sin descripción",
        dateBefore: new Date().toISOString(),
        dateAfter: new Date().toISOString(),
        photoBefore: {
          id: Math.random().toString(36),
          url: modalPhotoBefore || defaultImg,
          date: new Date().toISOString(),
          type: "before",
          notes: "Antes"
        },
        photoAfter: {
          id: Math.random().toString(36),
          url: modalPhotoAfter || defaultImg,
          date: new Date().toISOString(),
          type: "after",
          notes: "Después"
        }
      };

      setCases([newCase, ...cases]);
      toast({
        title: "Caso agregado",
        description: "El caso de Antes y Después se ha guardado correctamente."
      });
    }
    
    setIsModalOpen(false);
    setEditingCase(null);
    setModalPhotoBefore("");
    setModalPhotoAfter("");
  };

  const openEditModal = (item: BeforeAfterCase) => {
    setEditingCase(item);
    setModalPhotoBefore(item.photoBefore.url);
    setModalPhotoAfter(item.photoAfter.url);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingCase(null);
    setModalPhotoBefore("");
    setModalPhotoAfter("");
    setIsModalOpen(true);
  };

  const handleUpdatePhoto = (caseId: string, type: 'before' | 'after', updatedPhoto: Photo) => {
    // Save original state for undo
    const caseToUpdate = cases.find(c => c.id === caseId);
    if (!caseToUpdate) return;
    const originalPhoto = type === 'before' ? caseToUpdate.photoBefore : caseToUpdate.photoAfter;

    // Check if the photo URL actually changed (to trigger toast only on replacement)
    // Note: PhotoCard calls onUpdate for both replacements and other edits. 
    // We assume this is mostly for replacements given the user request.
    const hasUrlChanged = originalPhoto.url !== updatedPhoto.url;

    setCases(prevCases => prevCases.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        [type === 'before' ? 'photoBefore' : 'photoAfter']: updatedPhoto
      };
    }));

    if (hasUrlChanged) {
      toast({
        title: "Foto actualizada",
        description: "La imagen ha sido reemplazada.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
               setCases(prevCases => prevCases.map(c => {
                 if (c.id !== caseId) return c;
                 return {
                   ...c,
                   [type === 'before' ? 'photoBefore' : 'photoAfter']: originalPhoto
                 };
               }));
               // Dismiss toast manually is handled by the toaster usually on action click or timeout, 
               // but Shadcn toast action usually closes it.
            }}
          >
            Deshacer
          </Button>
        )
      });
    }
  };

  const handleDeletePhoto = (caseId: string, type: 'before' | 'after') => {
    // Keep a reference to the deleted photo URL to restore it if needed
    const caseToUpdate = cases.find(c => c.id === caseId);
    if (!caseToUpdate) return;

    const originalPhoto = type === 'before' ? caseToUpdate.photoBefore : caseToUpdate.photoAfter;
    
    // Placeholder to indicate empty
    const emptyPhoto = "https://placehold.co/600x400?text=Sin+Foto";

    setCases(prevCases => prevCases.map(c => {
      if (c.id !== caseId) return c;
      const targetPhoto = type === 'before' ? c.photoBefore : c.photoAfter;
      return {
        ...c,
        [type === 'before' ? 'photoBefore' : 'photoAfter']: {
           ...targetPhoto,
           url: emptyPhoto
        }
      };
    }));
    
    toast({
      title: "Foto eliminada",
      description: "La imagen ha sido removida del caso.",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
             setCases(prevCases => prevCases.map(c => {
               if (c.id !== caseId) return c;
               const targetPhoto = type === 'before' ? c.photoBefore : c.photoAfter;
               return {
                 ...c,
                 [type === 'before' ? 'photoBefore' : 'photoAfter']: {
                    ...targetPhoto,
                    url: originalPhoto.url
                 }
               };
             }));
          }}
        >
          Deshacer
        </Button>
      )
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPhotoUrl: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPhotoUrl(imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNewModal}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar antes y después
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <p className="font-medium">Todavía no hay casos de Antes y Después.</p>
          <p className="text-sm mt-1">Hacé clic en 'Agregar antes y después' para documentar el progreso.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {cases.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group/card">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading font-semibold text-lg">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">Caso Finalizado</Badge>
                    <Button variant="ghost" size="sm" className="h-6 px-2 opacity-100 transition-opacity" onClick={() => openEditModal(item)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-px bg-border">
                {/* Before */}
                <div className="flex flex-col gap-3 bg-card p-4">
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-black text-white border-none shadow-sm px-4 py-1">
                      ANTES
                    </Badge>
                  </div>
                  <div className="relative group">
                    <PhotoCard 
                      photo={item.photoBefore} 
                      index={0} 
                      onClick={() => {}} 
                      onDelete={() => handleDeletePhoto(item.id, 'before')} 
                      onUpdate={(_, updated) => handleUpdatePhoto(item.id, 'before', updated)}
                    />
                  </div>
                </div>

                {/* After */}
                <div className="flex flex-col gap-3 bg-card p-4">
                  <div className="flex justify-center">
                    <Badge className="bg-primary text-white border-none shadow-sm px-4 py-1">
                      DESPUÉS
                    </Badge>
                  </div>
                  <div className="relative group">
                    <PhotoCard 
                      photo={item.photoAfter} 
                      index={0} 
                      onClick={() => {}} 
                      onDelete={() => handleDeletePhoto(item.id, 'after')} 
                      onUpdate={(_, updated) => handleUpdatePhoto(item.id, 'after', updated)}
                    />
                  </div>
                </div>
              </div>

              {/* Description Footer - Moved to bottom as requested */}
              <div className="p-4 bg-card border-t text-sm text-muted-foreground">
                 <p>{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCase ? "Editar caso" : "Agregar caso Antes y Después"}</DialogTitle>
            <DialogDescription>
              {editingCase ? "Modifique los detalles del caso clínico." : "Suba las fotos comparativas y agregue una descripción del tratamiento."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del tratamiento</Label>
              <Input id="title" name="title" placeholder="Ej. Rinomodelación" defaultValue={editingCase?.title} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Foto Antes</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group relative"
                  onClick={() => fileInputBeforeRef.current?.click()}
                >
                   <input 
                     type="file" 
                     className="hidden" 
                     ref={fileInputBeforeRef}
                     accept="image/*"
                     onChange={(e) => handleFileChange(e, setModalPhotoBefore)}
                   />
                   <div className="w-full aspect-[4/3] bg-muted mb-2 rounded overflow-hidden relative flex items-center justify-center">
                      {modalPhotoBefore && !modalPhotoBefore.includes("placehold.co") ? (
                        <>
                          <img src={modalPhotoBefore} className="w-full h-full object-cover" alt="Before" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors">
                             <div className="flex flex-col items-center bg-black/50 p-3 rounded-lg backdrop-blur-sm shadow-sm">
                               <UploadCloud className="text-white w-6 h-6 mb-1" />
                               <span className="text-white text-[10px] font-medium uppercase tracking-wide">Cambiar</span>
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                          <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs">Haga clic para subir</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Foto Después</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group relative"
                  onClick={() => fileInputAfterRef.current?.click()}
                >
                   <input 
                     type="file" 
                     className="hidden" 
                     ref={fileInputAfterRef}
                     accept="image/*"
                     onChange={(e) => handleFileChange(e, setModalPhotoAfter)}
                   />
                   <div className="w-full aspect-[4/3] bg-muted mb-2 rounded overflow-hidden relative flex items-center justify-center">
                      {modalPhotoAfter && !modalPhotoAfter.includes("placehold.co") ? (
                        <>
                          <img src={modalPhotoAfter} className="w-full h-full object-cover" alt="After" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors">
                             <div className="flex flex-col items-center bg-black/50 p-3 rounded-lg backdrop-blur-sm shadow-sm">
                               <UploadCloud className="text-white w-6 h-6 mb-1" />
                               <span className="text-white text-[10px] font-medium uppercase tracking-wide">Cambiar</span>
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                          <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs">Haga clic para subir</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción / Notas del Caso</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Detalles del procedimiento y resultados..." 
                defaultValue={editingCase?.description} 
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
