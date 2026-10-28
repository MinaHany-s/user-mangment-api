import { z } from "zod";

const userFields = {
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Email must be valid").toLowerCase(),
  age: z.number().min(1, "Age must be at least 1"),
  phone: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]),
  avatar: z.string().trim().url("Avatar must be a valid URL").optional(),
};

export const createUserSchema = z
  .object({
    ...userFields,
    status: userFields.status.default("active"),
  })
  .strict();

export const updateUserSchema = z
  .object(userFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const userIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID");

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    sortBy: z.enum(["createdAt", "firstName", "email"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
