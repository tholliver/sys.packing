import { getAdminStats, getRecentPackagesByOffice } from "@/db/queries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url, params, request }) => {
    try {
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        //const adminStats = await getAdminStats()
        const offset = (page - 1) * limit;
        const packages = await getRecentPackagesByOffice()
        const total = packages.length;
        const totalPages = Math.ceil(total / limit);

        return new Response(
            JSON.stringify({
                data: packages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            },),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        const id = params.id;
        console.error("Error on quering all stats:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to process stats",
                message: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        )
    }
};