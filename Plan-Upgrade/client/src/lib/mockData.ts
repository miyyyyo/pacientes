import { addDays, subDays, subMonths } from "date-fns";

// Import images
import imgPortrait1 from "@assets/stock_images/professional_portrai_5668f2eb.jpg";
import imgPortrait2 from "@assets/stock_images/professional_portrai_39d85f1e.jpg";
import imgPortrait3 from "@assets/stock_images/professional_portrai_0537ba62.jpg";
import imgClinic from "@assets/stock_images/modern_aesthetic_cli_4b46bcea.jpg";
import imgSkin1 from "@assets/stock_images/dermatology_skin_clo_23259109.jpg";
import imgSkin2 from "@assets/stock_images/dermatology_skin_clo_7dca92dc.jpg";

// New realistic mock images
const mockFace1 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60";
const mockFace1Angle = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&flip=h"; // Flipped for variation
const mockFaceBefore = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60"; // Serious
const mockFaceAfter = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60"; // Smiling, similar age/tone

export interface Photo {
  id: string;
  url: string;
  date: string;
  type: "general" | "visit" | "before" | "after";
  notes?: string;
}

export interface Visit {
  id: string;
  date: string;
  treatment: string;
  notes: string;
  photos: Photo[];
  status?: "Programada" | "Realizada" | "Cancelada";
}

export interface BeforeAfterCase {
  id: string;
  title: string;
  description: string;
  dateBefore: string;
  dateAfter: string;
  photoBefore: Photo; // Changed from string
  photoAfter: Photo;  // Changed from string
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: "document" | "note" | "prescription";
  content?: string; // or file url simulated
}

// Helper to generate slugs
export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, "");        // Remove leading/trailing hyphens
};

export const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Generic silhouette

export interface Patient {
  id: string;
  slug: string; // Added slug
  name: string;
  age: number;
  dni: string;
  phone: string;
  email: string;
  avatar: string;
  tags: string[];
  notes: string;
  visits: Visit[];
  photos: Photo[];
  cases: BeforeAfterCase[];
  records: MedicalRecord[];
  lastVisitDate?: string;
  obraSocial?: string;
  birthDate?: string; // New field
}

export const mockPatients: Patient[] = [
  {
    id: "1",
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
        id: "v1",
        date: subDays(new Date(), 5).toISOString(),
        treatment: "Botox Full Face",
        notes: "Aplicación estándar, 50 unidades. Sin complicaciones.",
        status: "Realizada",
        photos: [
          { id: "p1", url: mockFace1, date: subDays(new Date(), 5).toISOString(), type: "visit", notes: "Inmediato post-op" }
        ]
      },
      {
        id: "v2",
        date: subMonths(new Date(), 4).toISOString(),
        treatment: "Consulta Inicial",
        notes: "Evaluación facial completa. Plan de tratamiento propuesto.",
        status: "Realizada",
        photos: []
      }
    ],
    photos: [
      { id: "g1", url: mockFace1, date: subMonths(new Date(), 1).toISOString(), type: "general", notes: "Frente" },
      { id: "g2", url: mockFace1Angle, date: subMonths(new Date(), 1).toISOString(), type: "general", notes: "Perfil Derecho" },
      { id: "g3", url: mockFace1, date: subMonths(new Date(), 2).toISOString(), type: "general", notes: "Control mensual" },
      { id: "g4", url: mockFace1Angle, date: subMonths(new Date(), 2).toISOString(), type: "general", notes: "Perfil Izquierdo" },
    ],
    cases: [
      {
        id: "c1",
        title: "Rinomodelación",
        description: "Corrección de dorso nasal.",
        dateBefore: subMonths(new Date(), 3).toISOString(),
        dateAfter: subDays(new Date(), 5).toISOString(),
        photoBefore: { id: "pb1", url: mockFaceBefore, date: subMonths(new Date(), 3).toISOString(), type: "before", notes: "Vista frontal" },
        photoAfter: { id: "pa1", url: mockFaceAfter, date: subDays(new Date(), 5).toISOString(), type: "after", notes: "Resultado 3 meses" }
      }
    ],
    records: [
      { id: "r1", title: "Consentimiento Informado - Botox", date: subMonths(new Date(), 4).toISOString(), type: "document" },
      { id: "r2", title: "Ficha Médica Inicial", date: subMonths(new Date(), 4).toISOString(), type: "document" }
    ]
  },
  {
    id: "2",
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
        id: "v3",
        date: subMonths(new Date(), 1).toISOString(),
        treatment: "Relleno de Labios",
        notes: "1ml Ácido Hialurónico. Resultado natural.",
        status: "Realizada",
        photos: [
          { id: "p2", url: imgPortrait2, date: subMonths(new Date(), 1).toISOString(), type: "visit" }
        ]
      }
    ],
    photos: [
       { id: "g3", url: imgPortrait2, date: subMonths(new Date(), 2).toISOString(), type: "general" }
    ],
    cases: [],
    records: [
       { id: "r3", title: "Historial Clínico", date: subMonths(new Date(), 2).toISOString(), type: "document" }
    ]
  },
  {
    id: "3",
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
        id: "v4",
        date: subDays(new Date(), 20).toISOString(),
        treatment: "Radiofrecuencia",
        notes: "Sesión 1 de 6.",
        status: "Realizada",
        photos: []
      },
      {
        id: "v5",
        date: addDays(new Date(), 5).toISOString(),
        treatment: "Radiofrecuencia",
        notes: "Sesión 2 de 6.",
        status: "Programada",
        photos: []
      }
    ],
    photos: [
      { id: "g4", url: imgPortrait3, date: subMonths(new Date(), 6).toISOString(), type: "general" }
    ],
    cases: [
      {
        id: "c2",
        title: "Rejuvenecimiento Facial",
        description: "Tratamiento combinado 6 meses.",
        dateBefore: subMonths(new Date(), 6).toISOString(),
        dateAfter: subDays(new Date(), 20).toISOString(),
        photoBefore: { id: "pb2", url: imgSkin2, date: subMonths(new Date(), 6).toISOString(), type: "before", notes: "Textura inicial" },
        photoAfter: { id: "pa2", url: imgPortrait3, date: subDays(new Date(), 20).toISOString(), type: "after", notes: "Post tratamiento" }
      }
    ],
    records: []
  },
  {
    id: "4",
    slug: "sofia-martinez",
    name: "Sofía Martínez",
    age: 22,
    dni: "42.333.222",
    phone: "+54 9 11 3333 2222",
    email: "sofia.m@email.com",
    avatar: imgClinic, // Placeholder if no face
    tags: ["Acne", "Facial"],
    notes: "Tratamiento de acné activo.",
    lastVisitDate: subMonths(new Date(), 1).toISOString(),
    obraSocial: "OSDE 310",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "5",
    slug: "roberto-gomez",
    name: "Roberto Gómez",
    age: 45,
    dni: "25.666.777",
    phone: "+54 9 11 7777 6666",
    email: "robert.g@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
    tags: ["Control"],
    notes: "",
    lastVisitDate: subDays(new Date(), 2).toISOString(),
    obraSocial: "Medicus",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "6",
    slug: "valentina-ruiz",
    name: "Valentina Ruiz",
    age: 31,
    dni: "36.777.888",
    phone: "+54 9 11 8888 7777",
    email: "valen.ruiz@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
    tags: ["Botox"],
    notes: "",
    lastVisitDate: subDays(new Date(), 45).toISOString(),
    obraSocial: "Omint",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "7",
    slug: "miguel-angel",
    name: "Miguel Ángel",
    age: 38,
    dni: "30.444.555",
    phone: "+54 9 11 4444 5555",
    email: "m.angel@gmail.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
    tags: [],
    notes: "",
    obraSocial: "Particular",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "8",
    slug: "carmen-lopez",
    name: "Carmen López",
    age: 55,
    dni: "18.999.000",
    phone: "+54 9 11 9999 0000",
    email: "carmen.l@gmail.com",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60",
    tags: ["Lifting"],
    notes: "",
    lastVisitDate: subMonths(new Date(), 3).toISOString(),
    obraSocial: "Swiss Medical",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "9",
    slug: "jorge-perez",
    name: "Jorge Pérez",
    age: 50,
    dni: "22.111.333",
    phone: "+54 9 11 1111 3333",
    email: "jorge.p@gmail.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60",
    tags: ["Capilar"],
    notes: "",
    obraSocial: "OSDE 210",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "10",
    slug: "laura-silva",
    name: "Laura Silva",
    age: 29,
    dni: "39.222.111",
    phone: "+54 9 11 2222 1111",
    email: "laura.s@gmail.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
    tags: ["Peeling"],
    notes: "",
    lastVisitDate: subDays(new Date(), 10).toISOString(),
    obraSocial: "Galeno",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "11",
    slug: "fernando-torres",
    name: "Fernando Torres",
    age: 41,
    dni: "29.555.666",
    phone: "+54 9 11 5555 6666",
    email: "fer.t@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
    tags: ["Consulta"],
    notes: "",
    obraSocial: "Particular",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "12",
    slug: "patricia-diaz",
    name: "Patricia Díaz",
    age: 36,
    dni: "33.777.999",
    phone: "+54 9 11 7777 9999",
    email: "patri.d@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60",
    tags: ["Botox", "Relleno"],
    notes: "",
    lastVisitDate: subDays(new Date(), 2).toISOString(),
    obraSocial: "OSDE 410",
    visits: [],
    photos: [],
    cases: [],
    records: []
  },
  {
    id: "13",
    slug: "esteban-quito",
    name: "Esteban Quito",
    age: 25,
    dni: "41.111.111",
    phone: "+54 9 11 1111 1111",
    email: "esteban.q@gmail.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
    tags: ["Acne"],
    notes: "",
    obraSocial: "IOMA",
    visits: [],
    photos: [],
    cases: [],
    records: []
  }
];
