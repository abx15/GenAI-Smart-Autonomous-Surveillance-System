import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert {
  alertId: string;
  eventId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  cameraId: string;
  timestamp: string;
  trackId?: string;
  acknowledged: boolean;
}

export interface IAlertDocument extends IAlert, Document {}

const AlertSchema = new Schema<IAlertDocument>({
  alertId: { type: String, required: true, unique: true },
  eventId: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
  type: { type: String, required: true },
  cameraId: { type: String, required: true },
  timestamp: { type: String, required: true },
  trackId: { type: String },
  acknowledged: { type: Boolean, default: false }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes per requirements
AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ cameraId: 1 });
AlertSchema.index({ acknowledged: 1 });

export const Alert = mongoose.model<IAlertDocument>('Alert', AlertSchema);
