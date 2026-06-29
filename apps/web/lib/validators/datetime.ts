import { z } from "zod";

/** Accepts ISO strings and datetime-local values from HTML inputs. */
export const dateTimeInput = z
  .string()
  .min(1, "Date and time are required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date and time."
  })
  .transform((value) => new Date(value).toISOString());

export function firstZodFieldMessage(error: z.ZodError): string {
  const flattened = error.flatten();
  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages?.[0]) {
      return `${field}: ${messages[0]}`;
    }
  }
  return flattened.formErrors[0] ?? "Validation failed.";
}
