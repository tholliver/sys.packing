import { relations, sql } from "drizzle-orm";
import { pgTable, timestamp, text, pgSchema, boolean, integer, pgEnum, decimal } from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth')

export const user = authSchema.table("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    role: text('role'),
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires')
});

export const session = authSchema.table("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by')
});

export const account = authSchema.table("account", {
    id: text("id").primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const verification = authSchema.table("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at')
});

export type SelectUser = typeof user.$inferSelect

// ----------------------  PACKING SCHEMAS  --------------------------
export const statusEnum = pgEnum("status", ["pending", "in_transit", "delivered", "failed"])

// Paquetes (versión extendida)
export const packages = pgTable('packages', {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    description: text("description"),
    status: text("status").notNull().default("pending"),
    trackingNumber: text("tracking_number")
        .unique()
        .notNull()
        .default(sql`'PKG-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))`),

    // Datos del remitente
    senderFullName: text("sender_full_name").notNull(),
    senderCINIT: text("sender_cinit"),
    senderPhone: text("sender_phone"),

    // Datos del destinatario
    recipientFullName: text("recipient_full_name").notNull(),
    recipientCINIT: text("recipient_cinit"),
    recipientPhone: text("recipient_phone"),

    // Sender/Reciver Ofices 
    officeSenderAddress: text("of_sender_address").notNull(),
    officeRecipientAddress: text("of_recipient_address").notNull(),

    // Características del paquete
    weight: decimal("weight", { precision: 8, scale: 3 }).notNull().default("1"), // kg
    quantity: integer("quantity"), // cm

    // Tipo y características especiales
    packageType: text("package_type").notNull().default("standard"),
    priority: text("priority").notNull().default("standard"),
    isFragile: boolean("is_fragile").notNull().default(false),

    // Valor y seguro
    declaredValue: decimal("declared_value", { precision: 10, scale: 2 }),
    //insuranceValue: decimal("insurance_value", { precision: 10, scale: 2 }),

    // Costos y fechas
    //shippingCost: decimal("shipping_cost", { precision: 8, scale: 2 }).notNull(),
    //insuranceCost: decimal("insurance_cost", { precision: 8, scale: 2 }).default(sql`0`),
    totalCost: decimal("total_cost", { precision: 8, scale: 2 }).notNull(),
    isPaid: boolean("is_paid").notNull().default(false),

    //estimatedDeliveryDate: timestamp("estimated_delivery_date", { withTimezone: true }),
    //actualDeliveryDate: timestamp("actual_delivery_date", { withTimezone: true }),

    // Entrega
    //deliverySignature: text("delivery_signature"),
    //deliveryPhoto: text("delivery_photo_url"),
    deliveryNotes: text("delivery_notes"),
    deliveredBy: text("delivered_by").references(() => user.id),

    // Auditoría
    createdBy: text("created_by").references(() => user.id).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    //statusCheck: check('status_check', sql`${table.status} IN ('pending', 'in_transit', 'delivered', 'failed')`)
}));

// Package history table
export const packageHistory = pgTable("package_history", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    packageId: text("package_id")
        .references(() => packages.id, { onDelete: "cascade" })
        .notNull(),
    status: statusEnum("status").notNull(),
    notes: text("notes"),
    changedBy: text("changed_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(user, ({ many }) => ({
    createdPackages: many(packages),
    packageHistoryChanges: many(packageHistory),
}))

export const packagesRelations = relations(packages, ({ one, many }) => ({
    createdByUser: one(user, {
        fields: [packages.createdBy],
        references: [user.id],
    }),
    history: many(packageHistory),
}))

export const packageHistoryRelations = relations(packageHistory, ({ one }) => ({
    package: one(packages, {
        fields: [packageHistory.packageId],
        references: [packages.id],
    }),
    changedByUser: one(user, {
        fields: [packageHistory.changedBy],
        references: [user.id],
    }),
}))

// Types
export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
export type Package = typeof packages.$inferSelect
export type NewPackage = typeof packages.$inferInsert
export type PackageHistory = typeof packageHistory.$inferSelect
export type NewPackageHistory = typeof packageHistory.$inferInsert