import { Patient, Visit } from "./mockData";

const API_BASE = "/api";

export const api = {
  // Patient operations
  async getAllPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE}/patients`);
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    return response.json();
  },

  async getPatient(id: string): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient');
    }
    return response.json();
  },

  async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      throw new Error('Failed to create patient');
    }
    return response.json();
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update patient');
    }
    return response.json();
  },

  async deletePatient(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete patient');
    }
  },

  // Visit operations
  async addVisit(patientId: string, visit: Omit<Visit, 'id'>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients/${patientId}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visit),
    });
    if (!response.ok) {
      throw new Error('Failed to add visit');
    }
    return response.json();
  },

  async updateVisit(patientId: string, visitId: string, updates: Partial<Visit>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients/${patientId}/visits/${visitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update visit');
    }
    return response.json();
  },

  // File upload
  async uploadPhotos(patientId: string, files: File[]): Promise<{ files: Array<{ filename: string; path: string; size: number; mimetype: string }> }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await fetch(`${API_BASE}/patients/${patientId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload photos');
    }
    return response.json();
  },
};
