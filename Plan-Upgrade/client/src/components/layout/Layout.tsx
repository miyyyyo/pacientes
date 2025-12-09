import { Link, useLocation } from "wouter";
import { Stethoscope, Search, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/lib/searchContext";

interface LayoutProps {
  children: React.ReactNode;
  sidebarAction?: React.ReactNode;
}

// SidebarContent component defined outside Layout to prevent re-renders losing focus
function SidebarContent({ sidebarAction }: { sidebarAction?: React.ReactNode }) {
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedTags, 
    toggleTag, 
    clearTags, 
    availableTags 
  } = useSearch();

  return (
    // ACCESSIBILITY: Changed to semantic <aside> with proper role
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border" role="complementary" aria-label="Barra lateral de búsqueda y filtros">
      {/* Logo Area - Clickable to Home */}
      <Link href="/">
        <div className="p-6 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent/10 transition-colors">
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md" aria-hidden="true">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="leading-tight">Clínica <br/>Dr. Julián</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2 font-medium ml-1">Cirugía Plástica de excelencia</p>
        </div>
      </Link>

      {/* Search & Filters Area */}
      {/* ACCESSIBILITY: Wrapped in <nav> for better semantics */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6" aria-label="Búsqueda y filtros de pacientes">
        
        {/* Sidebar Action (e.g. New Patient) */}
        {sidebarAction && (
          <div className="mb-4">
            {sidebarAction}
          </div>
        )}
        
        {/* Search Input */}
        <div className="space-y-2">
          {/* ACCESSIBILITY: Using semantic heading for section */}
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Búsqueda</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {/* ACCESSIBILITY: Added proper label and aria-label */}
            <label htmlFor="search-input" className="sr-only">Buscar paciente por nombre, DNI, etiquetas u obra social</label>
            <Input 
              id="search-input"
              type="search"
              placeholder="Buscar paciente..."
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar paciente por nombre, DNI, etiquetas u obra social"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-1 font-medium">
            Buscando por nombre, DNI, etiquetas u obra social.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* ACCESSIBILITY: Changed to h2 for proper heading hierarchy */}
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etiquetas</h2>
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 text-[10px] px-2 text-muted-foreground hover:text-destructive"
                onClick={clearTags}
                aria-label="Limpiar todas las etiquetas seleccionadas"
              >
                Limpiar
              </Button>
            )}
          </div>
          
          {/* ACCESSIBILITY: Added role="group" and aria-label for tag buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros por etiquetas">
            {availableTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-2 py-1 text-xs font-normal transition-all",
                    isSelected 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                      : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => toggleTag(tag)}
                  // ACCESSIBILITY: Added proper button role and aria-pressed
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Filtrar por etiqueta ${tag}${isSelected ? ', actualmente seleccionada' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTag(tag);
                    }
                  }}
                >
                  {tag}
                  {isSelected && <X className="w-3 h-3 ml-1" aria-hidden="true" />}
                </Badge>
              );
            })}
            {availableTags.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No hay etiquetas disponibles</p>
            )}
          </div>
        </div>

      </nav>

      {/* User Footer */}
      <footer className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-primary font-bold shadow-sm" aria-hidden="true">
            HJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Dr. Héctor Julián</p>
            <p className="text-xs text-muted-foreground truncate">Cirujano Plástico</p>
          </div>
        </div>
      </footer>
    </aside>
  );
}

export function Layout({ children, sidebarAction }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {/* ACCESSIBILITY: Proper semantic element already in place */}
      <div className="hidden md:block w-64 flex-shrink-0 fixed inset-y-0 z-50 shadow-sm">
        <SidebarContent sidebarAction={sidebarAction} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent sidebarAction={sidebarAction} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      {/* ACCESSIBILITY: Proper <main> element with role */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col" role="main">
        {/* Header - Simplified */}
        {/* ACCESSIBILITY: Using semantic <header> */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm" role="banner">
           {/* Mobile Menu Trigger */}
           <div className="md:hidden">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setIsMobileOpen(true)}
               aria-label="Abrir menú de búsqueda"
             >
               <Search className="w-5 h-5" />
             </Button>
           </div>
           
           {/* Title / Breadcrumb Area */}
           <div className="flex items-center gap-4">
             {location.startsWith("/pacientes/") && (
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="text-muted-foreground hover:text-foreground pl-0 pr-2" 
                 onClick={() => setLocation("/")}
                 aria-label="Volver a la lista de pacientes"
               >
                 <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                 Volver
               </Button>
             )}
             {/* ACCESSIBILITY: Changed to <h1> for page title (screen readers will announce this as the main heading) */}
             {/* If we are in a detail page (starts with /pacientes/), the main H1 is inside the page content (Patient Name). */}
             {/* Otherwise (Dashboard), this header is the main H1. */}
             {location.startsWith("/pacientes/") ? (
               <div className="font-medium text-lg text-foreground/80">
                 Gestor de Pacientes
               </div>
             ) : (
               <h1 className="font-medium text-lg text-foreground/80">
                 Gestor de Pacientes
               </h1>
             )}
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-4">
             <time className="text-xs text-muted-foreground hidden sm:block">
               {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
             </time>
           </div>
        </header>

        {/* ACCESSIBILITY: Main content area with proper ID for skip links */}
        <div id="main-content" className="flex-1 p-6 overflow-auto" tabIndex={-1}>
          {children}
        </div>

        {/* Footer */}
        {/* ACCESSIBILITY: Using semantic <footer> */}
        <footer className="py-4 px-6 border-t text-center text-xs text-muted-foreground bg-muted/20" role="contentinfo">
          <p>© {new Date().getFullYear()} Clínica Dr. Julián – Gestor Clínico. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
