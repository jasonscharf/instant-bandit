import { NextApiRequest, NextApiResponse } from "next"
import { DEMO_SITE } from "../../lib/examples"
import { InstantBanditClient } from "../../lib/InstantBandit"



// TODO: Only show subset of props for client via server util method
// TODO: Notes about CORS
// TODO: Whitelist the IB headers, remove Authorization

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  )

  const client = new InstantBanditClient()
  const site = await client.select(DEMO_SITE)
  res.status(200).json(site)
}
