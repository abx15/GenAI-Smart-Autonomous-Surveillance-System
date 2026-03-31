export interface Alert {
  id: string;
  alertId: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  cameraId: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: any;
}

export interface SurveillanceEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  cameraId: string;
  tracks: any[];
  duration?: number;
  status: "resolved" | "unresolved";
}

export interface User {
  userId: string;
  username: string;
  role: "admin" | "operator" | "viewer";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
