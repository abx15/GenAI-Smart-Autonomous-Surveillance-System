import mongoose, { Schema, Document } from 'mongoose';

export interface IZone extends Document {
  zoneId: string;
  name: string;
  cameraId: string;
  coordinates: number[][];
  type: 'restricted' | 'entry' | 'monitoring';
  active: boolean;
  description?: string;
}

const ZoneSchema = new Schema<IZone>({
  zoneId: { type: String, default: () => crypto.randomUUID(), unique: true },
  name: { type: String, required: true },
  cameraId: { type: String, required: true },
  coordinates: { type: [[Number]], required: true },
  type: { type: String, enum: ['restricted','entry','monitoring'], required: true },
  active: { type: Boolean, default: true },
  description: String,
}, { timestamps: true });

ZoneSchema.index({ cameraId: 1 });

export const Zone = mongoose.model<IZone>('Zone', ZoneSchema);
