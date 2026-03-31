import { Kafka } from 'kafkajs';
import { env, logger } from '../config/env';
import { rateLimiter } from '../services/rateLimiter';
import { alertBroadcaster } from '../services/alertBroadcaster';
import { Alert } from '../models/Alert';

const kafka = new Kafka({
  clientId: 'alert-service',
  brokers: env.KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'alert-service-group' });

export const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    logger.info('✅ Kafka Consumer connected successfully.');

    await consumer.subscribe({ topic: 'processed.events', fromBeginning: false });
    await consumer.subscribe({ topic: 'alerts.triggered', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;

          const event = JSON.parse(message.value.toString());
          logger.debug(`Received message from ${topic}`, event);

          // Rate limit check
          if (rateLimiter.shouldSend(event)) {
            // Broadcast
            const formattedAlert = alertBroadcaster.broadcast(event);

            // Save to DB
            try {
              await Alert.create(formattedAlert);
            } catch (dbErr) {
              logger.error('Failed to save alert to MongoDB', dbErr);
            }
          }
        } catch (err) {
          logger.error(`Error processing message from topic ${topic}:`, err);
        }
      },
    });
  } catch (error) {
    logger.error('❌ Failed to start Kafka consumer:', error);
    // Don't crash service
  }
};

export const stopKafkaConsumer = async () => {
  await consumer.disconnect();
};
