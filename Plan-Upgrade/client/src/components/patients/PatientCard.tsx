import { Patient } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Phone, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <Link href={`/pacientes/${patient.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border-transparent hover:border-primary/20 h-full flex flex-col">
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-6">
          {/* Increased size from w-32 (128px) to w-48 (192px) or something significantly larger but balanced */}
          <Avatar className="h-48 w-48 border-4 border-background shadow-lg rounded-2xl">
            <AvatarImage src={patient.avatar} className="object-cover" />
            <AvatarFallback className="text-4xl rounded-2xl">{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center w-full px-2">
            <h3 className="font-heading font-semibold text-2xl truncate group-hover:text-primary transition-colors">
              {patient.name}
            </h3>
            <p className="text-base text-muted-foreground mt-1">
              {patient.age} años • DNI {patient.dni}
            </p>
            {patient.obraSocial && (
               <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-primary/80 font-medium">
                 <CreditCard className="w-3.5 h-3.5" />
                 <span>{patient.obraSocial}</span>
               </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4 text-center flex-1">
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {patient.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal text-xs bg-accent/50 text-accent-foreground hover:bg-accent">
                {tag}
              </Badge>
            ))}
            {patient.tags.length > 3 && (
              <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                +{patient.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
             <Phone className="w-3.5 h-3.5" />
             <span className="truncate">{patient.phone}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-3 pb-3 border-t bg-muted/20 justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {patient.lastVisitDate 
                ? `Última: ${format(new Date(patient.lastVisitDate), "d MMM yyyy", { locale: es })}`
                : "Sin visitas recientes"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
