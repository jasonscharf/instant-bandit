import { NextApiRequest } from "next"
import * as constants from "../../lib/constants"


// TODO: Decouple from Next

/**
 * Returns the site ID and experiment ID for a given request, using the request cookies.
 * If a site ID is not provided, one will be derived from the domain name and added to the store.
 * If an experiment ID is not provided, the default experiment ID will be used.
 * @param req 
 */
export async function getSiteAndExperiment(req: NextApiRequest, throws = false) {
  let siteId = req.cookies[constants.COOKIE_SITE_ID]

  // TODO: Make dev-only
  let experimentId = req.query.experimentId as string ?? req.cookies[constants.COOKIE_EXPERIMENT_ID]

  return [
    siteId,
    experimentId,
  ]
}
