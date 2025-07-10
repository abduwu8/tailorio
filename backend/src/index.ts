import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Resume, { IResume } from './models/Resume';
import pdf from 'pdf-parse';
import passport from 'passport';
import authRoutes from './routes/auth';
import linkedinRoutes from './routes/linkedin';
import { requireAuth } from './middleware/auth';

// Import passport config
import './config/passport';

// Load environment variables before any other code
dotenv.config();

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath: string) {
  try {
    console.log('Reading file from:', filePath);
    const dataBuffer = fs.readFileSync(filePath);
    console.log('File read successfully, size:', dataBuffer.length);
    
    const data = await pdf(dataBuffer);
    console.log('PDF parsed successfully');
    const text = data.text;
    
    // Basic text analysis
    const wordCount = text.trim().split(/\s+/).length;
    const characterCount = text.length;

    console.log('Text extracted:', {
      wordCount,
      characterCount,
      textPreview: text.substring(0, 100) + '...'
    });

    return {
      text,
      analysis: {
        wordCount,
        characterCount
      }
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Verify required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://tailorio.onrender.com', 'https://puppet-frontend.onrender.com']
  : ['http://localhost:3000', 'http://localhost:5173'];

console.log('Allowed Origins:', allowedOrigins);
console.log('Current Environment:', process.env.NODE_ENV);

// Simple CORS configuration
app.use(cors({
  origin: true, // Allow all origins temporarily to debug
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Add request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Protected file access middleware
const protectedFileAccess = (req: Request, res: Response, next: NextFunction) => {
  // Check if there's a token in the query params
  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the token
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Serve uploads directory with protected access
app.use('/uploads', protectedFileAccess, express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/linkedin', linkedinRoutes);

// Protected Resume Routes
app.post('/api/upload-resume', requireAuth, upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.originalname);
    
    // Extract text from PDF
    const filePath = path.join(uploadsDir, req.file.filename);
    console.log('Extracting text from:', filePath);
    
    const { text, analysis } = await extractTextFromPDF(filePath);
    console.log('Text extraction completed');

    const resume = new Resume({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
      extractedText: text,
      textAnalysis: analysis,
      userId: (req.user as any)._id
    });

    await resume.save();
    console.log('Resume saved to database with ID:', resume._id);
    
    res.status(200).json({
      message: 'File uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        originalName: resume.originalName,
        path: resume.path,
        textAnalysis: resume.textAnalysis
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Get all resumes for the authenticated user
app.get('/api/resumes', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Fetching resumes for user:', (req.user as any)._id);
    const resumes = await Resume.find({ userId: (req.user as any)._id }).sort({ uploadDate: -1 });
    console.log('Found', resumes.length, 'resumes');
    const transformedResumes = resumes.map(resume => ({
      id: resume._id,
      fileName: resume.fileName,
      originalName: resume.originalName,
      path: resume.path,
      uploadDate: resume.uploadDate,
      extractedText: resume.extractedText,
      textAnalysis: resume.textAnalysis
    }));
    res.json(transformedResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Error fetching resumes' });
  }
});

// Get single resume by ID (only if it belongs to the authenticated user)
app.get('/api/resumes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Fetching resume with ID:', req.params.id);
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: (req.user as any)._id
    });
    
    if (!resume) {
      console.log('Resume not found:', req.params.id);
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    console.log('Resume found:', resume.originalName);
    // Transform _id to id in response
    res.json({
      id: resume._id,
      fileName: resume.fileName,
      originalName: resume.originalName,
      path: resume.path,
      uploadDate: resume.uploadDate,
      extractedText: resume.extractedText,
      textAnalysis: resume.textAnalysis
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Error fetching resume' });
  }
});

// Get extracted text for a resume (only if it belongs to the authenticated user)
app.get('/api/resumes/:id/text', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Fetching text for resume ID:', req.params.id);
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: (req.user as any)._id
    });
    
    if (!resume) {
      console.log('Resume not found:', req.params.id);
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    console.log('Sending text response for:', resume.originalName, {
      textLength: resume.extractedText.length,
      wordCount: resume.textAnalysis.wordCount
    });
    
    res.json({
      text: resume.extractedText,
      analysis: resume.textAnalysis
    });
  } catch (error) {
    console.error('Error fetching resume text:', error);
    res.status(500).json({ error: 'Error fetching resume text' });
  }
});

// Delete a resume
app.delete('/api/resumes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('Deleting resume with ID:', req.params.id);
    
    // Find the resume first to get the file name
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: (req.user as any)._id
    });

    if (!resume) {
      console.log('Resume not found:', req.params.id);
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete the file from the uploads directory
    const filePath = path.join(uploadsDir, resume.fileName);
    try {
      fs.unlinkSync(filePath);
      console.log('File deleted:', filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Resume.deleteOne({
      _id: req.params.id,
      userId: (req.user as any)._id
    });
    
    console.log('Resume deleted successfully');
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend static files
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuildPath));
}

// Catch-all route to serve the frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Don't serve frontend for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
      origin: req.get('origin'),
      allowedOrigins
    });
  }
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
}); 