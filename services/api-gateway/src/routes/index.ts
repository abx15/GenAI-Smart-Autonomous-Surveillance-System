import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import proxyRoutes from './proxy';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Register health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'api-gateway' };
  });

  // Register all proxy routes
  fastify.register(proxyRoutes);
}
