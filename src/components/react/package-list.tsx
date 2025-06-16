import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useDataFetch } from "@/hooks/useDataFetch"
import type { Package as PackageModel } from "@/db/schema"
import { apiEndpoints } from "@/utils"
import type { PackageStatus } from "@/types"

interface PackageListProps {
    type: "sent" | "received" | "all"
    userId: string
    isAdmin?: boolean
}

const statusConfig: Record<PackageStatus, {
    icon: React.ComponentType<any>;
    color: string;
    label: string;
}> = {
    pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
    in_transit: { icon: Truck, color: "bg-blue-100 text-blue-800", label: "En Tránsito" },
    delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Entregado" },
    failed: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Fallido" },
};

export function PackageList({ type, userId, isAdmin = false }: PackageListProps) {
    const [statusFilter, setStatusFilter] = useState("all")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedPackage, setSelectedPackage] = useState<PackageModel | null>(null)
    const [newStatus, setNewStatus] = useState("")
    const [statusNotes, setStatusNotes] = useState("")
    const [updating, setUpdating] = useState(false)

    const { data: packages, isLoading, error } = useDataFetch<PackageModel>({
        endpoint: apiEndpoints.packages.list,
        defaultFilters: {
            page: 1,
            limit: 10,
            type: 'all',
            status: 'all',
        },
    })

    const handleStatusUpdate = async () => {
        if (!selectedPackage || !newStatus) return

        try {
            setUpdating(true)
            const response = await fetch(`/api/packages/${selectedPackage.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: statusNotes,
                }),
            })

            if (!response.ok) throw new Error("Error al actualizar el estado")

            toast.success("Estado actualizado", {
                description: "El estado del paquete se ha actualizado correctamente",
            })

            setSelectedPackage(null)
            setNewStatus("")
            setStatusNotes("")
        } catch (error) {
            toast("Error", {
                description: "Error al actualizar el estado del paquete",
            })
        } finally {
            setUpdating(false)
        }
    }

    const canUpdateStatus = (pkg: PackageModel) => {
        return isAdmin || pkg.createdBy === userId
    }

    if (isLoading) {
        return <div className="text-center py-8">Cargando paquetes...</div>
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_transit">En Tránsito</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="failed">Fallido</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Package List */}
            <div className="space-y-4">
                {packages.map((pkg) => {
                    const StatusIcon = statusConfig[pkg.status as PackageStatus].icon

                    return (
                        <Card key={pkg.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{pkg.description}</h3>
                                            <Badge className={statusConfig[pkg.status as PackageStatus].color}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusConfig[pkg.status as PackageStatus].label}
                                            </Badge>
                                        </div>

                                        {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}

                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                <strong>Seguimiento:</strong> {pkg.trackingNumber}
                                            </p>
                                            <p>
                                                <strong>{pkg.senderFullName + pkg.recipientFullName}:</strong>
                                            </p>
                                            <p>
                                                <strong>Creado:</strong> {new Date(pkg.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {canUpdateStatus(pkg) && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPackage(pkg)
                                                            setNewStatus(pkg.status)
                                                        }}
                                                    >
                                                        Actualizar Estado
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Actualizar Estado del Paquete</DialogTitle>
                                                        <DialogDescription>Actualizar el estado del paquete: {pkg.description}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Estado</Label>
                                                            <Select value={newStatus} onValueChange={setNewStatus}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pendiente</SelectItem>
                                                                    <SelectItem value="in_transit">En Tránsito</SelectItem>
                                                                    <SelectItem value="delivered">Entregado</SelectItem>
                                                                    <SelectItem value="failed">Fallido</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Notas (Opcional)</Label>
                                                            <Textarea
                                                                value={statusNotes}
                                                                onChange={(e) => setStatusNotes(e.target.value)}
                                                                placeholder="Agregar notas sobre este cambio de estado..."
                                                                maxLength={200}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={handleStatusUpdate} disabled={updating}>
                                                                {updating ? "Actualizando..." : "Actualizar Estado"}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedPackage(null)
                                                                    setNewStatus("")
                                                                    setStatusNotes("")
                                                                }}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {packages.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No se encontraron paquetes para los filtros seleccionados.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {
                totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Anterior
                        </Button>
                        <span className="flex items-center px-4">
                            Página {page} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )
            }
        </div >
    )
}
