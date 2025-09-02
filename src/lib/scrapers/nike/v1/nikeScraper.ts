import { getTodayDateString } from "~lib/common"
import { NikeDB } from "~lib/db/nikeDB"

export default async function scrapeToDB() {
  const nikeDB = new NikeDB()

  const baseUrl: string =
    "https://api.nike.com/discover/product_wall/v1/marketplace/CA/language/en-GB/consumerChannelId/d9a5bc42-4b9c-4976-858a-f159cf99c647"
  const baseParams: Record<string, any> = {
    path: "/ca/w",
    queryType: "PRODUCTS",
    anchor: 0,
    count: 100,
  }

  let count = baseParams.count

  // TO-DO: Modify the scraper so that it uses the totalProducts number instead of going until 400
  for (let anchor = 0; anchor < Infinity; anchor += count) {
    const params: Record<string, any> = {
      ...baseParams,
      anchor: anchor,
      count: count,
    }

    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${baseUrl}?${queryString}`
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: { "nike-api-caller-id": "nike:dotcom:browse:wall.client:2.0" },
    })

    if (response.status === 400) {
      break
    }

    const data = await response.json()

    for (const group of data?.productGroupings ?? []) {
      for (const product of group?.products ?? []) {
        const productData = await nikeDB.getProductByKey(product?.globalProductId)
        await nikeDB.addOrUpdateProduct({
          key: product?.globalProductId,
          priceHistory: {
            ...productData?.priceHistory,
            [getTodayDateString()]: product?.prices?.currentPrice,
          },
          groupKey: product?.groupKey,
          productCode: product?.productCode,
          link: product?.pdpUrl?.url,
        })
      }
    }
  }
}
