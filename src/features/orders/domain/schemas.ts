import { z } from "zod";

export const customerOrderListItemSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "packed", "shipped", "delivered", "cancelled"]),
  totalPrice: z.number(),
  cycleDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  createdAt: z.string(),
  box: z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
  }),
  boxVersion: z.object({
    id: z.string(),
    versionName: z.string(),
  }),
  subscription: z
    .object({
      id: z.string(),
      plan: z.object({
        id: z.string(),
        name: z.string(),
      }),
    })
    .nullable(),
  delivery: z
    .object({
      status: z.string(),
      trackingCode: z.string().nullable(),
    })
    .nullable(),
});

export const customerOrderListResponseSchema = z.object({
  items: z.array(customerOrderListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type CustomerOrderListItem = z.infer<typeof customerOrderListItemSchema>;
export type CustomerOrderListResponse = z.infer<typeof customerOrderListResponseSchema>;

const orderStatusEnum = z.enum(["pending", "packed", "shipped", "delivered", "cancelled"]);

export const customerOrderDetailSchema = z.object({
  id: z.string(),
  status: orderStatusEnum,
  totalPrice: z.number(),
  cycleDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  createdAt: z.string(),
  box: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
  boxVersion: z.object({
    id: z.string(),
    versionName: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable(),
  }),
  subscription: z
    .object({
      id: z.string(),
      status: z.string(),
      plan: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        deliveryFrequency: z.string(),
      }),
    })
    .nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      lineTotal: z.number(),
      product: z.object({
        id: z.string(),
        name: z.string(),
        unit: z.string().nullable(),
      }),
      farmer: z.object({
        id: z.string(),
        farmName: z.string(),
      }),
    }),
  ),
  delivery: z
    .object({
      deliveryStatus: z.string(),
      deliveryDriver: z.string().nullable(),
      trackingCode: z.string().nullable(),
      deliveredAt: z.string().nullable(),
    })
    .nullable(),
  payments: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      paymentMethod: z.string(),
      paymentStatus: z.string(),
      transactionReference: z.string().nullable(),
      paidAt: z.string().nullable(),
    }),
  ),
});

export type CustomerOrderDetail = z.infer<typeof customerOrderDetailSchema>;
