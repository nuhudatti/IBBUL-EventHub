import { Queue } from "bullmq";
import { redis } from "@/lib/redis/client";

export interface NotificationJobPayload {
  to: string;
  subject: string;
  body: string;
}

export const notificationQueue = new Queue<NotificationJobPayload>("notifications", {
  connection: redis
});
