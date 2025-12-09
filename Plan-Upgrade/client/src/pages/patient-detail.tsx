import { Layout } from "@/components/layout/Layout";
import { Patient, Photo } from "@/lib/mockData";
import { useRoute, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Plus, Trash2, Undo2, CreditCard, Camera } from "lucide-react";
import { PhotoGallery } from "@/components/patients/PhotoGallery";
import { VisitHistory } from "@/components/patients/VisitHistory";
import { BeforeAfter } from "@/components/patients/BeforeAfter";
import { MedicalRecords } from "@/components/patients/MedicalRecords";
import { useState, useEffect, useRef } from "react";
import { VisitForm, PatientForm } from "@/components/forms/DialogForms";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PhotoCard } from "@/components/shared/PhotoCard";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function PatientDetail() {
  const { toast } = useToast();
  const [match, params] = useRoute("/pacientes/:slug");
  const [, setLocation] = useLocation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");
  const [notes, setNotes] = useState<{id: string, text: string, date: string}[]>([
    { id: "1", text: "Paciente refiere sensibilidad al sol. Se recomienda SPF 50+.", date: new Date().toISOString() }
  ]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{id: string, text: string, date: string} | null>(null);

  // State for the main photo to support label/description updates
  const [mainPhoto, setMainPhoto] = useState<Photo | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPatient() {
      if (match && params?.slug) {
        try {
          setIsLoading(true);
          const data = await api.getPatient(params.slug);
          setPatient(data);
          
          // Initialize main photo as a Photo object
          setMainPhoto({
            id: "main-avatar",
            url: data.avatar,
            date: new Date().toISOString(),
            type: "general",
            notes: ""
          });

          if (data.notes && notes.length === 1 && notes[0].text.includes("Paciente refiere")) {
            setNotes([{ id: "init", text: data.notes, date: new Date().toISOString() }]);
          }
        } catch (error) {
          console.error('Error loading patient:', error);
          toast({
            title: "Error",
            description: "No se pudo cargar el paciente",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadPatient();
  }, [match, params?.slug, toast]);

  if (!match || (isLoading && !patient)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-4">
          <p>Cargando...</p>
        </div>
      </Layout>
    );
  }

  if (!patient || !mainPhoto) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-4">
          <p>Paciente no encontrado</p>
          <Button variant="outline" onClick={() => setLocation("/")}>Volver al inicio</Button>
        </div>
      </Layout>
    );
  }

  const handleAddVisit = async (data: any) => {
    try {
      const newVisit = {
        date: `${data.date}T${data.time}:00`,
        treatment: data.treatment,
        notes: data.notes || "",
        status: data.status,
        photos: data.photos || []
      };

      const updatedPatient = await api.addVisit(patient.id, newVisit);
      setPatient(updatedPatient);
      setActiveTab("visits");
      
      toast({
        title: "Visita registrada",
        description: "La nueva visita ha sido guardada correctamente."
      });
    } catch (error) {
      console.error('Error adding visit:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la visita",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePatient = async (data: any) => {
    try {
      const updates: Partial<Patient> = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
      };
      
      // Recalculate age if birthDate is updated
      if (data.birthDate) {
        const birth = new Date(data.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        updates.age = age;
      }

      const updatedPatient = await api.updatePatient(patient.id, updates);
      setPatient(updatedPatient);

      // Also update mainPhoto if avatar changed
      if (data.avatar && data.avatar !== patient?.avatar) {
        setMainPhoto(prev => prev ? { ...prev, url: data.avatar } : {
          id: "main-avatar",
          url: data.avatar,
          date: new Date().toISOString(),
          type: "general",
          notes: ""
        });
      }

      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente han sido modificados."
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente",
        variant: "destructive"
      });
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, text, date: new Date().toISOString() } : n));
      toast({ title: "Nota actualizada" });
    } else {
      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        date: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      toast({ title: "Nota creada" });
    }
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;

    setNotes(prev => prev.filter(n => n.id !== id));
    toast({ 
      title: "Nota eliminada",
      description: "La nota ha sido movida a la papelera.",
      action: (
        <Button variant="outline" size="sm" onClick={() => setNotes(prev => [noteToDelete, ...prev])}>
          <Undo2 className="w-4 h-4 mr-2" />
          Deshacer
        </Button>
      )
    });
  };

  const handleUpdateMainPhoto = (_idx: number, updated: Photo) => {
    setMainPhoto(updated);
    // Removed toast to avoid spamming on every keystroke
  };

  const handleDeleteMainPhoto = async () => {
    if (!mainPhoto || !patient) return;

    const originalUrl = mainPhoto.url;
    
    try {
      // Set to empty string to indicate "No Photo" state
      const updatedPhoto = { ...mainPhoto, url: "" };
      setMainPhoto(updatedPhoto);
      
      // Update patient via API
      await api.updatePatient(patient.id, { avatar: "" });
      setPatient({ ...patient, avatar: "" });

      toast({
        title: "Foto de perfil eliminada",
        description: "La imagen ha sido removida.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              try {
                setMainPhoto({ ...mainPhoto, url: originalUrl });
                await api.updatePatient(patient.id, { avatar: originalUrl });
                setPatient({ ...patient, avatar: originalUrl });
              } catch (error) {
                console.error('Error restoring photo:', error);
              }
            }}
          >
            Deshacer
          </Button>
        )
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto",
        variant: "destructive"
      });
    }
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      try {
        setMainPhoto(prev => prev ? { ...prev, url: imageUrl } : null);
        
        if (patient) {
          await api.updatePatient(patient.id, { avatar: imageUrl });
          setPatient({ ...patient, avatar: imageUrl });
        }
        
        toast({
          title: "Foto de perfil actualizada",
          description: "La nueva imagen se ha guardado correctamente."
        });
      } catch (error) {
        console.error('Error updating photo:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la foto",
          variant: "destructive"
        });
      }
    }
  };

  const scrollToTabs = () => {
    const tabsElement = document.getElementById("patient-tabs");
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Removed "Volver a Pacientes" button here - now in Layout Header */}

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden relative">
          {/* Top Blue Header - New Design */}
          <div className="bg-gradient-to-r from-primary/20 to-accent/30 p-8">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 ml-[18rem] min-h-[50px]">
                  <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground">{patient.name}</h1>
                    <div className="flex items-center gap-3 text-muted-foreground mt-2 text-base">
                      <span className="font-medium text-foreground/80">{patient.age} años</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                      {patient.birthDate && (
                        <>
                          <span>{format(new Date(patient.birthDate), "dd/MM/yyyy")}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                        </>
                      )}
                      <span>DNI {patient.dni}</span>
                      {patient.obraSocial && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <CreditCard className="w-4 h-4" />
                            {patient.obraSocial}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {patient.tags.map(tag => (
                        <Badge key={tag} className="bg-primary/90 hover:bg-primary text-white font-medium px-3 py-1 text-sm shadow-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-2 md:mt-0">
                    <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-primary/20 hover:bg-white/80" onClick={() => setIsEditModalOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button onClick={() => setIsVisitModalOpen(true)} className="shadow-lg shadow-primary/20">
                      <Calendar className="w-4 h-4 mr-2" />
                      Nueva Visita
                    </Button>
                  </div>
             </div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row gap-8 items-start">
              {/* Main Photo Area - Positioned absolutely overlapping the header slightly or just standard layout */}
              <div className="-mt-32 relative flex-shrink-0 z-10 w-64 group">
                {/* Use PhotoCard directly for functionality, but style it to fit */}
                <div className="shadow-2xl rounded-xl overflow-hidden bg-background border-4 border-card relative">
                  {mainPhoto.url ? (
                    <PhotoCard 
                      photo={mainPhoto} 
                      index={0} 
                      onClick={() => setIsLightboxOpen(true)}
                      onUpdate={handleUpdateMainPhoto}
                      onDelete={handleDeleteMainPhoto}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground cursor-pointer group hover:bg-muted/80 transition-colors relative"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Subir foto de perfil"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarFallback className="text-6xl rounded-none bg-muted w-full h-full">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                         <Camera className="w-10 h-10 text-white drop-shadow-md mb-2" aria-hidden="true" />
                         <span className="text-white font-medium drop-shadow-md text-sm">Subir Foto</span>
                      </div>
                    </div>
                  )}
                  
                </div>
                <label htmlFor="profile-upload" className="sr-only">Subir foto de perfil</label>
                <input 
                  id="profile-upload"
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleProfilePhotoChange} 
                  accept="image/*" 
                />
              </div>

              {/* Bottom Section - Detailed Info */}
              <section className="flex-1 pt-6 w-full" aria-label="Información del paciente">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Contacto
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium text-lg">{patient.phone}</span>
                      </div>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-foreground">{patient.email}</span>
                         </div>
                      </div>
                      {patient.obraSocial && (
                        <div className="flex flex-col pt-1">
                          <span className="text-foreground font-medium">{patient.obraSocial}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <h4 className="font-semibold text-foreground flex items-center gap-2">
                         <Edit className="w-4 h-4 text-primary" />
                         Notas Médicas
                       </h4>
                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}>
                         <Plus className="w-4 h-4" />
                       </Button>
                     </div>
                     
                     <div className="space-y-3">
                       {notes.map(note => (
                         <Card key={note.id} className="p-3 relative group border-l-4 border-l-primary/50">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                              <span>{format(new Date(note.date), "dd MMM yyyy - HH:mm", { locale: es })}</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setEditingNote(note); setIsNoteModalOpen(true); }}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-foreground/90 leading-relaxed italic">"{note.text}"</p>
                         </Card>
                       ))}
                       {notes.length === 0 && <p className="text-muted-foreground text-xs italic pl-1">No hay notas registradas.</p>}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-semibold text-foreground md:pl-6">Resumen</h4>
                     <nav className="grid grid-cols-2 gap-4 pl-0 md:pl-6" aria-label="Accesos rápidos">
                       <button 
                         className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors cursor-pointer active:scale-95 duration-200"
                         onClick={() => {
                           setActiveTab("visits");
                           setTimeout(scrollToTabs, 100);
                         }}
                         aria-label={`Ver ${patient.visits.length} visitas`}
                       >
                         <span className="block text-3xl font-bold text-primary">{patient.visits.length}</span>
                         <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Visitas</span>
                       </button>
                       <button 
                         className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors cursor-pointer active:scale-95 duration-200"
                         onClick={() => {
                           setActiveTab("photos");
                           setTimeout(scrollToTabs, 100);
                         }}
                         aria-label={`Ver ${patient.photos.length} fotos`}
                       >
                         <span className="block text-3xl font-bold text-primary">{patient.photos.length}</span>
                         <span className="text-xs font-medium text-muted-foreground uppercase mt-1">Fotos</span>
                       </button>
                     </nav>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <Tabs id="patient-tabs" value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          // Optional: Scroll on tab click too if desired, but user emphasized internal links
          setTimeout(scrollToTabs, 100); 
        }} className="w-full space-y-6">
          <TabsList className="w-full justify-start h-auto bg-transparent border-b rounded-none p-0 space-x-8 overflow-x-auto" aria-label="Secciones del expediente">
            {[
              { id: "photos", label: "Galería de Fotos" },
              { id: "visits", label: "Visitas" },
              { id: "beforeafter", label: "Antes y Después" },
              { id: "fichas", label: "Fichas" },
              { id: "documentos", label: "Documentos" }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 text-muted-foreground data-[state=active]:text-primary font-medium text-base transition-all hover:text-foreground whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="photos" className="focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PhotoGallery photos={patient.photos} />
            </TabsContent>
            <TabsContent value="visits" className="focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <VisitHistory visits={patient.visits} onAddVisit={() => setIsVisitModalOpen(true)} />
            </TabsContent>
            <TabsContent value="beforeafter" className="focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BeforeAfter cases={patient.cases} />
            </TabsContent>
            <TabsContent value="fichas" className="focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MedicalRecords records={patient.records} mode="fichas" />
            </TabsContent>
            <TabsContent value="documentos" className="focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MedicalRecords records={patient.records} mode="documentos" />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <VisitForm 
        open={isVisitModalOpen} 
        onOpenChange={setIsVisitModalOpen} 
        onSubmit={handleAddVisit} 
        mode="create"
      />

      <PatientForm
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdatePatient}
        defaultValues={{
          name: patient.name,
          dni: patient.dni,
          age: patient.age,
          phone: patient.phone,
          email: patient.email,
          birthDate: patient.birthDate, // Pass to form
          tags: patient.tags.join(", "),
          notes: patient.notes,
          obraSocial: patient.obraSocial, // Pass to form
          avatar: patient.avatar // Pass current avatar to form
        }}
        mode="edit"
      />

      {/* Manual Lightbox for Main Photo */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-transparent border-none text-white overflow-hidden flex flex-col focus:outline-none shadow-2xl [&>button]:text-white [&>button]:bg-black/20 [&>button]:hover:bg-white/20 [&>button]:top-4 [&>button]:right-4 [&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full shadow-none ring-0">
           
           <div className="flex-1 relative flex items-center justify-center bg-black/95">
              <img 
                src={mainPhoto.url} 
                alt={`Foto de perfil de ${patient.name}`}
                className="max-h-full max-w-full object-contain animate-in fade-in zoom-in-95 duration-300"
              />
              
              <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-20">
                <div className="inline-block bg-transparent px-6 py-4 rounded-xl text-sm max-w-xl pointer-events-auto">
                   <div className="flex items-center justify-center gap-4 mb-2">
                      <span className="font-semibold text-white drop-shadow-md">{format(new Date(mainPhoto.date), "dd MMMM yyyy", { locale: es })}</span>
                      {mainPhoto.type && (
                        <Badge variant="outline" className="text-white border-white/60 bg-black/20 backdrop-blur-sm">
                          {mainPhoto.type}
                        </Badge>
                      )}
                   </div>
                   <Input 
                     className="bg-transparent border-transparent text-white placeholder:text-white/70 focus:bg-transparent focus:ring-0 shadow-none text-center text-lg font-medium drop-shadow-md"
                     value={mainPhoto.notes || ""}
                     onChange={(e) => handleUpdateMainPhoto(0, { ...mainPhoto, notes: e.target.value })}
                     placeholder="Agregar descripción..."
                     onKeyDown={(e) => {
                       if (e.key === "Enter") {
                         e.currentTarget.blur();
                       }
                     }}
                   />
                </div>
              </div>
           </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? "Editar Nota" : "Nueva Nota"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNote} className="space-y-4">
             <Textarea 
               name="text" 
               placeholder="Escriba la nota médica..." 
               defaultValue={editingNote?.text || ""}
               required
               className="min-h-[100px]"
             />
             <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>Cancelar</Button>
               <Button type="submit">Guardar</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
