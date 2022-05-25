import * as constants from "./constants"
import { Site } from "./models"


export const DEMO_SITE: Site = {
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
