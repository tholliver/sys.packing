import type { APIRoute } from "astro"
import { requireAuth } from "@/auth/dal"
import { db } from "@/db"
import { updatePackageStatusSchema } from "@/lib/validations"
import { eq, sql, and, or } from "drizzle-orm"
import { packageHistory, packages } from "@/db/schema"
import { auth } from "@/auth"

export const PATCH: APIRoute = async ({ request, params }) => {
    try {
        //const session = await requireAuth()
        const session = await auth.api.getSession({ headers: request.headers, })
        const body = await request.json()
        const validatedData = updatePackageStatusSchema.parse(body)

        if (!session)
            return new Response(
                JSON.stringify({ error: "Access denied" }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

        // Check if package exists and user has permission
        const packageToUpdate = await db.select().from(packages)
            .where(
                and(
                    eq(packages.id, params.id!),
                    or(
                        eq(packages.senderId, session.user.id),
                        eq(packages.recipientId, session.user.id),
                    )
                )
            );

        if (
            packageToUpdate.length === 0) {
            return new Response(
                JSON.stringify({ error: "Package not found or access denied" }),
                {
                    status: 404,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
        }

        // Update package status
        const updatedPackages = await db.update(packages)
            .set({ status: validatedData.status })
            .where(eq(packages.id, params.id!))
            .returning()

        // Add to history
        await db.insert(packageHistory).values({
            packageId: params.id!,
            status: validatedData.status,
            notes: validatedData.notes || null,
            changedBy: session.user.id
        })

        return new Response(
            JSON.stringify(updatedPackages[0]),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
    } catch (error) {
        console.error("Error updating package status:", error)
        return new Response(
            JSON.stringify({ error: "Failed to update package status" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
    }
}