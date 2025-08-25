// YYYY-MM-DD format
export function getDateString(): string {
    const today = new Date()
    return today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
}