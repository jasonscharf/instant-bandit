import { NextApiRequest, NextApiResponse } from "next"
import * as constants from "../../lib/constants"
import { Site } from "../../lib/models"


/**
 * This endpoint is just an example that returns some statically defined experiments defined for
 * the given site.
 * 
 * In practice, the Site JSON should come from an external system such as a GraphQL API or
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {

  // Pull the origin and desired expirement from the origin and safe header
  res.status(200).json({})
}
