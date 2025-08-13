
export type StoreId = "nike" | "ae" | "walmart" | "bestbuy" //can add more later

export type StoreDescriptor = {
    id: StoreId
    name: string
    baseUrl: string[]
    enabledByDefault?: boolean
    adapterkey: string //using this for future compatibility, can be used to map to a specific adapter
}

export const STORES: StoreDescriptor[] = [
    {id: "nike", name: "Nike", baseUrl: ["https://www.nike.com/"], enabledByDefault: true, adapterkey: "nike-v1"}
    , {id: "ae", name: "American Eagle", baseUrl: ["https://www.ae.com/"], enabledByDefault: true, adapterkey: "ae-v1"}
    //add more stores later
]