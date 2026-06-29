import { z } from "zod";
import { dateTimeInput } from "@/lib/validators/datetime";

export const listEventsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  search: z.string().optional(),
  /** When set, only events involved in an unresolved conflict log are returned. */
  conflict: z.enum(["1"]).optional()
});

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(160),
    description: z.string().trim().min(10, "Description must be at least 10 characters."),
    type: z.enum(["SEMINAR", "WORKSHOP", "CONFERENCE", "SPORTS", "CULTURAL", "MEETING", "OTHER"]),
    visibility: z.enum(["PUBLIC", "INTERNAL", "DEPARTMENT", "INVITE_ONLY"]).default("INTERNAL"),
    venueId: z.string().min(1, "Venue is required."),
    departmentId: z.string().min(1, "Department is required."),
    categoryId: z.string().min(1).optional(),
    approvalLevel: z.enum(["DEPARTMENT", "FACULTY", "UNIVERSITY"]).optional(),
    startTime: dateTimeInput,
    endTime: dateTimeInput
  })
  .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"]
  });

export const reviewEventSchema = z.object({
  reason: z.string().min(3).max(500).optional()
});

export const bulkEventIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50)
});

export const bulkRejectSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
  reason: z.string().min(3).max(500)
});

const eventStatusEnum = z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

export const patchEventSchema = z
  .object({
    status: eventStatusEnum.optional(),
    startTime: dateTimeInput.optional(),
    endTime: dateTimeInput.optional(),
    venueId: z.string().min(1).optional(),
    departmentId: z.string().min(1).optional(),
    rejectionReason: z.string().min(3).max(500).optional()
  })
  .refine(
    (v) =>
      v.status !== undefined ||
      v.startTime !== undefined ||
      v.endTime !== undefined ||
      v.venueId !== undefined ||
      v.departmentId !== undefined,
    {
      message: "At least one field is required.",
      path: ["status"]
    }
  )
  .refine(
    (v) => {
      if (v.startTime && v.endTime) {
        return new Date(v.endTime) > new Date(v.startTime);
      }
      return true;
    },
    { message: "End time must be after start time.", path: ["endTime"] }
  )
  .refine((v) => (v.status === "REJECTED" ? Boolean(v.rejectionReason) : true), {
    message: "Rejection reason is required when status is REJECTED.",
    path: ["rejectionReason"]
  });
