import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  shiftStart: Date;
  shiftEnd: Date;
  content: string; // Markdown content
  stats: {
    totalEvents: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    mostActiveCamera: string;
  };
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reportId: { type: String, required: true, unique: true },
  shiftStart: { type: Date, required: true, index: true },
  shiftEnd: { type: Date, required: true, index: true },
  content: { type: String, required: true },
  stats: {
    totalEvents: { type: Number, required: true },
    critical: { type: Number, required: true },
    high: { type: Number, required: true },
    medium: { type: Number, required: true },
    low: { type: Number, required: true },
    mostActiveCamera: { type: String, required: true }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);
