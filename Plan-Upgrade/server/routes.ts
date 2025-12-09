import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { patientStorage } from "./patientStorage";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import rateLimit from "express-rate-limit";

// Rate limiter for file access endpoints
const fileAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Configure multer for file uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const patientId = req.params.patientId || req.body.patientId;
      if (!patientId) {
        return cb(new Error('Patient ID is required in the request parameters or body'), '');
      }
      const uploadDir = patientStorage.getPatientUploadDir(patientId);
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Patient routes - prefix all routes with /api

  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await patientStorage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error getting patients:', error);
      res.status(500).json({ error: 'Failed to get patients' });
    }
  });

  // Get a specific patient
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await patientStorage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      console.error('Error getting patient:', error);
      res.status(500).json({ error: 'Failed to get patient' });
    }
  });

  // Create a new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const patient = await patientStorage.createPatient(req.body);
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Failed to create patient' });
    }
  });

  // Update a patient
  app.put("/api/patients/:id", async (req, res) => {
    try {
      const patient = await patientStorage.updatePatient(req.params.id, req.body);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ error: 'Failed to update patient' });
    }
  });

  // Delete a patient
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const success = await patientStorage.deletePatient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ error: 'Failed to delete patient' });
    }
  });

  // Add a visit to a patient
  app.post("/api/patients/:id/visits", async (req, res) => {
    try {
      const patient = await patientStorage.addVisit(req.params.id, req.body);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error adding visit:', error);
      res.status(500).json({ error: 'Failed to add visit' });
    }
  });

  // Update a visit
  app.put("/api/patients/:patientId/visits/:visitId", async (req, res) => {
    try {
      const patient = await patientStorage.updateVisit(
        req.params.patientId,
        req.params.visitId,
        req.body
      );
      if (!patient) {
        return res.status(404).json({ error: 'Patient or visit not found' });
      }
      res.json(patient);
    } catch (error) {
      console.error('Error updating visit:', error);
      res.status(500).json({ error: 'Failed to update visit' });
    }
  });

  // Upload photos for a patient
  app.post("/api/patients/:patientId/upload", upload.array('photos', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${req.params.patientId}/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', fileAccessLimiter, async (req, res, next) => {
    const uploadsPath = path.join(process.cwd(), 'data', 'uploads');
    const requestedPath = path.resolve(uploadsPath, req.path.substring(1));
    
    // Security check: ensure requested path is within uploads directory
    const relativePath = path.relative(uploadsPath, requestedPath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
      await fs.access(requestedPath);
      res.sendFile(requestedPath);
    } catch (error) {
      res.status(404).json({ error: 'File not found' });
    }
  });

  return httpServer;
}
