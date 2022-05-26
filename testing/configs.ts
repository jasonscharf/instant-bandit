import { Variant, Site, SiteMeta } from "../lib/models"


export const TEST_VARIANT_A: Variant = {
  name: "A",
}

export const TEST_VARIANT_B: Variant = {
  name: "B",
}

export const TEST_SITE_AB: Site = {
  name: "test-ab",
  variants: [
    TEST_VARIANT_A,
    TEST_VARIANT_B,
  ],
}
