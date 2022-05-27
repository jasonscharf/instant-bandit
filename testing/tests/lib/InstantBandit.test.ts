import fetchMock from "jest-fetch-mock"

import * as constants from "../../../lib/constants"
import { DEFAULT_BANDIT_OPTS, FALLBACK_SITE, InstantBanditClient, PARAM_TIMESTAMP } from "../../../lib/InstantBandit"
import { AlgorithmImpl, AlgorithmResults, LoadState, SelectionArgs } from "../../../lib/types"
import { siteErrorResponse, siteLoadResponse } from "../../test-utils"
import { TEST_SITE_A, TEST_SITE_AB, TEST_SITE_B } from "../../configs"
import { InstantBanditState } from "../../../lib/contexts"
import { defined } from "../../../lib/utils"


describe("InstantBandit", () => {
  let url: URL | null = null
  let fetched = 0

  beforeAll(() => {
    fetchMock.enableMocks()
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  beforeEach(async () => {
    fetched = 0
    url = null

    fetchMock.mockResponse(async req => {
      url = new URL(req.url)
      ++fetched
      return JSON.stringify(TEST_SITE_AB)
    })
  })

  describe("initialization", () => {
    it("invokes a fetch for the data", async () => {
      await new InstantBanditClient().load()
      expect(fetched).toBe(1)
      expect(url).toBeDefined()
      expect(url?.toString()).toContain(constants.DEFAULT_BASE_URL)
    })

    it("produces a site object", async () => {
      const bandit = new InstantBanditClient()
      const site = await bandit.load()
      expect(url?.toString()).toContain(constants.DEFAULT_BASE_URL)
      expect(site).toBeDefined()
      expect(site).toBeInstanceOf(Object)
      expect(bandit.state).toBe(LoadState.READY)
      expect(bandit).toBeDefined()

      // Jest runs in node, so we get the default origin
      expect(bandit.origin).toStrictEqual(constants.DEFAULT_ORIGIN)
    })

    it("does not include a timestamp by default", async () => {
      await new InstantBanditClient().load()
      expect(fetched).toBe(1)
      expect(url).toBeDefined()
      expect(url!.searchParams.get(PARAM_TIMESTAMP)).toBe(null)
    })

    it("includes a timestamp for manual cache-punching if specified", async () => {
      await new InstantBanditClient({ appendTimestamp: true }).load()

      expect(fetched).toBe(1)
      expect(url).toBeDefined()

      const ts = url!.searchParams.get(PARAM_TIMESTAMP)
      expect(ts).toBeDefined()
      expect(parseInt(ts + "")).toBeGreaterThan(0)
    })

    it("falls back to the invariant on error", async () => {
      let threw = false
      fetchMock.mockResponseOnce(async req => {
        threw = true
        throw new Error("INTENTIONAL")
      })

      const bandit = new InstantBanditClient()
      const site = await bandit.load()

      expect(threw).toBe(true)
      expect(site).toBeDefined()
      expect(site.name).toBe(constants.DEFAULT_SITE_NAME)
      expect(site.variants).toBeDefined()
    })

    it("can load another site with no error", async () => {
      const bandit = new InstantBanditClient()
      const a = TEST_SITE_A
      const b = TEST_SITE_B

      fetchMock.mockResponseOnce(siteLoadResponse(a))
      const site1 = await bandit.load()
      expect(bandit.site?.name).toBe(a.name)

      fetchMock.mockResponseOnce(siteLoadResponse(b))
      const site2 = await bandit.load()
      expect(bandit.site?.name).toBe(b.name)
    })
  })

  describe("selection", () => {
    describe("client-side", () => {
      it("invokes a specific algorithm", async () => {
        class DummyAlgo implements AlgorithmImpl {
          async select(args: SelectionArgs) {
            return {
              metrics: {},
              pValue: 0,
              winner: null as any,
              selection: null,
            }
          }
        }
        const dummyResults: AlgorithmResults = {
          metrics: {},
          pValue: 0,
          winner: null as any,
        }

        const bandit = new InstantBanditClient({
          algorithms: {
            [DEFAULT_BANDIT_OPTS.defaultAlgo]: () => new DummyAlgo(),
          },
        })
      })
    })
  })

  describe("selection", () => {
    it("performs selection on the fallback if initial fetch fails", async () => {
      fetchMock.mockResponseOnce(siteErrorResponse())

      const bandit = new InstantBanditClient()
      await bandit.load()

      expect(bandit.state).toBe(LoadState.READY)
      expect(bandit.error instanceof Error).toBe(true)
      expect(bandit.site).toEqual(FALLBACK_SITE)


      expect(defined(bandit.variant) !== null).toBe(true)
      expect(bandit.variant!.name.length).toBeGreaterThan(0)
      expect(bandit.variant!.name).toEqual(FALLBACK_SITE.variants[0].name)
    })

    it("falls back to a self-selection if the variant cannot be found", async () => {
      // TODO: TEST
    })

    it("selects the variant specified in the model if the select field is populated", async () => {
      // TODO: TEST
    })

    it("selects a variant specified in the model if the select field doesn't match an variant", async () => {
      // TODO: TEST
    })

    it("selects the indicated variant even if its probability is 0", async () => {
      // TODO: TEST
    })

    it("respects pre-configured probabilities in whatever model it is given", async () => {
      // TODO: TEST
    })

    it("rebalances probabilities before selection when the total probability is < 0", async () => {
      // TODO: TEST
    })
  })

  describe("metrics", () => {
    it("invokes a fetch to POST metrics to the endpoint", async () => {

    })
  })

  describe("sessions", () => {
    it("can create a new session client-side", async () => {
      // ... it's possible booth up with a cached or static site config block
      // ... the server should issue a session as soon as it sees a request with no session ID
    })

    it("can store a session", async () => {

    })

    // TODO: Test upsert
  })
})