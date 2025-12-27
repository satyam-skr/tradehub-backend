import { z } from "zod"


const BaseOrderSchema = z.object({
    symbol: z.string().trim().min(1),
    side: z.enum(["BUY", "SELL"]),
    type: z.enum(["LIMIT", "MARKET"]),
    price: z.number().positive().optional(),
    quantity: z.number().positive(),
});

const OrderWithPriceRules = BaseOrderSchema.superRefine((data, ctx) => {
    if (data.type === "LIMIT" && data.price === undefined) {
        ctx.addIssue({
            path: ["price"],
            message: "Price is required for LIMIT orders",
            code: z.ZodIssueCode.custom,
        });
    }

    if (data.type === "MARKET" && data.price !== undefined) {
        ctx.addIssue({
            path: ["price"],
            message: "Price must not be provided for MARKET orders",
            code: z.ZodIssueCode.custom,
        });
    }
});

export const placeOrderSchema = OrderWithPriceRules;
export type PlaceOrderType = z.infer<typeof placeOrderSchema>;

export const orderCreateSchema = OrderWithPriceRules.safeExtend({
    userId: z.string(),
    filledQuantity: z.number().default(0),
    status: z.enum(["OPEN", "PARTIAL", "FILLED", "CANCELLED"]).default("OPEN"),
});


export type OrderCreateType = z.infer<typeof orderCreateSchema>;
