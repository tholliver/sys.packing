
// --------------------  PACKINGS -----------------------
export type PackageStatus = 'pending' | 'in_transit' | 'delivered' | 'failed';
export type PackageType = "standard" | "express" | "fragile" | "documents"
export type Priority = "standard" | "high" | "urgent"

export const statusLabels: Record<PackageStatus, string> = {
    pending: "Pendiente",
    in_transit: "En Tránsito",
    delivered: "Entregado",
    failed: "Fallido",
};

export interface PackageFilters {
    status?: PackageStatus | "all"
    search?: string
    dateFrom?: string
    dateTo?: string
    isPaid?: boolean
    isFragile?: boolean
    packageType?: PackageType
    priority?: Priority
}
