import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "customer", "farmer"]);

export type UserRole = z.infer<typeof userRoleSchema>;

export const meResponseSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    role: userRoleSchema,
  }),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

