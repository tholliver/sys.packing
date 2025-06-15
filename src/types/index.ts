
// --------------------  PACKINGS -----------------------
export type Status = 'pending' | 'in_transit' | 'delivered' | 'failed';

export const statusLabels: Record<Status, string> = {
    pending: "Pendiente",
    in_transit: "En Tránsito",
    delivered: "Entregado",
    failed: "Fallido",
};
