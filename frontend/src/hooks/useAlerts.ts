import { useEffect } from "react";
import { socketService } from "../lib/socket";
import { useAlertStore } from "../store/alertStore";

export const useAlerts = (token: string | null) => {
  const { addAlert, alerts, unreadCount, markRead, markAllRead } = useAlertStore();

  useEffect(() => {
    if (!token) return;

    socketService.connect(token);

    if (!socketService.socket) return;

    socketService.socket.on("alert", (alert) => {
      addAlert(alert);
    });

    socketService.socket.on("critical_alert", (alert) => {
      addAlert(alert);
      
      if (alert.severity === "critical") {
        console.log(`CRITICAL ALERT: ${alert.message}`);
      }

      // Play audio beep for critical alerts
      try {
        const audio = new Audio("/audio/alert-beep.mp3");
        audio.play().catch((e) => console.error("Audio playback error:", e));
      } catch (err) {
        console.error("Critical alert sound failed:", err);
      }
    });

    return () => {
      socketService.socket?.off("alert");
      socketService.socket?.off("critical_alert");
    };
  }, [token, addAlert]);

  return {
    alerts,
    unreadCount,
    markRead,
    markAllRead,
    criticalAlerts: alerts.filter((a) => a.severity === "critical"),
  };
};
