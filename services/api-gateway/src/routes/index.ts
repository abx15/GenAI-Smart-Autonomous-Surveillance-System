import { FastifyInstance } from 'fastify';
import { validateEnv } from '../config/env';

export async function proxyRoutes(app: FastifyInstance) {
  const env = validateEnv();

  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() }
  }));

  // Auth routes (no auth required)
  app.all('/auth/*', async (req, reply) => {
    const target = env.AUTH_SERVICE_URL + req.url.replace('/auth', '');
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers as any,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  // Event routes
  app.all('/events/*', async (req, reply) => {
    const target = env.EVENT_SERVICE_URL + req.url;
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers as any,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  // Alert routes
  app.all('/alerts/*', async (req, reply) => {
    const target = env.ALERT_SERVICE_URL + req.url;
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers as any,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });

  // AI routes
  app.all('/ai/*', async (req, reply) => {
    const target = env.GENAI_SERVICE_URL + req.url;
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers as any,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    return reply.status(response.status).send(data);
  });
}
