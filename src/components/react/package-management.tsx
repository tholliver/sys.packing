import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Search,
    Filter,
    PackageIcon,
    RefreshCw,
    Download,
    Plus,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react"
import { LoadingSpinner, LoadingOverlay } from "@/components/react/loading-spinner"
import { ErrorBoundary } from "@/components/react/error-boundary"
import { formatCurrency } from "@/utils/ui"
import type { PackageFilters, PackageStatus } from "@/types"
import { format } from "@formkit/tempo"
import { useDataFetch, useMutation } from "@/hooks/useDataFetch"
import { apiEndpoints } from "@/utils"
import type { Package } from "@/db/schema"

function PackageStatusBadge({ status }: { status: PackageStatus }) {
    const configs = {
        pending: {
            label: "Pendiente",
            variant: "secondary" as const,
            icon: Clock,
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        },
        in_transit: {
            label: "En Tránsito",
            variant: "default" as const,
            icon: PackageIcon,
            className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        },
        delivered: {
            label: "Entregado",
            variant: "default" as const,
            icon: CheckCircle,
            className: "bg-green-100 text-green-800 hover:bg-green-100",
        },
        failed: {
            label: "Fallido",
            variant: "destructive" as const,
            icon: XCircle,
            className: "",
        },
    }

    const config = configs[status]
    const Icon = config.icon

    return (
        <Badge variant={config.variant} className={config.className}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    )
}

function PackageManagementContent() {
    /*    const { packages, pagination, loading, error, stats, fetchPackages, updatePackageStatus, clearError, refreshStats } =
           usePackages() */

    const { data: packages, error, filters, isLoading, updateFilter, pagination, refetch, clearFilters } = useDataFetch<Package>({ endpoint: apiEndpoints.packages.list })
    const { mutate, loading: isMutating, error: errorMurating } = useMutation({ endpoint: apiEndpoints.packages.update })
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    // Debounced search
    const [searchInput, setSearchInput] = useState("")
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilter('search', searchInput)
            setCurrentPage(1)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput])

    // Fetch packages when filters change
    const handleStatusUpdate = useCallback(
        async (id: string, status: PackageStatus) => {
            const mutationResponse = await mutate({ status }, id)
            if (mutationResponse?.success) {
                refetch()
            }
        }, [mutate]);

    const handleFilterChange = useCallback(() => {
        // function body
    }, []);

    const handleRefresh = useCallback(() => {
        // function body
    }, []);

    /*    const statsCards = useMemo(
           () => [
               {
                   title: "Total Paquetes",
                   value: stats.total || 0,
                   icon: PackageIcon,
                   color: "text-blue-600",
               },
               {
                   title: "Pendientes",
                   value: stats.pending || 0,
                   icon: Clock,
                   color: "text-yellow-600",
               },
               {
                   title: "En Tránsito",
                   value: stats.in_transit || 0,
                   icon: PackageIcon,
                   color: "text-blue-600",
               },
               {
                   title: "Entregados",
                   value: stats.delivered || 0,
                   icon: CheckCircle,
                   color: "text-green-600",
               },
           ],
           [stats],
       ) */

    return (
        <div className="space-y-6 relative">
            {isLoading && <LoadingOverlay text="Cargando paquetes..." />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Paquetes</h1>
                    <p className="text-muted-foreground">Sistema de administración y seguimiento de paquetes</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Actualizar
                    </Button>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Paquete
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button variant="outline" size="sm" onClick={() => { }}>
                            Cerrar
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros y Búsqueda</CardTitle>
                    <CardDescription>Busca y filtra paquetes por diferentes criterios</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número de seguimiento, nombre o descripción..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={filters.status || "all"} onValueChange={(value) => updateFilter('status', value)}>
                            <SelectTrigger className="w-48">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="in_transit">En Tránsito</SelectItem>
                                <SelectItem value="delivered">Entregados</SelectItem>
                                <SelectItem value="failed">Fallidos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Packages Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Paquetes
                        {pagination && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({pagination.total} total, página {pagination.currentPage} de {pagination.totalPages})
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>Lista completa de paquetes con información detallada</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seguimiento</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Remitente</TableHead>
                                    <TableHead>Destinatario</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Peso</TableHead>
                                    <TableHead>Costo</TableHead>
                                    <TableHead>Pagado</TableHead>
                                    <TableHead>Actualizado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <PackageIcon className="h-8 w-8" />
                                                <p>
                                                    {filters.search || filters.status !== "all"
                                                        ? "No se encontraron paquetes con los filtros aplicados"
                                                        : "No hay paquetes registrados"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    packages.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-mono font-medium">{pkg.trackingNumber}</TableCell>
                                            <TableCell>
                                                <PackageStatusBadge status={pkg.status as PackageStatus} />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{pkg.senderFullName}</div>
                                                    {pkg.senderPhone && <div className="text-sm text-muted-foreground">{pkg.senderPhone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{pkg.recipientFullName}</div>
                                                    {pkg.recipientPhone && (
                                                        <div className="text-sm text-muted-foreground">{pkg.recipientPhone}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm max-w-32 truncate" title={pkg.officeRecipientAddress}>
                                                    {pkg.officeRecipientAddress}
                                                </div>
                                            </TableCell>
                                            <TableCell>{pkg.weight} kg</TableCell>
                                            <TableCell>{formatCurrency(pkg.totalCost)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={pkg.isPaid ? "default" : "secondary"}
                                                    className={pkg.isPaid ? "bg-green-100 text-green-800" : ""}
                                                >
                                                    {pkg.isPaid ? "Sí" : "No"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{format(pkg.updatedAt, 'short')}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {pkg.status === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(pkg.id, "in_transit")}
                                                            disabled={isLoading}
                                                        >
                                                            En Tránsito
                                                        </Button>
                                                    )}
                                                    {pkg.status === "in_transit" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusUpdate(pkg.id, "delivered")}
                                                            disabled={isLoading}
                                                            className="bg-green-50 hover:bg-green-100"
                                                        >
                                                            Entregar
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination?.totalPages && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, pagination.total)} de{" "}
                                {pagination?.total} paquetes
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(pagination?.totalPages!, prev + 1))}
                                    disabled={currentPage === pagination?.totalPages || isLoading}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function PackageManagementEnterprise() {
    return (
        <ErrorBoundary>
            <PackageManagementContent />
        </ErrorBoundary>
    )
}
