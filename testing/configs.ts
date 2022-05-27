import { Variant, Site } from "../lib/models"


export const TEST_VARIANT_A: Variant = {
  name: "A",
  metrics: {
    prob: 0.5,
    exposures: 0,
    clicks: 0,
  },
}

export const TEST_VARIANT_B: Variant = {
  name: "B",
  metrics: {
    prob: 0.5,
    exposures: 0,
    clicks: 0,
  },
}

export const TEST_SITE_A: Site = {
  name: "test-a",
  variants: [
    TEST_VARIANT_A,
  ],
}

export const TEST_SITE_B: Site = {
  name: "test-b",
  variants: [
    TEST_VARIANT_B,
  ],
}

export const TEST_SITE_AB: Site = {
  name: "test-ab",
  variants: [
    TEST_VARIANT_A,
    TEST_VARIANT_B,
  ],
}
