export function formatCurrency(amount: string | number): string {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return `Bs. ${num.toFixed(2)}`
}


