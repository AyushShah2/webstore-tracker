import type { PlasmoMessaging } from "@plasmohq/messaging"
import { NikeDB } from "~lib/db/nikeDB"
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    // Should remove this, and not require this argument in the future
    // Also this only works for Nike I guess
    const nikeDB = new NikeDB()
    const item = await nikeDB.getProductByKey(req.body?.key)
 
    res.send({ item })
}

export default handler