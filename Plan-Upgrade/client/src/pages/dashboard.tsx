import { Layout } from "@/components/layout/Layout";
import { Patient, generateSlug, DEFAULT_AVATAR } from "@/lib/mockData";
import { PatientCard } from "@/components/patients/PatientCard";
import { useState, useEffect } from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/components/forms/DialogForms";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/lib/searchContext";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { searchTerm, selectedTags, setAvailableTags } = useSearch();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load patients from API on mount
  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await api.getAllPatients();
        setPatients(data);
      } catch (error) {
        console.error('Error loading patients:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pacientes",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, [toast]);

  // Sync available tags to context on mount/change
  useEffect(() => {
    const allTags = Array.from(new Set(patients.flatMap(p => p.tags)));
    setAvailableTags(allTags);
  }, [patients, setAvailableTags]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTags]);

  // Scroll to top when pagination changes
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      patient.name.toLowerCase().includes(term) || 
      patient.dni.includes(term) ||
      patient.tags.some(t => t.toLowerCase().includes(term)) ||
      (patient.obraSocial && patient.obraSocial.toLowerCase().includes(term));
      
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.every(tag => patient.tags.includes(tag));
                        
    return matchesSearch && matchesTags;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreatePatient = async (data: any) => {
    try {
      const slug = generateSlug(data.name);
      const newPatientData = {
        slug: slug,
        name: data.name,
        age: data.age,
        dni: data.dni,
        phone: data.phone || "",
        email: data.email || "",
        avatar: data.avatar || DEFAULT_AVATAR,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
        notes: data.notes || "",
        visits: [],
        photos: [],
        cases: [],
        records: [],
        obraSocial: data.obraSocial,
        birthDate: data.birthDate
      };
      
      const newPatient = await api.createPatient(newPatientData);
      
      // Update local state
      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: "Paciente creado",
        description: `${newPatient.name} ha sido agregado correctamente.`
      });

      // Navigate to the new patient's detail page
      setLocation(`/pacientes/${slug}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el paciente",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout
      sidebarAction={
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          onClick={() => setIsNewPatientOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Paciente
        </Button>
      }
    >
      {/* ACCESSIBILITY: Wrapped in semantic <section> with proper heading */}
      <section className="max-w-7xl mx-auto space-y-8" aria-labelledby="patients-heading">
        {/* ACCESSIBILITY: Added visually hidden heading for screen readers */}
        <h2 id="patients-heading" className="sr-only">Lista de pacientes</h2>
        
        {/* Grid */}
        {/* ACCESSIBILITY: Added role="list" for better screen reader support */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]" role="list" aria-label="Tarjetas de pacientes">
          {paginatedPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
          
          {filteredPatients.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed h-64" role="status">
               <Search className="w-12 h-12 mb-4 opacity-20" aria-hidden="true" />
               <p className="text-lg font-medium">No se encontraron pacientes</p>
               <p className="text-sm">Intente ajustar los términos de búsqueda o filtros en la barra lateral.</p>
             </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 pt-4" aria-label="Paginación de pacientes">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Ir a la página anterior"
            >
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              Anterior
            </Button>
            <span className="text-sm font-medium text-muted-foreground" aria-current="page" aria-live="polite">
              Página {currentPage} de {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Ir a la página siguiente"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </nav>
        )}
      </section>

      <PatientForm 
        open={isNewPatientOpen} 
        onOpenChange={setIsNewPatientOpen}
        onSubmit={handleCreatePatient}
        mode="create"
      />
    </Layout>
  );
}
