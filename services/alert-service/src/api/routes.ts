import { FastifyInstance } from 'fastify';
import { Alert } from '../models/Alert';
import { alertHistory } from '../services/alertHistory';

export async function alertRoutes(app: FastifyInstance) {

  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'alert-service', timestamp: new Date().toISOString() }
  }));

  app.get('/alerts/history', async (req) => {
    const { limit = 50 } = req.query as any;
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(parseInt(limit)).lean();
    return { success: true, data: alerts };
  });

  app.get('/alerts/unacknowledged', async () => {
    const alerts = await Alert.find({ acknowledged: false }).sort({ createdAt: -1 }).lean();
    return { success: true, data: alerts, count: alerts.length };
  });

  app.put('/alerts/:alertId/acknowledge', async (req, reply) => {
    const { alertId } = req.params as any;
    const alert = await Alert.findOneAndUpdate(
      { alertId },
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Alert not found' });
    return { success: true, data: alert, message: 'Alert acknowledged' };
  });

  app.get('/stats/live', async (req) => {
    const io = (app as any).io;
    const alertsNsp = io?.of('/alerts');
    const connectedSockets = await alertsNsp?.fetchSockets();
    return {
      success: true,
      data: {
        connectedClients: connectedSockets?.length || 0,
        recentAlerts: alertHistory.getLast(5).length,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
