/**
 * Purpose: Defines core domain events across the entire surveillance pipeline
 */

// Core shape of an AI-detected object within the camera feed
export interface DetectionEvent {
  id: string; // Unique ID for this specific frame detection
  trackingId: string; // ID spanning multiple frames for the same object
  type: 'person' | 'bag' | 'unknown';
  bbox: { x: number; y: number; w: number; h: number }; // Bounding box
  confidence: number;
  timestamp: string; // ISO 8601
  zoneId?: string; // If crossing designated zone
  cameraId: string;
}

// Higher-order event triggered by processing DetectionEvents
export interface SurveillanceEvent {
  id: string;
  type: 'intrusion' | 'loitering' | 'zone_entry' | 'zone_exit' | 'unattended_object';
  personId?: string; // Correlates to trackingId
  zoneId: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  severity: 'low' | 'medium' | 'high' | 'critical';
  raw: DetectionEvent[]; // Source events forming this higher order event
}

// Actionable notification generated from severe SurveillanceEvents
export interface AlertPayload {
  eventId: string; // Refers to the SurveillanceEvent
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string; // ISO 8601
  cameraId: string;
}
