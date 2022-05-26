/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

import { Debug } from "../../../components/InstantBanditDebug"
import { InstantBandit } from "../../../components/InstantBandit"
import { LoadState, InstantBanditState } from "../../../lib/contexts"
import { defined } from "../../../lib/utils"
import { disableJestLogging, renderTest } from "../../test-utils"
import { TEST_SITE_AB } from "../../configs"


declare const fetch: Promise<Response> & FetchMock

describe("InstantBandit component", () => {

  beforeAll(() => {
    disableJestLogging()
    fetchMock.enableMocks()

    fetch.mockResponse(async (init) => await JSON.stringify(TEST_SITE_AB))
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  beforeEach(() => {
    sessionStorage.clear()
  })

  describe("onReady", () => {
    it("calls the onReady callback", async () => {
      let calls = 0

      // NOTE: Can't assign type here or shows an error. TS 4.3.2.
      let readyState
      await renderTest(
        <InstantBandit onReady={state => {
          readyState = state
          ++calls
        }} />
      )
      expect(calls).toStrictEqual(1)
      expect(defined(readyState)).toBe(true)
    })

    it("only calls the onReady callback once", async () => {
      let calls = 0
      fetch.mockResponseOnce(async (init) => await JSON.stringify(TEST_SITE_AB))

      const component = await renderTest(
        <>
          <InstantBandit onReady={() => ++calls} />
        </>
      )
      expect(calls).toStrictEqual(1)
    })
  })

  describe("initialization", () => {
    it("invokes a fetch for the the default config", async () => {
      let calls = 0
      fetch.mockResponseOnce(async (init) => {
        ++calls
        return await JSON.stringify(TEST_SITE_AB)
      })

      const component = await renderTest(<InstantBandit />)
      expect(calls).toStrictEqual(1)
    })

    it("invokes a fetch for the variants", async () => {
      let calls = 0
      fetch.mockResponseOnce(async (init) => {
        ++calls
        return await JSON.stringify(TEST_SITE_AB)
      })

      const component = await renderTest(<InstantBandit />)
      expect(calls).toStrictEqual(1)
    })

    it("should not invoke multiple load requests when mounted multiple times", async () => {
      let calls = 0
      fetch.mockResponses(async (init) => {
        ++calls
        return await JSON.stringify(TEST_SITE_AB)
      })

      const component = await renderTest(
        <div>
          <InstantBandit />
          <InstantBandit />
          <InstantBandit />
        </div>
      )

      expect(calls).toStrictEqual(1)
    })

    it("renders child components during initialization", async () => {
      const component = await renderTest(
        <InstantBandit>
          <Debug onFirstEffect={({ bandit }) => {
            expect(bandit.state).toStrictEqual(LoadState.WAIT)
          }} />
        </InstantBandit>
      )
    })

    it("allows overriding the selection via the 'force' option", async () => {
      // TODO: TEST
    })

    it("falls back to the site 'select field' variant if the 'force' option is invalid", async () => {
      // TODO: TEST
    })
  })

  describe("selection", () => {
    it("performs selection even if initial fetch fails", async () => {
      fetch.mockResponseOnce(() => Promise.reject(new Error("FAKE-ERROR")))

      // TODO: Find out why adding types here breaks the code underneath
      let erroredState, error
      const component = await renderTest(
        <InstantBandit onError={(err, state) => {
          error = err
          erroredState = state
        }}>
          <Debug onFirstEffect={({ bandit }) => {

            // If an error is received, IB will move to the ready state in order to load
            // the invariant as a fallback
            expect(bandit.state).toStrictEqual(LoadState.WAIT)
          }} />
        </InstantBandit>
      )

      const banditState = erroredState as InstantBanditState
      expect(error instanceof Error).toBe(true)
      expect(banditState.error).toStrictEqual(error)
      expect(defined(banditState)).toBe(true)
      expect(defined(banditState.variant)).toBe(true)
      expect(banditState.variant?.name.length).toBeGreaterThan(0)
    })

    it("falls back to a self-selection if the 'select field' variant if the 'force' option is invalid", async () => {
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

    it("gives the 'force' prop priority over the select field", async () => {
      // TODO: TEST
    })

    it("respects pre-configured probabilities in whatever model it is given", async () => {
      // TODO: TEST
    })

    it("rebalances probabilities before selection when the total probability is < 0", async () => {
      // TODO: TEST
    })
  })

  describe("JSX variant declarations", () => {
    it("warns when an unknown variant registers", async () => {
      // TODO: TEST
    })
  })

  describe("metrics", () => {
    it("pushes metrics to the server when an variant is presented", async () => {
      // TODO: TEST
    })
  })

  describe("scope", () => {
    it("provides the variant to children via context", async () => {
      fetch.mockResponseOnce(async () => {
        return JSON.stringify(TEST_SITE_AB)
      })

      let gotVariant = false
      const component = await renderTest(
        <InstantBandit>
          <Debug onEffect={({ bandit }) => {
            if (!defined(bandit.variant)) return

            gotVariant = true
            expect(defined(bandit.variant)).toBe(true)
            expect(bandit.variant!.name.length).toBeGreaterThan(0)
          }} />
        </InstantBandit>
      )

      expect(gotVariant).toBe(true)
    })
  })
})
