import Browser from 'webextension-polyfill';
import { type StoreId } from '~lib/stores';
import { addOrUpdateProduct, getRecordByKey, type StoreDef } from '../../useDB';

export async function main() {

    let today = new Date();
    let formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(); //YYYY-MM-DD format
    
    const STORE_NAME: StoreId = 'nike';
    const STORE_INFO: StoreDef = {
        keyPath: 'globalProductId',
        indexes: [
            { name: 'groupKey', keyPath: 'groupKey', unique: false },
            { name: 'productCode', keyPath: 'productCode', unique: true },
            { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false },
        ]
    };

    const storageKeyValue = {lastScraped: formattedDate, isActive: true}
    await Browser.storage.local.set({[STORE_NAME]: storageKeyValue});

    const startTime = today.getTime();
    const baseUrl: string = "https://api.nike.com/discover/product_wall/v1/marketplace/CA/language/en-GB/consumerChannelId/d9a5bc42-4b9c-4976-858a-f159cf99c647"
    const baseParams: Record<string, any> = {
        path: '/ca/w',
        queryType: 'PRODUCTS',
        anchor: 0,
        count: 100
    };

    let queryString = new URLSearchParams(baseParams).toString();
    let fullUrl = `${baseUrl}?${queryString}`;
    let response = await fetch(fullUrl, {method: 'GET', headers: { "nike-api-caller-id": "nike:dotcom:browse:wall.client:2.0" }});
    
    let data = await response.json();
    let count = baseParams.count;
    
    for(let anchor = 0; anchor < Infinity; anchor += count) {
        let params: Record<string, any> = {
            ...baseParams,
            anchor: anchor,
            count: count
        };
        
        queryString = new URLSearchParams(params).toString();
        fullUrl = `${baseUrl}?${queryString}`;
        response = await fetch(fullUrl, {method: 'GET', headers: { "nike-api-caller-id": "nike:dotcom:browse:wall.client:2.0" }});

        if (response.status === 400) {
            break;
        }

        data = await response.json();

        for (const group of (data?.productGroupings ?? [])) {
            for (const product of (group?.products ?? [])) {
                const productData = await getRecordByKey(STORE_NAME, STORE_INFO, product?.globalProductId);
                if (!(productData?.lastUpdated === formattedDate)) {
                    await addOrUpdateProduct(STORE_NAME, STORE_INFO, STORE_INFO.keyPath, {
                        globalProductId: product?.globalProductId,
                        groupKey: product?.groupKey,
                        productCode: product?.productCode,
                        priceHistory: {...productData?.priceHistory, [formattedDate]: product?.prices?.currentPrice},
                        lastUpdated: formattedDate
                    });
                }
            }
        }
    }
    const elapsedTime = new Date().getTime() - startTime;
    console.log(`Time taken: ${(elapsedTime / 1000).toFixed(2)} seconds`);
}

main().catch(console.error);
