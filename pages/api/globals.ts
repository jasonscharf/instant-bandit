import { NextApiRequest } from "next"
import * as constants from "../../lib/constants"


/**
 * Returns the site and variant for a given request, using the request cookies.
 * If a site is not provided, one will be derived from the domain name and added to the store.
 * If a variant is not provided, the default variant will be used.
 * @param req 
 */
export async function getSiteAndVariant(req: NextApiRequest, throws = false) {
  const site = req.query.site as string
  const variant = req.query.variant as string

  return [
    site,
    variant,
  ]
}
