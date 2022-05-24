import { NextApiRequest, NextApiResponse } from "next"
import * as constants from "../../lib/constants"
import { Site } from "../../lib/models"


const DEMO_SITE: Site = {
  name: constants.DEFAULT_SITE_NAME,
  experiments: [
    {
      name: "A",
    },
    {
      name: "B",
    },
    {
      name: "C",
    },
  ]
}

// TODO: Only show subset of props for client via server util method

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(DEMO_SITE)
}
