import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ScraperDB } from "~lib/db/scraperDB"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // Should remove this, and not require this argument in the future
  // Also this only works for Nike I guess
  const db = new ScraperDB(req.body?.spec)
  const item = await db.getProductByKey(req.body?.key)

  res.send({ item })
}

export default handler
