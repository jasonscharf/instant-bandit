import { Experiment, Site, SiteMeta } from "../lib/models"


export const TEST_EXPERIMENT_A: Experiment = {
  name: "A",
}

export const TEST_EXPERIMENT_B: Experiment = {
  name: "B",
}

export const TEST_SITE_AB: Site = {
  name: "test-ab",
  experiments: [
    TEST_EXPERIMENT_A,
    TEST_EXPERIMENT_B,
  ],
}
