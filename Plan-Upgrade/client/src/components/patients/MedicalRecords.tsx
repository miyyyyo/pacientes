import { MedicalRecord } from "@/lib/mockData";
import { FileText, File, Pill, Upload, Trash2, Undo2, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PhotoCard } from "@/components/shared/PhotoCard";

interface MedicalRecordsProps {
  records: MedicalRecord[];
  mode: "fichas" | "documentos"; // New prop to control display mode
}

export function MedicalRecords({ records: initialRecords, mode }: MedicalRecordsProps) {
  const [records, setRecords] = useState(initialRecords);
  const { toast } = useToast();

  // Filter records based on mode
  // mode 'fichas' -> show images (content includes http)
  // mode 'documentos' -> show docs (content undefined or not http image)
  // In a real app we'd use the 'type' field more strictly
  const filteredRecords = records.filter(r => {
    const isImage = r.content && r.content.includes("http");
    if (mode === "fichas") return isImage; // Only photos for Fichas
    if (mode === "documentos") return !isImage; // Only non-photos for Documentos
    return true;
  });

  const handleUploadDocument = () => {
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Nuevo Documento (PDF/Doc)",
      date: new Date().toISOString(),
      type: "document",
      content: undefined 
    };
    
    setRecords([newRecord, ...records]);
    toast({
      title: "Documento subido",
      description: "El archivo se ha agregado a la pestaña Documentos."
    });
  };

  const handleUploadPhoto = () => {
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Ficha Fotográfica",
      date: new Date().toISOString(),
      type: "document",
      content: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60" // Mock image
    };
    
    setRecords([newRecord, ...records]);
    toast({
      title: "Ficha subida",
      description: "La imagen se ha agregado a la pestaña Fichas."
    });
  };

  const handleDelete = (record: MedicalRecord) => {
    setRecords(prev => prev.filter(r => r.id !== record.id));
    toast({
      title: "Elemento eliminado",
      description: "El archivo ha sido movido a la papelera.",
      action: (
        <Button variant="outline" size="sm" onClick={() => setRecords(prev => [record, ...prev])}>
          Deshacer
        </Button>
      )
    });
  };

  const handleUpdateRecordPhoto = (id: string, updatedData: any) => {
    toast({ title: "Ficha actualizada", description: "Cambios guardados." });
  };

  const getIcon = (type: string, content?: string) => {
    if (content && content.includes("http")) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    switch (type) {
      case "prescription": return <Pill className="w-5 h-5 text-blue-500" />;
      case "note": return <FileText className="w-5 h-5 text-yellow-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {mode === "documentos" && (
          <Button onClick={handleUploadDocument} variant="outline" className="border-dashed">
            <FileText className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        )}
        {mode === "fichas" && (
          <Button onClick={handleUploadPhoto} variant="outline" className="border-dashed">
            <ImageIcon className="w-4 h-4 mr-2" />
            Subir fotos
          </Button>
        )}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <p>Todavía no hay {mode === "fichas" ? "fichas fotográficas" : "documentos"} para este paciente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            // Display PhotoCard for Fichas (Images)
            if (mode === "fichas") {
              const asPhoto = {
                id: record.id,
                url: record.content!,
                date: record.date,
                type: "general" as const,
                notes: record.title
              };

              return (
                <div key={record.id} className="relative">
                  <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                    FICHA
                  </div>
                  <PhotoCard 
                    photo={asPhoto}
                    index={0}
                    onClick={() => {}}
                    onDelete={() => handleDelete(record)}
                    onUpdate={(_, p) => handleUpdateRecordPhoto(record.id, p)}
                  />
                </div>
              );
            }

            // Display Standard Card for Documentos
            return (
              <Card key={record.id} className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors border-transparent hover:border-border shadow-sm group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(record)}>
                      <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-50/50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-100">
                    {getIcon(record.type, record.content)}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="text-sm font-medium text-foreground truncate pr-6">{record.title}</h4>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {record.type === 'document' ? 'Documento' : record.type} • {format(new Date(record.date), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                   <Input 
                     className="h-7 text-xs border-transparent hover:border-input focus:border-primary px-2 bg-transparent"
                     placeholder="Agregar nota..."
                     defaultValue={record.title}
                   />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
