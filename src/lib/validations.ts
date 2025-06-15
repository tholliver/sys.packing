import { z } from "zod/v4"

export const PackageStatuses = ["pending", "in_transit", "delivered", "failed"] as const;
export type PackageStatus = typeof PackageStatuses[number];

export const packageSchema = z.object({
    description: z.string().min(1, "Descripción requerida"),
    senderFullName: z.string().min(1, "Nombre del remitente requerido"),
    senderCINIT: z.string().optional(),
    recipientFullName: z.string().min(1, "Nombre del destinatario requerido"),
    recipientCINIT: z.string().optional(),
    originPlace: z.string().optional(),
    phoneSender: z.string().optional(),
    phoneRecipient: z.string().optional(),
    senderPhone: z.string().optional(),
    recipientPhone: z.string().optional(),
    officeSenderAddress: z.string().min(1, "Dirección de oficina remitente requerida"),
    officeRecipientAddress: z.string().min(1, "Dirección de oficina destinatario requerida"),
    weight: z.string()
        .refine((val) => {
            if (val === "") return true; // Allow empty
            const num = Number(val);
            return !isNaN(num) && num > 0;
        }, "Weight must be a positive number"),
    quantity: z.string()
        .refine((val) => {
            if (val === "") return true; // Allow empty
            const num = Number(val);
            return !isNaN(num) && num > 0 && Number.isInteger(num);
        }, "Quantity must be a positive integer"),
    packageType: z.enum(["standard", "express", "fragile", "documents"]),
    priority: z.enum(["standard", "high", "urgent"]),
    isFragile: z.boolean(),
    declaredValue: z.string().optional(),
    totalCost: z.string().min(1, "Costo total requerido"),
    isPaid: z.boolean(),
    deliveryNotes: z.string().optional(),
})

export type PackageFormData = z.infer<typeof packageSchema>

export const updatePackageStatusSchema = z.object({
    status: z.enum(["pending", "in_transit", "delivered", "failed"]),
    notes: z.string().max(200, "Las notas son demasiado largas").optional(),
})

export const packageFilterSchema = z.object({
    status: z.enum(["all", "pending", "in_transit", "delivered", "failed"]).default("all"),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    search: z.string().optional(),
})

export type CreatePackageInput = z.infer<typeof packageSchema>
export type UpdatePackageStatusInput = z.infer<typeof updatePackageStatusSchema>
export type PackageFilterInput = z.infer<typeof packageFilterSchema>
