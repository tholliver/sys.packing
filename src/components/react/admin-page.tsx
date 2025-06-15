import { authClient, useSession } from "@/auth/auth-client"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageList } from "@/components/react/package-list"
import { Users, Package, Clock, CheckCircle } from "lucide-react"
import { apiEndpoints, Tfetcher } from "@/utils"

type DashboardAdminStats = {
    totalUsers: number;
    totalPackages: number;
    pendingPackages: number;
    deliveredPackages: number;
};

export default function AdminPage() {
    const { data: stats, error, isLoading } = useSWR<DashboardAdminStats>(apiEndpoints.packages.list, Tfetcher)
    const { data: session } = useSession()
    // const stats = await getAdminStats()
    const hasPermision = authClient.admin.checkRolePermission({
        permissions: {
            user: ["delete"],
            session: ["revoke"]
        },
        role: "ADMIN",
    })

    const statCards = [
        {
            title: "Total de Usuarios",
            value: stats?.totalUsers,
            icon: Users,
            description: "Usuarios registrados",
        },
        {
            title: "Total de Paquetes",
            value: stats?.totalPackages,
            icon: Package,
            description: "Todos los paquetes en el sistema",
        },
        {
            title: "Paquetes Pendientes",
            value: stats?.pendingPackages,
            icon: Clock,
            description: "Esperando procesamiento",
        },
        {
            title: "Paquetes Entregados",
            value: stats?.deliveredPackages,
            icon: CheckCircle,
            description: "Entregados exitosamente",
        },
    ]

    if (isLoading) {
        return <div>Cargando</div>
    }

    if (error)
        return <div>Error al cargar </div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <p className="text-muted-foreground">Resumen del sistema y gestión</p>
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

            {/* All Packages */}
            <Card>
                <CardHeader>
                    <CardTitle>Todos los Paquetes</CardTitle>
                    <CardDescription>Gestionar todos los paquetes en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <PackageList type="all" userId={session?.user.id!} isAdmin={true} />
                </CardContent>
            </Card>
        </div>
    )
}
