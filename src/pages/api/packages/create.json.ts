import { auth } from "@/auth";
import { db } from "@/db";
import { packageHistory, packages, type NewPackage, type Package } from "@/db/schema";
import { packageSchema, type PackageStatus } from "@/lib/validations";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const session = await auth.api.getSession({
            headers: request.headers
        });

        const validationResult = packageSchema.safeParse(body);

        if (!validationResult.success) {
            return new Response(JSON.stringify({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const validatedData = validationResult.data;

        const dbReadyData: NewPackage = {
            ...validatedData,
            declaredValue: validatedData.declaredValue,
            quantity: Number(validatedData.quantity ?? 1),
            createdBy: session?.user.id ?? 'Some user', // only if guaranteed to exist
        };

        const newPackages = await db
            .insert(packages)
            .values(dbReadyData)
            .returning()

        const newPackage: Package = newPackages[0];

        // Optionally insert into history
        await db.insert(packageHistory).values({
            packageId: newPackage.id,
            status: newPackage.status as PackageStatus,
            notes: "Paquete creado",
            changedBy: session?.user.id!,
        });

        return new Response(JSON.stringify(newPackage), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error in POST /packages:", error);

        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: error instanceof Error && error.message.includes('Permission denied') ? 403 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
