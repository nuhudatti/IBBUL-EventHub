import type { Job } from "bullmq";

export interface NotificationJobPayload {
  to: string;
  subject: string;
  body: string;
}

/**
 * Processes asynchronous notification jobs in the worker process.
 */
export async function processNotification(job: Job<NotificationJobPayload>): Promise<void> {
  const { to, subject } = job.data;
  console.log(`Processing notification job for ${to} with subject "${subject}"`);
}
