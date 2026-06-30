import { Queue } from "bullmq";
import { env } from "@/lib/validators/env";

export interface NotificationJobPayload {
  to: string;
  subject: string;
  body: string;
}

/** Use connection options (not a Redis instance) so BullMQ and ioredis share one type path. */
export const notificationQueue = new Queue<NotificationJobPayload>("notifications", {
  connection: {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null
  }
});
