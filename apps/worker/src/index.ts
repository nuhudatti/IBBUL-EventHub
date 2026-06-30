import { Worker } from "bullmq";
import { processNotification } from "./processors/notification.processor";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const worker = new Worker("notifications", processNotification, {
  connection: { url: redisUrl, maxRetriesPerRequest: null }
});

worker.on("ready", () => {
  console.log("NEXUS worker ready.");
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id ?? "unknown"} failed`, err);
});
