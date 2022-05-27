import fetchMock from "jest-fetch-mock"

import * as constants from "../../../lib/constants"
import { InstantBanditClient, TIMESTAMP_PARAM_NAME } from "../../../lib/InstantBandit"
import { TEST_SITE_AB } from "../../configs"


describe("InstantBandit", () => {
  beforeAll(() => {
    fetchMock.enableMocks()
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  let url: URL | null
  let fetched = 0
  beforeEach(async () => {
    fetched = 0
    url = null

    fetchMock.mockResponseOnce(async req => {
      url = new URL(req.url)
      ++fetched
      return JSON.stringify(TEST_SITE_AB)
    })
  })

  describe("load", () => {
    it("invokes a fetch for the data", async () => {
      await new InstantBanditClient().load()
      expect(fetched).toBe(1)
      expect(url).toBeDefined()
      expect(url?.toString()).toContain(constants.DEFAULT_BASE_URL)
    })

    it("produces a site object", async () => {
      const bandit = new InstantBanditClient()
      const site = await bandit.load()
      expect(site).toBeDefined()
      expect(site).toBeInstanceOf(Object)
      expect(bandit.state).toBe("")
      expect(bandit).toBeDefined()
      expect(bandit.origin).toStrictEqual(location.origin)
      expect(url?.toString()).toContain(constants.DEFAULT_BASE_URL)
    })

    it("does not include a timestamp by default", async () => {
      new InstantBanditClient().load()
      expect(fetched).toBe(1)
      expect(url).toBeDefined()
      expect(url).toContain(constants.DEFAULT_BASE_URL)
    })

    it("includes a timestamp for manual cache-punching if specified", async () => {
      new InstantBanditClient({ appendTimestamp: true }).load()
      expect(fetched).toBe(1)
      expect(url!.searchParams.get(TIMESTAMP_PARAM_NAME)).not.toBeDefined()
    })

    it("falls back to the invariant on error", async () => {
      let threw = false
      fetchMock.mockResponseOnce(async req => {
        threw = true
        throw new Error("INTENTIONAL")
      })

      const bandit = new InstantBanditClient()
      const site = await bandit.load()

      expect(site).toBeDefined()
      expect(site.name).toBe(constants.DEFAULT_SITE_NAME)
      expect(site.variants).toBeDefined()
    })

    it("does not throw an error for a failed response", async () => {

    })

    it("can load in another site block with no error", async () => {
      // ... will need to update the global context
    })
  })

  describe("selection", () => {
    describe("client-side", () => {
      it("invokes a specific algorithm by name", async () => {
        // ... 
      })
    })

    describe("internal", () => {
      it("loads ", async () => {
      })
    })
  })

  describe("push", () => {
    it("invokes a fetch to POST metrics to the endpoint", async () => {

    })

    it("throws an error if the metrics bucket is malformed", async () => {

    })
  })

  describe("sessions", () => {
    it("can create a new session client-side", async () => {
      // ... it's possible booth up with a cached or static site config block
      // ... the server should issue a session as soon as it sees a request with no session ID
    })

    it("")

    // TODO: Test upsert
  })
})