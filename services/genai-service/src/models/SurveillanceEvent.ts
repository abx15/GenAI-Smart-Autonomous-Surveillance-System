import mongoose, { Schema, Document } from 'mongoose';

// SurveillanceEvent from shared types/events.ts
export interface ISurveillanceEvent extends Document {
  id: string; // Map to MongoDB _id or a dedicated id field
  type: 'intrusion' | 'loitering' | 'zone_entry' | 'zone_exit' | 'unattended_object';
  personId?: string;
  zoneId: string;
  startTime: Date;
  endTime?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cameraId: string;
  description?: string;
}

const SurveillanceEventSchema = new Schema<ISurveillanceEvent>({
  id: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['intrusion', 'loitering', 'zone_entry', 'zone_exit', 'unattended_object'], 
    required: true, 
    index: true 
  },
  personId: { type: String },
  zoneId: { type: String, required: true, index: true },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    required: true, 
    index: true 
  },
  cameraId: { type: String, required: true, index: true },
  description: { type: String }
}, {
  collection: 'events', // Explicitly target the shared events collection
  timestamps: true
});

export const SurveillanceEvent = mongoose.model<ISurveillanceEvent>('SurveillanceEvent', SurveillanceEventSchema);
