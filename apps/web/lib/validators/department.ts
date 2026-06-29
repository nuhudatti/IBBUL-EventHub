import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(500).optional(),
  parentId: z.string().min(1).optional(),
  color: z.string().trim().max(32).optional()
});
