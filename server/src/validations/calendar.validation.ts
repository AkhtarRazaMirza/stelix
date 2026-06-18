import { z } from "zod";

const isoDateTime = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)), {
    message: "Invalid date-time value",
  });

const attendeeList = z
  .array(z.string().trim().email())
  .max(50, "A maximum of 50 attendees is allowed")
  .refine(
    (emails) => new Set(emails.map((email) => email.toLowerCase())).size === emails.length,
    { message: "Duplicate attendees are not allowed" }
  );

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    description: z.string().max(8000).optional(),
    location: z.string().max(255).optional(),
    startTime: isoDateTime,
    endTime: isoDateTime,
    attendees: attendeeList.optional(),
  })
  .refine((data) => Date.parse(data.endTime) > Date.parse(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(8000).optional(),
    location: z.string().max(255).optional(),
    startTime: isoDateTime.optional(),
    endTime: isoDateTime.optional(),
    attendees: attendeeList.optional(),
  })
  .refine(
    (data) =>
      !(data.startTime && data.endTime) ||
      Date.parse(data.endTime) > Date.parse(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const inviteEventSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    description: z.string().max(8000).optional(),
    location: z.string().max(255).optional(),
    startTime: isoDateTime,
    endTime: isoDateTime,
    attendees: attendeeList.min(1, "At least one attendee is required"),
  })
  .refine((data) => Date.parse(data.endTime) > Date.parse(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const rescheduleEventSchema = z
  .object({
    eventId: z.string().trim().min(1),
    startTime: isoDateTime,
    endTime: isoDateTime,
  })
  .refine((data) => Date.parse(data.endTime) > Date.parse(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const eventIdParamSchema = z.object({
  eventId: z.string().trim().min(1).max(1024),
});

export const eventSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(500),
});

export const eventListQuerySchema = z.object({
  pageToken: z.string().min(1).max(2048).optional(),
});
