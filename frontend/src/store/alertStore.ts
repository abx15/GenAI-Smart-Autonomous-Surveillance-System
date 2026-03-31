import { create } from 'zustand';

interface Alert {
  id: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  cameraId: string;
  timestamp: string;
  trackId: number;
  read: boolean;
}

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) => set((state) => ({
    alerts: [{ ...alert, read: false }, ...state.alerts].slice(0, 50),
    unreadCount: state.unreadCount + 1,
  })),
  markRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllRead: () => set((state) => ({
    alerts: state.alerts.map(a => ({ ...a, read: true })),
    unreadCount: 0,
  })),
  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));
