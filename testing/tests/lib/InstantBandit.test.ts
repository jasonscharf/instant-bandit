import fetchMock from "jest-fetch-mock"
import { bandit, conversionRates, maxKey, otherProbabilities } from "../../../lib/bandit"


describe("InstantBandit", () => {
  beforeAll(() => {
    fetchMock.enableMocks()
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  describe("load", () => {
    it("invokes a fetch to load a particular endpoint", async () => {
      // TEST
    })

    it("loads from a site model when passed an object", async () => {
      // TEST
    })

    it("falls back to an absolute default on error", async () => {
      // TEST
    })

    it("does not issue multiple requests for a site", async () => {

    })

    it("does not throw on error for a failed response", async () => {

    })

    it("falls back to an absolute default on error", async () => {
      // TEST
    })
  })

  describe("selection", () => {
    it("invokes a specific algorithm by name", async () => {

    })
  })

  describe("push", () => {
    it("invokes a fetch to POST metrics to the endpoint", async () => {

    })

    it("throws an error if the metrics bucket is malformed", async () => {

    })
  })
})