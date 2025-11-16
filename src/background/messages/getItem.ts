import type { PlasmoMessaging } from "@plasmohq/messaging"

import { ScraperDB } from "~lib/db/scraperDB"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const db = new ScraperDB(req.body?.spec)
  await db.init()
  const item = await db.getProductByKey(req.body?.key)
  console.log(item)

  res.send({ item })
}

export default handler
