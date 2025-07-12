import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { authenticateJWT } from '../middleware/auth.js';
import Upload from '../models/Upload.js';
import { deleteUpload } from '../controllers/uploadController.js';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Simple in-memory cache for summaries keyed by hash of JSON data
const summaryCache = new Map();

router.post('/', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file buffer to JSON
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Compute hash of JSON data for caching
    const hash = crypto.createHash('sha256').update(JSON.stringify(jsonData)).digest('hex');

    // Check cache for existing summary
    if (summaryCache.has(hash)) {
      const cachedSummary = summaryCache.get(hash);

      // Save upload with cached summary
      const newUpload = new Upload({
        userId: req.user.id,
        filename: req.file.originalname,
        data: jsonData,
        summary: cachedSummary,
      });

      await newUpload.save();
      return res.status(201).json({ upload: newUpload, cached: true });
    }

    // Save JSON data to temp file for Python script
    const tempJsonPath = path.join(__dirname, '../../temp_upload.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(jsonData), 'utf-8');

    // Call local Python script to generate summary without OpenAI API
    const pythonScriptPath = path.join(__dirname, '../python_scripts/excel_summary_local.py');

    execFile('python', [pythonScriptPath, tempJsonPath], async (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        return res.status(500).json({ message: 'Error generating summary' });
      }
      if (stderr) {
        console.error('Python script stderr:', stderr);
      }
      const summary = stdout.trim();

      // Cache the summary
      summaryCache.set(hash, summary);

      // Save upload with summary
      const newUpload = new Upload({
        userId: req.user.id,
        filename: req.file.originalname,
        data: jsonData,
        summary,
      });

      try {
        await newUpload.save();
        // Delete temp file
        fs.unlinkSync(tempJsonPath);
        res.status(201).json({ upload: newUpload, cached: false });
      } catch (saveErr) {
        console.error('Error saving upload:', saveErr);
        res.status(500).json({ message: 'Error saving upload with summary' });
      }
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

router.get('/history', authenticateJWT, async (req, res) => {
  try {
    let uploads;
    if (req.user.role === 'admin') {
      uploads = await Upload.find().populate('userId', 'username email').sort({ createdAt: -1 });
    } else {
      uploads = await Upload.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(uploads);
  } catch (err) {
    console.error('Error fetching upload history:', err);
    res.status(500).json({ message: 'Server error fetching upload history' });
  }
});

router.delete('/:id', authenticateJWT, deleteUpload);

export default router;
