import { z } from "zod";

export const customerUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().nullable(),
  phone: z.string().min(1),
  imageUrl: z.string().nullable(),
  role: z.literal("customer"),
  createdAt: z.string().datetime(),
});

export const customerProfileResponseSchema = z.object({
  user: customerUserSchema,
});

export const customerAddressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  addressLine: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean(),
});

export const customerAddressListResponseSchema = z.object({
  items: z.array(customerAddressSchema),
});

export type CustomerProfileResponse = z.infer<typeof customerProfileResponseSchema>;
export type CustomerAddress = z.infer<typeof customerAddressSchema>;

export type UpdateCustomerProfileBody = {
  name?: string;
  phone?: string;
  email?: string | null;
  imageUrl?: string | null;
};

export type SaveCustomerAddressBody = {
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};
