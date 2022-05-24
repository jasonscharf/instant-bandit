/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

import { Debug } from "../../components/InstantBanditDebug"
import { InstantBandit } from "../../components/InstantBandit"
import { InstantBanditLoadState, InstantBanditState } from "../../lib/contexts"
import { defined } from "../../lib/utils"
import { renderTest } from "../test-utils"
import { TEST_SITE_AB } from "../configs"


declare var fetch: Promise<Response> & FetchMock

describe("InstantBandit component", () => {

  beforeAll(() => {
    fetchMock.enableMocks()
  })

  beforeEach(() => {
    sessionStorage.clear()
    fetchMock.resetMocks()
  })

  describe("onReady", () => {
    it("calls the onReady callback", async () => {
      let calls = 0
      fetch.mockResponseOnce(async (init) => await JSON.stringify(TEST_SITE_AB))

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

    it("invokes a fetch for the experiments", async () => {
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
            expect(bandit.state).toStrictEqual(InstantBanditLoadState.WAIT)
          }} />
        </InstantBandit>
      )
    })

    it("allows overriding the selection via the 'force' option", async () => {
      // TODO: TEST
    })

    it("falls back to the site 'select field' experiment if the 'force' option is invalid", async () => {
      // TODO: TEST
    })
  })

  describe("selection", () => {
    it("performs selection even if initial fetch fails", async () => {
      fetch.mockResponseOnce(() => Promise.reject(new Error("DUMMY")))

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
            expect(bandit.state).toStrictEqual(InstantBanditLoadState.WAIT)
          }} />
        </InstantBandit>
      )

      const banditState = erroredState as InstantBanditState
      expect(error instanceof Error).toBe(true)
      expect(banditState.error).toStrictEqual(error)
      expect(defined(banditState)).toBe(true)
      expect(defined(banditState.experiment)).toBe(true)
      expect(banditState.experiment?.name.length).toBeGreaterThan(0)
    })

    it("falls back to a self-selection if the 'select field' experiment if the 'force' option is invalid", async () => {
      // TODO: TEST
    })

    it("selects the experiment specified in the model if the select field is populated", async () => {
      // TODO: TEST
    })

    it("selects a variant specified in the model if the select field doesn't match an experiment", async () => {
      // TODO: TEST
    })

    it("selects the indicated experiment even if its probability is 0", async () => {
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

  describe("JSX experiment declarations", () => {
    it("warns when an unknown experiment registers", async () => {
      // TODO: TEST
    })
  })

  describe("metrics", () => {
    it("pushes metrics to the server when an experiment is presented", async () => {
      // TODO: TEST
    })
  })

  describe("scope", () => {
    it("provides the experiment to children via context", async () => {
      fetch.mockResponseOnce(async () => {
        return JSON.stringify(TEST_SITE_AB)
      })

      let gotExperiment = false
      const component = await renderTest(
        <InstantBandit>
          <Debug onEffect={({ bandit }) => {
            if (!defined(bandit.experiment)) return

            gotExperiment = true
            expect(defined(bandit.experiment)).toBe(true)
            expect(bandit.experiment!.name.length).toBeGreaterThan(0)
          }} />
        </InstantBandit>
      )

      expect(gotExperiment).toBe(true)
    })
  })
})
