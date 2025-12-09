import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState, useRef } from "react";
import { Patient, Visit, Photo } from "@/lib/mockData";
import { format } from "date-fns";
import { UploadCloud, X, Loader2, Camera } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const visitSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  treatment: z.string().min(2, "El tratamiento es requerido"),
  notes: z.string().optional(),
  status: z.enum(["Programada", "Realizada", "Cancelada"]).default("Programada"),
});

type VisitFormValues = z.infer<typeof visitSchema>;

interface VisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VisitFormValues & { photos: Photo[] }) => void;
  defaultValues?: Partial<VisitFormValues>;
  existingPhotos?: Photo[]; // New: Pass existing photos for edit mode
  mode?: "create" | "edit";
}

export function VisitForm({ open, onOpenChange, onSubmit, defaultValues, existingPhotos = [], mode = "create" }: VisitFormProps) {
  const [newPhotos, setNewPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      treatment: "",
      notes: "",
      status: "Programada",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
         date: format(new Date(), "yyyy-MM-dd"),
         time: format(new Date(), "HH:mm"),
         treatment: "",
         notes: "",
         status: "Programada",
         ...defaultValues
      });
      setNewPhotos([]); // Reset new photos
      setIsSubmitting(false);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = async (data: VisitFormValues) => {
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit({ ...data, photos: newPhotos });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newUploadedPhotos: Photo[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        date: new Date().toISOString(),
        type: "visit"
      }));
      setNewPhotos(prev => [...prev, ...newUploadedPhotos]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Visita" : "Editar Visita"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Registre los detalles de la nueva consulta médica." : "Modifique los detalles de la visita."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Programada">Programada</SelectItem>
                      <SelectItem value="Realizada">Realizada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamiento / Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Botox, Consulta Inicial..." {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Clínicas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles de la sesión..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />
            
            {/* Photo Upload Area */}
            <div className="space-y-2">
              <Label>Fotos de la visita</Label>
              
              {/* Existing Photos List (Read only preview) */}
              {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[...existingPhotos, ...newPhotos].map((p, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={p.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div 
                className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors bg-muted/10 relative"
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-xs">Agregar fotos</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const patientSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  dni: z.string().min(6, "El DNI es requerido y debe ser válido"),
  age: z.coerce.number().min(0, "Edad inválida"),
  phone: z.string().min(5, "El teléfono es requerido"),
  email: z.string().email("El email es requerido y debe ser válido"),
  obraSocial: z.string().min(2, "La obra social es requerida"),
  birthDate: z.string().optional(),
  tags: z.string().optional(), // Comma separated string for simplicity in mockup
  notes: z.string().optional(),
  avatar: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PatientFormValues) => void;
  defaultValues?: Partial<PatientFormValues>;
  mode: "create" | "edit";
}

export function PatientForm({ open, onOpenChange, onSubmit, defaultValues, mode }: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      dni: "",
      age: 0,
      birthDate: "",
      phone: "",
      email: "",
      obraSocial: "",
      tags: "",
      notes: "",
      avatar: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        dni: "",
        age: 0,
        birthDate: "",
        phone: "",
        email: "",
        obraSocial: "",
        tags: "",
        notes: "",
        avatar: "",
        ...defaultValues
      });
      setAvatarPreview(defaultValues?.avatar || null);
      setIsSubmitting(false);
    }
  }, [open, defaultValues, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
      form.setValue("avatar", imageUrl);
    }
  };

  const handleSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(data);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nuevo Paciente" : "Editar Paciente"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Ingrese los datos del nuevo paciente." : "Modifique los datos del paciente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-muted">
                    {form.watch("name") 
                      ? form.watch("name").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                      : <Camera className="w-8 h-8 text-muted-foreground" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click para {avatarPreview ? "cambiar" : "subir"} foto
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI / Documento <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="12.345.678" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 11..." {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@email.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="obraSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obra Social <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. OSDE, Swiss Medical..." {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas (separadas por coma)</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP, Botox, Facial..." {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Generales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Antecedentes, alergias, preferencias..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
