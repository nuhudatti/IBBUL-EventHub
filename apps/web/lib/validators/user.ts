import { z } from "zod";

export const userRoleUpdateSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "APPROVER", "USER", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional()
}).refine((v) => v.role !== undefined || v.status !== undefined, {
  message: "Role or status is required."
});

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "APPROVER", "USER", "VIEWER"]),
  facultyId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "PENDING"]).default("PENDING"),
  sendInvitation: z.boolean().default(true)
});

export const acceptInviteSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  password: z.string().min(8).max(128)
});

export const createVenueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(20).regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, dash or underscore."),
  capacity: z.coerce.number().int().positive().optional(),
  building: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional()
});
