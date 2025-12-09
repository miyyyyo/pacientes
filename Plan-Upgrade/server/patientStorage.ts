import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

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
  photoBefore: Photo;
  photoAfter: Photo;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: "document" | "note" | "prescription";
  content?: string;
}

export interface Patient {
  id: string;
  slug: string;
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
  birthDate?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'patients');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Initialize directories on module load
ensureDirectories();

export class PatientStorage {
  private patientsFile: string;

  constructor() {
    this.patientsFile = path.join(DATA_DIR, 'patients.json');
  }

  // Read all patients from JSON file
  async getAllPatients(): Promise<Patient[]> {
    try {
      const data = await fs.readFile(this.patientsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Save all patients to JSON file
  private async saveAllPatients(patients: Patient[]): Promise<void> {
    const data = JSON.stringify(patients, null, 2);
    await fs.writeFile(this.patientsFile, data, 'utf-8');
  }

  // Get a single patient by ID or slug
  async getPatient(idOrSlug: string): Promise<Patient | undefined> {
    const patients = await this.getAllPatients();
    return patients.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  // Create a new patient
  async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    const patients = await this.getAllPatients();
    const newPatient: Patient = {
      ...patientData,
      id: randomUUID(),
    };
    patients.unshift(newPatient);
    await this.saveAllPatients(patients);
    
    // Create patient's upload directory
    const patientDir = path.join(UPLOADS_DIR, newPatient.id);
    await fs.mkdir(patientDir, { recursive: true });
    
    return newPatient;
  }

  // Update an existing patient
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const patients = await this.getAllPatients();
    const index = patients.findIndex(p => p.id === id);
    
    if (index === -1) {
      return undefined;
    }

    patients[index] = { ...patients[index], ...updates };
    await this.saveAllPatients(patients);
    return patients[index];
  }

  // Add a visit to a patient
  async addVisit(patientId: string, visit: Omit<Visit, 'id'>): Promise<Patient | undefined> {
    const patients = await this.getAllPatients();
    const index = patients.findIndex(p => p.id === patientId);
    
    if (index === -1) {
      return undefined;
    }

    const newVisit: Visit = {
      ...visit,
      id: randomUUID(),
    };

    patients[index].visits = [newVisit, ...patients[index].visits];
    patients[index].lastVisitDate = newVisit.date;
    
    await this.saveAllPatients(patients);
    return patients[index];
  }

  // Update a visit
  async updateVisit(patientId: string, visitId: string, updates: Partial<Visit>): Promise<Patient | undefined> {
    const patients = await this.getAllPatients();
    const patientIndex = patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      return undefined;
    }

    const visitIndex = patients[patientIndex].visits.findIndex(v => v.id === visitId);
    
    if (visitIndex === -1) {
      return undefined;
    }

    patients[patientIndex].visits[visitIndex] = {
      ...patients[patientIndex].visits[visitIndex],
      ...updates
    };
    
    await this.saveAllPatients(patients);
    return patients[patientIndex];
  }

  // Delete a patient
  async deletePatient(id: string): Promise<boolean> {
    const patients = await this.getAllPatients();
    const filteredPatients = patients.filter(p => p.id !== id);
    
    if (filteredPatients.length === patients.length) {
      return false; // Patient not found
    }

    await this.saveAllPatients(filteredPatients);
    
    // Note: Patient upload directory is preserved for data retention
    // To enable cleanup, uncomment the following lines:
    // const patientDir = path.join(UPLOADS_DIR, id);
    // await fs.rm(patientDir, { recursive: true, force: true });
    
    return true;
  }

  // Get patient's upload directory
  getPatientUploadDir(patientId: string): string {
    return path.join(UPLOADS_DIR, patientId);
  }
}

export const patientStorage = new PatientStorage();
