import mongoose, { Document } from 'mongoose';

export interface IResume extends Document {
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  path: string;
  uploadDate: Date;
  extractedText: string;
  textAnalysis: {
    wordCount: number;
    characterCount: number;
  };
  userId: mongoose.Types.ObjectId;
}

const resumeSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  extractedText: {
    type: String,
    required: true,
  },
  textAnalysis: {
    wordCount: {
      type: Number,
      required: true,
    },
    characterCount: {
      type: Number,
      required: true,
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Resume = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume; 