import { alias } from 'drizzle-orm/pg-core'
import { db } from './index'
import { packages, user, type Package } from './schema'
import { eq, or, and, count, desc, sql, sum, getTableColumns } from 'drizzle-orm'

// Type definitions
interface DashboardStats {
    totalPackages: number;
    deliveredPackages: number;
    pendingPackages: number;
    inTransitPackages: number;
    totalRevenue: string | number;
    paidRevenue: string | number;
    deliveryRate: string | number;
}

interface RecentPackage {
    id: string
    sender_id: string
    recipient_id: string
    title: string
    trackingNumber: string
    status: string
    created_at: Date
    updated_at: Date
    // Add other package fields as needed
    sender_name: string
    recipient_name: string
}

export async function getAdminStats() {
    const totalUsers = await db.select({ count: count() }).from(user)
    const totalPackages = await db.select({ count: count() }).from(packages)
    const pendingPackages = await db
        .select({ count: count() })
        .from(packages)
        .where(eq(packages.status, "pending"))
    const deliveredPackages = await db
        .select({ count: count() })
        .from(packages)
        .where(eq(packages.status, "delivered"))

    return {
        totalUsers: totalUsers[0].count,
        totalPackages: totalPackages[0].count,
        pendingPackages: pendingPackages[0].count,
        deliveredPackages: deliveredPackages[0].count,
    }
}


export async function getGeneralStats() {
    const [totalPackages] = await db
        .select({ count: count() })
        .from(packages);

    const [deliveredPackages] = await db
        .select({ count: count() })
        .from(packages)
        .where(eq(packages.status, 'delivered'));

    const [pendingPackages] = await db
        .select({ count: count() })
        .from(packages)
        .where(eq(packages.status, 'pending'));

    const [inTransitPackages] = await db
        .select({ count: count() })
        .from(packages)
        .where(eq(packages.status, 'in_transit'));

    const [totalRevenue] = await db
        .select({
            total: sum(packages.totalCost),
            paid: sum(sql`CASE WHEN ${packages.isPaid} THEN ${packages.totalCost} ELSE 0 END`)
        })
        .from(packages);

    return {
        totalPackages: totalPackages.count,
        deliveredPackages: deliveredPackages.count,
        pendingPackages: pendingPackages.count,
        inTransitPackages: inTransitPackages.count,
        totalRevenue: totalRevenue.total || 0,
        paidRevenue: totalRevenue.paid || 0,
        deliveryRate: totalPackages.count > 0 ?
            (deliveredPackages.count / totalPackages.count * 100).toFixed(2) : 0
    };
}

async function getRecentPackages(userId: string): Promise<Package[]> {
    try {
        const recentPackages = await db
            .select({ ...getTableColumns(packages) })
            .from(packages)
            .leftJoin(user, eq(packages.createdBy, user.id))
            .where(eq(packages.createdBy, userId))
            .orderBy(desc(packages.createdAt))
            .limit(5)

        return recentPackages
    } catch (error) {
        console.error('Error fetching recent packages:', error)
        throw new Error('Failed to fetch recent packages')
    }
}

// Alternative approach for getRecentPackages with separate joins
/* async function getRecentPackagesAlt(userId: string): Promise<RecentPackage[]> {
    try {
        const senderAlias = alias(user, 'sender')
        const recipientAlias = alias(user, 'recipient')

        const recentPackages = await db
            .select({
                id: packages.id,
                sender_id: packages.senderId,
                recipient_id: packages.recipientId,
                status: packages.status,
                title: packages.title,
                trackingNumber: packages.trackingNumber,
                created_at: packages.createdAt,
                updated_at: packages.updatedAt,
                sender_name: sql<string>`sender.name`,
                recipient_name: sql<string>`recipient.name`
            })
            .from(packages)
            .leftJoin(senderAlias, eq(packages.senderId, senderAlias.id))
            .leftJoin(recipientAlias, eq(packages.recipientId, recipientAlias.id))
            .where(or(eq(packages.senderId, userId), eq(packages.recipientId, userId)))
            .orderBy(desc(packages.createdAt))
            .limit(5)

        return recentPackages
    } catch (error) {
        console.error('Error fetching recent packages:', error)
        throw new Error('Failed to fetch recent packages')
    }
}
 */
// More Drizzle-idiomatic approach using subqueries
/* async function getDashboardStatsOptimized(userId: string): Promise<DashboardStats> {
    try {
        const [sentCount] = await db
            .select({ count: count() })
            .from(packages)
            .where(eq(packages.senderId, userId))

        const [receivedCount] = await db
            .select({ count: count() })
            .from(packages)
            .where(eq(packages.recipientId, userId))

        const [pendingCount] = await db
            .select({ count: count() })
            .from(packages)
            .where(
                and(
                    or(eq(packages.senderId, userId), eq(packages.recipientId, userId)),
                    eq(packages.status, 'pending')
                )
            )

        const [inTransitCount] = await db
            .select({ count: count() })
            .from(packages)
            .where(
                and(
                    or(eq(packages.senderId, userId), eq(packages.recipientId, userId)),
                    eq(packages.status, 'in_transit')
                )
            )

        return {
            sent_count: sentCount.count,
            received_count: receivedCount.count,
            pending_count: pendingCount.count,
            in_transit_count: inTransitCount.count
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw new Error('Failed to fetch dashboard statistics')
    }
} */

export {
    // getDashboardStats,
    getRecentPackages,
    // getRecentPackagesAlt,
    // getDashboardStatsOptimized,
    type DashboardStats,
    type RecentPackage
}