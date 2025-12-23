import { z } from 'zod';

export const userRoles = ['ADMIN', 'MERCHANT', 'SALES_REP'] as const;
export const UserRoleSchema = z.enum(userRoles);

export const UserSchema = z.object({
  id: z.number(),
  commercialName: z.string(),
  phone: z.string(),
  city: z.string(),
  area: z.string(),
  businessType: z.string(),
  role: UserRoleSchema,
  walletBalance: z.number().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.coerce.date().nullable(),
  referredByRepId: z.number().nullable(),
  referralCode: z.string().nullable(),
  email:z.string(),
  notificationToken : z.string().nullable()
});

export const GetUserSchema = UserSchema;
export type GetUser = z.infer<typeof GetUserSchema>;

export const PostUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type PostUser = z.infer<typeof PostUserSchema>;

export const PutUserSchema = PostUserSchema.partial();
export type PutUser = z.infer<typeof PutUserSchema>;

export const LoginResponseSchema = z.object({
  user: GetUserSchema,
  token: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
