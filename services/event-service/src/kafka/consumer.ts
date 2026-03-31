import { Kafka, Consumer } from 'kafkajs';
import { logger } from '../../../../shared/utils/logger';
import { validateEnv } from '../config/env';
import { eventEngine } from '../services/eventEngine';

const env = validateEnv();

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(','),
});

let consumer: Consumer;

export async function startKafkaConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({
    topic: env.KAFKA_TOPIC_DETECTIONS,
    fromBeginning: false,
  });

  logger.info({ topic: env.KAFKA_TOPIC_DETECTIONS }, 'Kafka consumer subscribed');

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        if (!message.value) return;

        const detection = JSON.parse(message.value.toString());
        logger.debug({ trackId: detection.track_id }, 'Processing detection');

        await eventEngine.processDetection(detection);
        await consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);

      } catch (err) {
        logger.error({ err, offset: message.offset }, 'Failed to process detection message');
        // Don't rethrow — keep consuming
      }
    },
  });
}
