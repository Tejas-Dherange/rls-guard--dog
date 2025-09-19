import mongoose, { Schema, Document } from 'mongoose';

// Interface for ClassAverage document
export interface IClassAverage extends Document {
  class_id: string;
  class_name: string;
  school_id: string;
  school_name: string;
  subject: string;
  average_score: number;
  total_students: number;
  assessment_period: string;
  calculated_at: Date;
}

// Schema for ClassAverage
const ClassAverageSchema = new Schema<IClassAverage>({
  class_id: {
    type: String,
    required: true,
    index: true,
  },
  class_name: {
    type: String,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
    index: true,
  },
  school_name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  average_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  total_students: {
    type: Number,
    required: true,
    min: 0,
  },
  assessment_period: {
    type: String,
    required: true,
  },
  calculated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
ClassAverageSchema.index({ class_id: 1, subject: 1, assessment_period: 1 });
ClassAverageSchema.index({ school_id: 1, subject: 1, assessment_period: 1 });

// Export the model
export const ClassAverage = mongoose.models.ClassAverage || mongoose.model<IClassAverage>('ClassAverage', ClassAverageSchema);

// Interface for Analytics document
export interface IAnalytics extends Document {
  school_id: string;
  period: string;
  metrics: {
    total_students: number;
    total_classes: number;
    average_performance: number;
    subject_averages: {
      subject: string;
      average: number;
    }[];
  };
  generated_at: Date;
}

// Schema for Analytics
const AnalyticsSchema = new Schema<IAnalytics>({
  school_id: {
    type: String,
    required: true,
    index: true,
  },
  period: {
    type: String,
    required: true,
  },
  metrics: {
    total_students: {
      type: Number,
      required: true,
    },
    total_classes: {
      type: Number,
      required: true,
    },
    average_performance: {
      type: Number,
      required: true,
    },
    subject_averages: [{
      subject: {
        type: String,
        required: true,
      },
      average: {
        type: Number,
        required: true,
      },
    }],
  },
  generated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Export the model
export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);