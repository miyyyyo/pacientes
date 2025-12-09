import { patientStorage } from './patientStorage';
import { addDays, subDays, subMonths } from "date-fns";

// Mock images
const mockFace1 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60";
const mockFace1Angle = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&flip=h";
const mockFaceBefore = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60";
const mockFaceAfter = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60";

const imgPortrait2 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60";
const imgPortrait3 = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60";
const imgClinic = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60";
const imgSkin2 = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&auto=format&fit=crop&q=60";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export async function initializeMockData() {
  const existingPatients = await patientStorage.getAllPatients();
  
  // Only initialize if no patients exist
  if (existingPatients.length > 0) {
    console.log('Patients already exist, skipping initialization');
    return;
  }

  console.log('Initializing mock patient data...');

  const mockPatients = [
    {
      slug: "ana-garcia",
      name: "Ana García",
      age: 34,
      birthDate: "1990-05-15",
      dni: "34.123.456",
      phone: "+54 9 11 1234 5678",
      email: "ana.garcia@email.com",
      avatar: mockFace1,
      tags: ["VIP", "Botox", "Facial"],
      notes: "Paciente prefiere citas por la mañana. Sensibilidad en zona T.",
      lastVisitDate: subDays(new Date(), 5).toISOString(),
      obraSocial: "OSDE 410",
      visits: [
        {
          date: subDays(new Date(), 5).toISOString(),
          treatment: "Botox Full Face",
          notes: "Aplicación estándar, 50 unidades. Sin complicaciones.",
          status: "Realizada" as const,
          photos: [
            { id: "p1", url: mockFace1, date: subDays(new Date(), 5).toISOString(), type: "visit" as const, notes: "Inmediato post-op" }
          ]
        },
        {
          date: subMonths(new Date(), 4).toISOString(),
          treatment: "Consulta Inicial",
          notes: "Evaluación facial completa. Plan de tratamiento propuesto.",
          status: "Realizada" as const,
          photos: []
        }
      ],
      photos: [
        { id: "g1", url: mockFace1, date: subMonths(new Date(), 1).toISOString(), type: "general" as const, notes: "Frente" },
        { id: "g2", url: mockFace1Angle, date: subMonths(new Date(), 1).toISOString(), type: "general" as const, notes: "Perfil Derecho" },
        { id: "g3", url: mockFace1, date: subMonths(new Date(), 2).toISOString(), type: "general" as const, notes: "Control mensual" },
        { id: "g4", url: mockFace1Angle, date: subMonths(new Date(), 2).toISOString(), type: "general" as const, notes: "Perfil Izquierdo" },
      ],
      cases: [
        {
          id: "c1",
          title: "Rinomodelación",
          description: "Corrección de dorso nasal.",
          dateBefore: subMonths(new Date(), 3).toISOString(),
          dateAfter: subDays(new Date(), 5).toISOString(),
          photoBefore: { id: "pb1", url: mockFaceBefore, date: subMonths(new Date(), 3).toISOString(), type: "before" as const, notes: "Vista frontal" },
          photoAfter: { id: "pa1", url: mockFaceAfter, date: subDays(new Date(), 5).toISOString(), type: "after" as const, notes: "Resultado 3 meses" }
        }
      ],
      records: [
        { id: "r1", title: "Consentimiento Informado - Botox", date: subMonths(new Date(), 4).toISOString(), type: "document" as const },
        { id: "r2", title: "Ficha Médica Inicial", date: subMonths(new Date(), 4).toISOString(), type: "document" as const }
      ]
    },
    {
      slug: "maria-rodriguez",
      name: "María Rodríguez",
      age: 28,
      dni: "38.987.654",
      phone: "+54 9 11 9876 5432",
      email: "maria.rod@email.com",
      avatar: imgPortrait2,
      tags: ["Rellenos", "Labios"],
      notes: "Alérgica a la penicilina.",
      lastVisitDate: subMonths(new Date(), 1).toISOString(),
      obraSocial: "Swiss Medical",
      visits: [
        {
          date: subMonths(new Date(), 1).toISOString(),
          treatment: "Relleno de Labios",
          notes: "1ml Ácido Hialurónico. Resultado natural.",
          status: "Realizada" as const,
          photos: [
            { id: "p2", url: imgPortrait2, date: subMonths(new Date(), 1).toISOString(), type: "visit" as const }
          ]
        }
      ],
      photos: [
        { id: "g3", url: imgPortrait2, date: subMonths(new Date(), 2).toISOString(), type: "general" as const }
      ],
      cases: [],
      records: [
        { id: "r3", title: "Historial Clínico", date: subMonths(new Date(), 2).toISOString(), type: "document" as const }
      ]
    },
    {
      slug: "lucia-fernandez",
      name: "Lucía Fernández",
      age: 45,
      dni: "25.456.789",
      phone: "+54 9 11 4567 8901",
      email: "lucia.fer@email.com",
      avatar: imgPortrait3,
      tags: ["Anti-age", "Láser"],
      notes: "Seguimiento anual.",
      lastVisitDate: subDays(new Date(), 20).toISOString(),
      obraSocial: "Galeno",
      visits: [
        {
          date: subDays(new Date(), 20).toISOString(),
          treatment: "Radiofrecuencia",
          notes: "Sesión 1 de 6.",
          status: "Realizada" as const,
          photos: []
        },
        {
          date: addDays(new Date(), 5).toISOString(),
          treatment: "Radiofrecuencia",
          notes: "Sesión 2 de 6.",
          status: "Programada" as const,
          photos: []
        }
      ],
      photos: [
        { id: "g4", url: imgPortrait3, date: subMonths(new Date(), 6).toISOString(), type: "general" as const }
      ],
      cases: [
        {
          id: "c2",
          title: "Rejuvenecimiento Facial",
          description: "Tratamiento combinado 6 meses.",
          dateBefore: subMonths(new Date(), 6).toISOString(),
          dateAfter: subDays(new Date(), 20).toISOString(),
          photoBefore: { id: "pb2", url: imgSkin2, date: subMonths(new Date(), 6).toISOString(), type: "before" as const, notes: "Textura inicial" },
          photoAfter: { id: "pa2", url: imgPortrait3, date: subDays(new Date(), 20).toISOString(), type: "after" as const, notes: "Post tratamiento" }
        }
      ],
      records: []
    }
  ];

  for (const patientData of mockPatients) {
    try {
      await patientStorage.createPatient(patientData);
      console.log(`Created patient: ${patientData.name}`);
    } catch (error) {
      console.error(`Error creating patient ${patientData.name}:`, error);
    }
  }

  console.log('Mock data initialization complete');
}
