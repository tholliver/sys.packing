//import { verifySession } from "@/auth/dal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Send, Inbox, Clock } from "lucide-react"
import { type DashboardStats, type RecentPackage } from "@/db/queries"
import type { Session } from "@/auth/auth-client"
import { statusLabels, type Status } from "@/types"
import type { Package as PackageModel } from "@/db/schema"
import { format } from "@formkit/tempo"

interface DashboardPageProps {
    session: Session
    recentPackages: PackageModel[]
    stats: DashboardStats
}

export default function DashboardPage({ session, stats, recentPackages }: DashboardPageProps) {
    const statCards = [
        {
            title: "Paquetes Enviados",
            value: stats.totalPackages,
            icon: Send,
            description: "Total de paquetes enviados",
        },
        {
            title: "Paquetes Recibidos",
            value: stats.deliveredPackages,
            icon: Inbox,
            description: "Total de paquetes recibidos",
        },
        {
            title: "Pendientes",
            value: stats.pendingPackages,
            icon: Clock,
            description: "Esperando procesamiento",
        },
        {
            title: "En Tránsito",
            value: stats.inTransitPackages,
            icon: Package,
            description: "Actualmente en envío",
        },
        {
            title: "Total recaudado",
            value: stats.totalRevenue,
            icon: Package,
            description: "",
        },
        {
            title: "Total recaudado (pagado)",
            value: stats.paidRevenue,
            icon: Package,
            description: "",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Panel Principal</h1>
                <p className="text-muted-foreground">Bienvenido de vuelta, {session.user.name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Recent Packages */}
            <Card>
                <CardHeader>
                    <CardTitle>Paquetes Recientes</CardTitle>
                    <CardDescription>Tus últimas actividades de paquetes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentPackages.map((pkg) => (
                            <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium">{pkg.description?.slice(10)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {`Para: ${pkg.recipientFullName} - De: ${pkg.senderFullName}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{pkg.trackingNumber}</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.status === "delivered"
                                            ? "bg-green-100 text-green-800"
                                            : pkg.status === "in_transit"
                                                ? "bg-blue-100 text-blue-800"
                                                : pkg.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {statusLabels[pkg.status as Status]}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">{format(pkg.createdAt, "short")}</p>
                                </div>
                            </div>
                        ))}
                        {recentPackages.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                Aún no tienes paquetes. ¡Comienza enviando tu primer paquete!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
