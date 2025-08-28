import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { StoreId } from "~lib/stores"
import { getRecordByKey, type StoreDef } from "~lib/useDB"
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    // Should remove this, and not require this argument in the future
    // Also this only works for Nike I guess
    const STORE_NAME: StoreId = "nike"
    const STORE_INFO: StoreDef = {
        keyPath: "key",
        indexes: [
            { name: "groupKey", keyPath: "groupKey", unique: false },
            { name: "productCode", keyPath: "productCode", unique: true }
        ]
    }
    
    const item = await getRecordByKey(STORE_NAME, STORE_INFO, req.body.key)
    debugger
 
    res.send({ item })
}

export default handler