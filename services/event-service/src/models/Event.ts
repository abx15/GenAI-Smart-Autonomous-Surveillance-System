import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  eventId: string;
  type: 'intrusion' | 'loitering' | 'zone_entry' | 'zone_exit' | 'unattended_object';
  severity: 'low' | 'medium' | 'high' | 'critical';
  personTrackId: number;
  cameraId: string;
  zoneId?: string;
  zoneName?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  rawDetections: any[];
  resolved: boolean;
  resolvedAt?: Date;
  description?: string;
}

const EventSchema = new Schema<IEvent>({
  eventId: { type: String, default: () => crypto.randomUUID(), unique: true },
  type: { type: String, enum: ['intrusion','loitering','zone_entry','zone_exit','unattended_object'], required: true },
  severity: { type: String, enum: ['low','medium','high','critical'], required: true },
  personTrackId: { type: Number, required: true },
  cameraId: { type: String, required: true },
  zoneId: String,
  zoneName: String,
  startTime: { type: Date, required: true, default: Date.now },
  endTime: Date,
  duration: Number,
  rawDetections: { type: Schema.Types.Mixed, default: [] },
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  description: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Indexes
EventSchema.index({ type: 1, startTime: -1 });
EventSchema.index({ cameraId: 1 });
EventSchema.index({ severity: 1 });
EventSchema.index({ startTime: -1 });
EventSchema.index({ resolved: 1 });
// TTL: delete events older than 30 days
EventSchema.index({ startTime: 1 }, { expireAfterSeconds: 2592000 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
