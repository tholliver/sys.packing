import { getAdminStats } from "@/db/queries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const adminStats = await getAdminStats()
        return new Response(
            JSON.stringify(adminStats),
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