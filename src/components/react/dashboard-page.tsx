//import { verifySession } from "@/auth/dal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Send, Inbox, Clock, DollarSign, CheckCircle, Italic, CalendarCheck, CalendarFold } from "lucide-react"
import { type DashboardStats, type RecentPackage } from "@/db/queries"
import type { Session } from "@/auth/auth-client"
import { statusLabels } from "@/types"
import type { Package as PackageModel } from "@/db/schema"
import { format } from "@formkit/tempo"
import type { PackageStatus } from "@/lib/validations"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

interface DashboardPageProps {
    session: Session
    recentPackages: PackageModel[]
    stats: DashboardStats
    isAdmin?: boolean
}

export default function DashboardPage({ session, stats, recentPackages, isAdmin = false }: DashboardPageProps) {
    const allStats = [
        {
            title: "Paquetes Enviados",
            value: stats.totalPackages,
            icon: Send,
            description: "Total de envíos realizados",
        },
        {
            title: "Paquetes Recibidos",
            value: stats.deliveredPackages,
            icon: Inbox,
            description: "Total de entregas completadas",
        },
        {
            title: "Pendientes",
            value: stats.pendingPackages,
            icon: Clock,
            description: "Paquetes sin procesar aún",
        },
        {
            title: "En Tránsito",
            value: stats.inTransitPackages,
            icon: Package,
            description: "Paquetes en movimiento",
        },
        {
            title: "Total a Recaudar",
            value: stats.totalRevenue,
            icon: DollarSign,
            description: "Ingresos aún por cobrar",
        },
        {
            title: "Total Recaudado",
            value: stats.paidRevenue,
            icon: CheckCircle,
            description: "Pagos recibidos completos",
        },
    ];

    const statCards = isAdmin ? allStats : []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Panel Principal</h1>
                <p className="text-muted-foreground">Bienvenido de vuelta, {session.user.name}</p>
            </div>

            {/* Stats Cards */}
            <div>
                <div className="pb-3">
                    <ToggleGroup type="single" variant="outline">
                        <a href="/dashboard">
                            <ToggleGroupItem value="bold" aria-label="Toggle bold">
                                <Clock className="h-4 w-4" />
                                Todos
                            </ToggleGroupItem>
                        </a>
                        <a href="/dashboard?period=day">
                            <ToggleGroupItem value="italic" aria-label="Toggle italic">
                                <CalendarFold className="h-4 w-4" />
                                Hoy
                            </ToggleGroupItem>
                        </a>
                        <a href="/dashboard?period=week">
                            <ToggleGroupItem value="bold" aria-label="Toggle bold">
                                <Clock className="h-4 w-4" />
                                Semanal
                            </ToggleGroupItem>
                        </a>
                        <a href="/dashboard?period=month">
                            <ToggleGroupItem value="italic" aria-label="Toggle italic">
                                <CalendarFold className="h-4 w-4" />
                                Mensual
                            </ToggleGroupItem>
                        </a>
                        <a href="/dashboard?period=year">
                            <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
                                <CalendarCheck className="h-4 w-4" />
                                Anual
                            </ToggleGroupItem>
                        </a>
                    </ToggleGroup>
                </div>
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
                                        {statusLabels[pkg.status as PackageStatus]}
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
