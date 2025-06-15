import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { admin as adminPlugin } from "better-auth/plugins"
import * as schema from '@/db/schema'
import { ac, roles } from "@/auth/permissions"

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: { type: "string" }
        }
    },
    plugins: [
        adminPlugin({
            defaultRole: "USER",
            ac,
            roles
        }),
    ],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            ...schema,
            user: schema.user
        }
    })
})