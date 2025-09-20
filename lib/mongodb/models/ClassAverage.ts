import mongoose from 'mongoose';

export interface IClassAverage {
  classId: string;
  className: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  averageScore: number;
  totalStudents: number;
  totalAssessments: number;
  lastUpdated: Date;
  calculatedBy: string;
}

const ClassAverageSchema = new mongoose.Schema<IClassAverage>({
  classId: {
    type: String,
    required: true,
    index: true
  },
  className: {
    type: String,
    required: true
  },
  schoolId: {
    type: String,
    required: true,
    index: true
  },
  schoolName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  averageScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalStudents: {
    type: Number,
    required: true,
    min: 0
  },
  totalAssessments: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  calculatedBy: {
    type: String,
    required: true,
    enum: ['edge-function', 'manual', 'scheduled']
  }
}, {
  timestamps: true,
  collection: 'class_averages'
});

// Create compound indexes for efficient queries
ClassAverageSchema.index({ classId: 1, subject: 1 }, { unique: true });
ClassAverageSchema.index({ schoolId: 1, subject: 1 });
ClassAverageSchema.index({ lastUpdated: -1 });

// Create the model
const ClassAverage = mongoose.models.ClassAverage || mongoose.model<IClassAverage>('ClassAverage', ClassAverageSchema);

export default ClassAverage;