export interface Product {
    key: string,
    priceHistory: Record<string, number> // key is date of format YYYY-MM-DD
}

// YYYY-MM-DD format
export function getTodayDateString(): string {
    const today = new Date()
    return today.getFullYear() + "-" + (today.getMonth() + 1).toString().padStart(2, "0") + "-" + today.getDate().toString().padStart(2, "0")
}